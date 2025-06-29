import uuid
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models.conversation import Conversation, EmailDetails
from models.message import Message
from schemas.email_assistant import (
    EmailAssistantRequest,
    EmailAssistantResponse,
    EmailConfirmationRequest,
    EmailRevisionRequest,
    ConversationHistory,
    EmailDetailsResponse,
    ExtractedEmailDetails,
    FollowUpQuestion
)
from common.email_assistant_ai import (
    extract_email_details,
    generate_follow_up_questions,
    generate_intelligent_email,
    revise_email,
    identify_missing_fields,
    is_ready_for_generation
)

router = APIRouter()


@router.post("/assistant/chat", response_model=EmailAssistantResponse)
async def chat_with_assistant(
    request: EmailAssistantRequest,
    db: Session = Depends(get_db)
):
    """Main conversation endpoint for the intelligent email assistant"""
    try:
        # Extract email details from user message
        extracted_data = extract_email_details(request.user_message)
        
        # Store user message
        user_message = Message(
            conversation_id=request.conversation_id,
            message_type="user",
            content=request.user_message
        )
        db.add(user_message)
        
        # Check if conversation already exists
        existing_conversation = db.query(Conversation).filter(
            Conversation.conversation_id == request.conversation_id
        ).first()
        
        if not existing_conversation:
            # Create new conversation record
            try:
                conversation = Conversation(
                    conversation_id=request.conversation_id,
                    user_message=request.user_message,
                    extracted_details=extracted_data,
                    status="in_progress"
                )
                db.add(conversation)
                db.commit()
                db.refresh(conversation)
            except IntegrityError:
                # If there's a race condition and conversation was created by another request
                db.rollback()
                existing_conversation = db.query(Conversation).filter(
                    Conversation.conversation_id == request.conversation_id
                ).first()
                if existing_conversation:
                    conversation = existing_conversation
                    conversation.user_message = request.user_message
                    conversation.extracted_details = extracted_data
                    conversation.status = "in_progress"
                    db.commit()
                else:
                    raise HTTPException(status_code=500, detail="Failed to create or find conversation")
        else:
            # Update existing conversation with new user message
            conversation = existing_conversation
            conversation.user_message = request.user_message
            conversation.extracted_details = extracted_data
            conversation.status = "in_progress"
            db.commit()
        
        # Create or update email details
        email_details = db.query(EmailDetails).filter(
            EmailDetails.conversation_id == request.conversation_id
        ).first()
        
        if not email_details:
            email_details = EmailDetails(
                conversation_id=request.conversation_id,
                recipient=extracted_data.get("recipient"),
                purpose=extracted_data.get("purpose"),
                tone=extracted_data.get("tone", "professional"),
                language=extracted_data.get("language", "en"),
                context=extracted_data.get("context"),
                additional_info=extracted_data.get("additional_info")
            )
            db.add(email_details)
        else:
            # Update existing details with new information
            if extracted_data.get("recipient"):
                email_details.recipient = extracted_data["recipient"]
            if extracted_data.get("purpose"):
                email_details.purpose = extracted_data["purpose"]
            if extracted_data.get("tone"):
                email_details.tone = extracted_data["tone"]
            if extracted_data.get("language"):
                email_details.language = extracted_data["language"]
            if extracted_data.get("context"):
                email_details.context = extracted_data["context"]
            if extracted_data.get("additional_info"):
                email_details.additional_info = extracted_data["additional_info"]
        
        db.commit()
        db.refresh(email_details)
        
        # Check if we have enough information
        # Handle JSON deserialization for additional_info
        additional_info = email_details.additional_info
        if isinstance(additional_info, str):
            try:
                additional_info = json.loads(additional_info) if additional_info else {}
            except json.JSONDecodeError:
                additional_info = {}
        elif additional_info is None:
            additional_info = {}
        
        current_details = {
            "recipient": email_details.recipient,
            "purpose": email_details.purpose,
            "tone": email_details.tone,
            "language": email_details.language,
            "context": email_details.context,
            "additional_info": additional_info
        }
        
        missing_fields = identify_missing_fields(current_details)
        
        if missing_fields:
            # Generate follow-up questions
            follow_up_data = generate_follow_up_questions(current_details, missing_fields)
            
            response_message = follow_up_data.get("message", "I need more information to help you create the email.")
            questions = []
            
            for q in follow_up_data.get("questions", []):
                questions.append(FollowUpQuestion(
                    question=q["question"],
                    field=q["field"],
                    options=q.get("options")
                ))
            
            # Update conversation with assistant response
            conversation.assistant_response = response_message
            
            # Store assistant message
            assistant_message = Message(
                conversation_id=request.conversation_id,
                message_type="assistant",
                content=response_message
            )
            db.add(assistant_message)
            db.commit()
            
            return EmailAssistantResponse(
                conversation_id=request.conversation_id,
                response_type="follow_up",
                message=response_message,
                extracted_details=ExtractedEmailDetails(**current_details),
                follow_up_questions=questions,
                missing_fields=missing_fields,
                requires_confirmation=False
            )
        else:
            # We have enough information, show confirmation
            confirmation_message = f"Great! I have all the information needed. Here's what I understand:\n\n" \
                                 f"• **Recipient**: {email_details.recipient}\n" \
                                 f"• **Purpose**: {email_details.purpose}\n" \
                                 f"• **Tone**: {email_details.tone}\n" \
                                 f"• **Language**: {email_details.language}\n" \
                                 f"• **Context**: {email_details.context}\n\n" \
                                 f"Would you like me to generate the email with these details?"
            
            # Update conversation with assistant response
            conversation.assistant_response = confirmation_message
            
            # Store assistant message
            assistant_message = Message(
                conversation_id=request.conversation_id,
                message_type="assistant",
                content=confirmation_message
            )
            db.add(assistant_message)
            db.commit()
            
            return EmailAssistantResponse(
                conversation_id=request.conversation_id,
                response_type="confirmation",
                message=confirmation_message,
                extracted_details=ExtractedEmailDetails(**current_details),
                requires_confirmation=True
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


@router.post("/assistant/confirm-and-generate", response_model=EmailAssistantResponse)
async def confirm_and_generate(
    request: EmailConfirmationRequest,
    db: Session = Depends(get_db)
):
    """Confirm details and generate email"""
    try:
        print(f"DEBUG: Received request: {request}")  # Debug log
        
        # Get email details
        email_details = db.query(EmailDetails).filter(
            EmailDetails.conversation_id == request.conversation_id
        ).first()
        
        if not email_details:
            print(f"DEBUG: No email details found for conversation_id: {request.conversation_id}")
            raise HTTPException(status_code=404, detail="Email details not found")
        
        # Update with confirmed details
        confirmed = request.confirmed_details
        print(f"DEBUG: Confirmed details: {confirmed}")
        
        if not confirmed:
            raise HTTPException(status_code=400, detail="Confirmed details are required")
        
        # Safely update fields only if they exist in confirmed details
        if hasattr(confirmed, 'recipient') and confirmed.recipient is not None:
            email_details.recipient = confirmed.recipient
        if hasattr(confirmed, 'purpose') and confirmed.purpose is not None:
            email_details.purpose = confirmed.purpose
        if hasattr(confirmed, 'tone') and confirmed.tone is not None:
            email_details.tone = confirmed.tone
        else:
            email_details.tone = "professional"
        if hasattr(confirmed, 'language') and confirmed.language is not None:
            email_details.language = confirmed.language
        else:
            email_details.language = "en"
        if hasattr(confirmed, 'context') and confirmed.context is not None:
            email_details.context = confirmed.context
        if hasattr(confirmed, 'additional_info') and confirmed.additional_info is not None:
            email_details.additional_info = confirmed.additional_info
        
        email_details.is_confirmed = True
        
        # Generate email
        details_dict = {
            "recipient": email_details.recipient,
            "purpose": email_details.purpose,
            "tone": email_details.tone,
            "language": email_details.language,
            "context": email_details.context,
            "additional_info": email_details.additional_info
        }
        
        generated_email = generate_intelligent_email(details_dict)
        email_details.generated_email = generated_email
        
        # Update conversation status
        conversation = db.query(Conversation).filter(
            Conversation.conversation_id == request.conversation_id
        ).order_by(Conversation.created_at.desc()).first()
        
        if conversation:
            conversation.status = "completed"
        
        db.commit()
        
        response_message = "Perfect! I've generated your email. Please review it below and let me know if you'd like any changes."
        
        return EmailAssistantResponse(
            conversation_id=request.conversation_id,
            response_type="generation",
            message=response_message,
            generated_email=generated_email,
            requires_confirmation=False
        )
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        print(f"DEBUG: Exception in confirm_and_generate: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating email: {str(e)}")


@router.post("/assistant/revise", response_model=EmailAssistantResponse)
async def revise_email_endpoint(
    request: EmailRevisionRequest,
    db: Session = Depends(get_db)
):
    """Revise email based on user feedback"""
    try:
        print(f"DEBUG: Revise request: {request}")  # Debug log
        
        # Get email details
        email_details = db.query(EmailDetails).filter(
            EmailDetails.conversation_id == request.conversation_id
        ).first()
        
        if not email_details:
            print(f"DEBUG: No email details found for conversation_id: {request.conversation_id}")
            raise HTTPException(status_code=404, detail="Email details not found")
        
        # Revise the email
        revised_email = revise_email(request.current_email, request.feedback)
        email_details.generated_email = revised_email
        
        # Store user message
        user_message = Message(
            conversation_id=request.conversation_id,
            message_type="user",
            content=f"Revision request: {request.feedback}"
        )
        db.add(user_message)
        
        response_message = "I've revised your email based on your feedback. Please review the changes below."
        
        # Store assistant message
        assistant_message = Message(
            conversation_id=request.conversation_id,
            message_type="assistant",
            content=response_message
        )
        db.add(assistant_message)
        
        # Update existing conversation status instead of creating a new one
        existing_conversation = db.query(Conversation).filter(
            Conversation.conversation_id == request.conversation_id
        ).first()
        
        if existing_conversation:
            existing_conversation.assistant_response = response_message
            existing_conversation.status = "completed"
        
        db.commit()
        
        return EmailAssistantResponse(
            conversation_id=request.conversation_id,
            response_type="revision",
            message=response_message,
            generated_email=revised_email,
            requires_confirmation=False
        )
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        print(f"DEBUG: Exception in revise_email_endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error revising email: {str(e)}")


@router.get("/assistant/conversation/{conversation_id}", response_model=List[ConversationHistory])
async def get_conversation_history(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """Get conversation history for a specific conversation"""
    conversations = db.query(Conversation).filter(
        Conversation.conversation_id == conversation_id
    ).order_by(Conversation.created_at.asc()).all()
    
    return conversations


@router.get("/assistant/details/{conversation_id}", response_model=EmailDetailsResponse)
async def get_email_details(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """Get email details for a specific conversation"""
    email_details = db.query(EmailDetails).filter(
        EmailDetails.conversation_id == conversation_id
    ).first()
    
    if not email_details:
        raise HTTPException(status_code=404, detail="Email details not found")
    
    return email_details


@router.post("/assistant/new-conversation")
async def start_new_conversation():
    """Start a new conversation and return conversation ID"""
    conversation_id = str(uuid.uuid4())
    return {"conversation_id": conversation_id}