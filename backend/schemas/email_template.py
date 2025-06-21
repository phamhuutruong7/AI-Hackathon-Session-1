from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class EmailTemplateBase(BaseModel):
    title: str
    subject: str
    content: str
    purpose: str
    language: str = "en"


class EmailTemplateCreate(EmailTemplateBase):
    pass


class EmailTemplateUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    purpose: Optional[str] = None
    language: Optional[str] = None
    is_active: Optional[bool] = None


class EmailTemplateResponse(EmailTemplateBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmailGenerateRequest(BaseModel):
    purpose: str
    context: Optional[str] = None
    tone: Optional[str] = "professional"  # professional, casual, friendly, formal
    language: str = "en"


class EmailTranslateRequest(BaseModel):
    content: str
    target_language: str
    source_language: str = "en"


# Response models for generated content
class EmailContent(BaseModel):
    title: str = Field(..., description="The title of the email")
    subject: str = Field(..., description="The subject line of the email")
    content: str = Field(..., description="The full body content of the email")


class EmailGenerateResponse(BaseModel):
    result: EmailContent = Field(..., description="The generated email content")


class EmailTranslateResponse(BaseModel):
    result: EmailContent = Field(..., description="The translated email content")
