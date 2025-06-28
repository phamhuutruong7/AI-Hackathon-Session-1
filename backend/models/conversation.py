from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(255), unique=True, nullable=False, index=True)
    user_message = Column(Text, nullable=False)
    assistant_response = Column(Text, nullable=True)
    extracted_details = Column(JSON, nullable=True)  # Store extracted email details
    status = Column(String(50), default="in_progress")  # in_progress, confirmed, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class EmailDetails(Base):
    __tablename__ = "email_details"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(255), nullable=False, index=True)
    recipient = Column(String(255), nullable=True)
    purpose = Column(String(255), nullable=True)
    tone = Column(String(100), nullable=True)
    language = Column(String(10), default="en")
    context = Column(Text, nullable=True)
    additional_info = Column(JSON, nullable=True)
    is_confirmed = Column(Boolean, default=False)
    generated_email = Column(JSON, nullable=True)  # Store final generated email
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())