from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.email_template import EmailTemplate
from schemas.email_template import (
    EmailTemplateCreate,
    EmailTemplateUpdate, 
    EmailTemplateResponse,
    EmailGenerateRequest,
    EmailTranslateRequest
)

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


@router.post("/email-templates/generate")
async def generate_email(request: EmailGenerateRequest):
    """Generate an email based on purpose and context"""
    # TODO: Implement AI-powered email generation
    # This is a placeholder for the actual implementation
    generated_content = f"""
    Subject: Generated Email for {request.purpose}
    
    Dear [Recipient],
    
    This is a generated email template for {request.purpose}.
    Context: {request.context or 'No specific context provided'}
    Tone: {request.tone}
    
    Best regards,
    [Your Name]
    """
    
    return {
        "subject": f"Generated Email for {request.purpose}",
        "content": generated_content.strip(),
        "purpose": request.purpose,
        "language": request.language
    }


@router.post("/email-templates/translate")
async def translate_email(request: EmailTranslateRequest):
    """Translate an email to a different language"""
    # TODO: Implement translation service integration
    # This is a placeholder for the actual implementation
    translated_content = f"[TRANSLATED TO {request.target_language.upper()}] {request.content}"
    
    return {
        "original_content": request.content,
        "translated_content": translated_content,
        "source_language": request.source_language,
        "target_language": request.target_language
    }
