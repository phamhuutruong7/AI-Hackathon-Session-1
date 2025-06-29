from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List


class EmailAssistantRequest(BaseModel):
    conversation_id: str = Field(..., description="Unique conversation identifier")
    user_message: str = Field(..., description="User's natural language input")


class ExtractedEmailDetails(BaseModel):
    recipient: Optional[str] = None
    purpose: Optional[str] = None
    tone: Optional[str] = None
    language: Optional[str] = "en"
    context: Optional[str] = None
    additional_info: Optional[Dict[str, Any]] = None
    confidence_score: Optional[float] = None


class FollowUpQuestion(BaseModel):
    question: str
    field: str  # Which field this question is trying to fill
    options: Optional[List[str]] = None  # Suggested options if applicable


class EmailAssistantResponse(BaseModel):
    conversation_id: str
    response_type: str  # "extraction", "follow_up", "confirmation", "generation", "revision"
    message: str
    extracted_details: Optional[ExtractedEmailDetails] = None
    follow_up_questions: Optional[List[FollowUpQuestion]] = None
    missing_fields: Optional[List[str]] = None
    generated_email: Optional[Dict[str, Any]] = None
    requires_confirmation: bool = False


class EmailConfirmationRequest(BaseModel):
    conversation_id: str
    confirmed_details: ExtractedEmailDetails
    action: Optional[str] = "generate"  # "generate" or "revise"


class EmailRevisionRequest(BaseModel):
    conversation_id: str
    current_email: Dict[str, Any]
    feedback: str


class ConversationHistory(BaseModel):
    id: int
    conversation_id: str
    user_message: str
    assistant_response: Optional[str]
    extracted_details: Optional[Dict[str, Any]]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class EmailDetailsResponse(BaseModel):
    id: int
    conversation_id: str
    recipient: Optional[str]
    purpose: Optional[str]
    tone: Optional[str]
    language: str
    context: Optional[str]
    additional_info: Optional[Dict[str, Any]]
    is_confirmed: bool
    generated_email: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True