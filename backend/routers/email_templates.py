import re
from typing import List

from database import get_db
from fastapi import APIRouter, Depends, HTTPException
from models.email_template import EmailTemplate
from schemas.email_template import (
    EmailGenerateRequest,
    EmailGenerateResponse,
    EmailTemplateCreate,
    EmailTemplateResponse,
    EmailTemplateUpdate,
    EmailTranslateRequest,
    EmailTranslateResponse,
    EmailContent,
)
from sqlalchemy.orm import Session

from common import email_templates_common

router = APIRouter()


@router.get("/email-templates", response_model=List[EmailTemplateResponse])
async def get_email_templates(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all email templates"""
    templates = db.query(EmailTemplate).filter(EmailTemplate.is_active == True).offset(skip).limit(limit).all()
    return templates


@router.get("/email-templates/{template_id}", response_model=EmailTemplateResponse)
async def get_email_template(template_id: int, db: Session = Depends(get_db)):
    """Get a specific email template by ID"""
    template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found")
    return template


@router.post("/email-templates", response_model=EmailTemplateResponse)
async def create_email_template(
    template: EmailTemplateCreate,
    db: Session = Depends(get_db)
):
    """Create a new email template"""
    db_template = EmailTemplate(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


@router.put("/email-templates/{template_id}", response_model=EmailTemplateResponse)
async def update_email_template(
    template_id: int,
    template_update: EmailTemplateUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing email template"""
    db_template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Email template not found")
    
    update_data = template_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_template, field, value)
    
    db.commit()
    db.refresh(db_template)
    return db_template


@router.delete("/email-templates/{template_id}")
async def delete_email_template(template_id: int, db: Session = Depends(get_db)):
    """Delete an email template (soft delete)"""
    db_template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Email template not found")
    
    db_template.is_active = False
    db.commit()
    return {"message": "Email template deleted successfully"}


@router.post("/email-templates/generate", response_model=EmailGenerateResponse)
async def generate_email(request: EmailGenerateRequest):
    """Generate an email based on purpose and context"""
    try:
        # Call the improved generate function with all parameters
        result_dict = email_templates_common.generate(
            purpose=request.purpose,
            context=request.context,
            tone=request.tone
        )
        
        # Create EmailContent model from the result
        email_content = EmailContent(
            title=result_dict.get("title", "Generated Email"),
            subject=result_dict.get("subject", "Generated Subject"),
            content=result_dict.get("content", "")
        )
        
        # Return the response with the structured data
        return {"result": email_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/email-templates/translate", response_model=EmailTranslateResponse)
async def translate_email(request: EmailTranslateRequest):
    """Translate an email to a different language"""
    try:
        # Call the improved translate function with all parameters
        result_dict = email_templates_common.translate(
            content=request.content,
            target_language=request.target_language,
            source_language=request.source_language
        )
        
        # Create EmailContent model from the result
        email_content = EmailContent(
            title=result_dict.get("title", "Translated Email"),
            subject=result_dict.get("subject", "Translated Subject"),
            content=result_dict.get("content", "")
        )
        
        # Return the response with the structured data
        return {"result": email_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
