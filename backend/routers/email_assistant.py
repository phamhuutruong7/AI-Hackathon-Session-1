import uuid
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.conversation import Conversation, EmailDetails
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
        
        # Save conversation to database
        conversation = Conversation(
            conversation_id=request.conversation_id,
            user_message=request.user_message,
            extracted_details=extracted_data,
            status="in_progress"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
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
        # Get email details
        email_details = db.query(EmailDetails).filter(
            EmailDetails.conversation_id == request.conversation_id
        ).first()
        
        if not email_details:
            raise HTTPException(status_code=404, detail="Email details not found")
        
        # Update with confirmed details
        confirmed = request.confirmed_details
        email_details.recipient = confirmed.recipient
        email_details.purpose = confirmed.purpose
        email_details.tone = confirmed.tone or "professional"
        email_details.language = confirmed.language or "en"
        email_details.context = confirmed.context
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
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating email: {str(e)}")


@router.post("/assistant/revise", response_model=EmailAssistantResponse)
async def revise_email_endpoint(
    request: EmailRevisionRequest,
    db: Session = Depends(get_db)
):
    """Revise email based on user feedback"""
    try:
        # Get email details
        email_details = db.query(EmailDetails).filter(
            EmailDetails.conversation_id == request.conversation_id
        ).first()
        
        if not email_details:
            raise HTTPException(status_code=404, detail="Email details not found")
        
        # Revise the email
        revised_email = revise_email(request.current_email, request.feedback)
        email_details.generated_email = revised_email
        
        # Save new conversation entry
        conversation = Conversation(
            conversation_id=request.conversation_id,
            user_message=f"Revision request: {request.feedback}",
            assistant_response="I've revised your email based on your feedback.",
            status="completed"
        )
        db.add(conversation)
        db.commit()
        
        response_message = "I've revised your email based on your feedback. Please review the changes below."
        
        return EmailAssistantResponse(
            conversation_id=request.conversation_id,
            response_type="revision",
            message=response_message,
            generated_email=revised_email,
            requires_confirmation=False
        )
        
    except Exception as e:
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