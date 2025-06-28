import os
import json
from typing import Dict, Any, List, Optional
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "")

# Legacy OpenAI Configuration (for backward compatibility)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# Determine which OpenAI service to use
USE_AZURE_OPENAI = bool(AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_DEPLOYMENT_NAME)

# Enhanced system prompts for intelligent email assistant
SYSTEM_PROMPTS = {
    "detail_extraction": """You are an intelligent email assistant that extracts email details from natural conversation.

Extract the following information from the user's message and return as JSON:
{
  "recipient": "person or organization to send email to",
  "purpose": "reason for the email (meeting_request, business_inquiry, follow_up, etc.)",
  "tone": "desired tone (professional, friendly, formal, casual)",
  "language": "preferred language (en, es, fr, etc.)",
  "context": "specific context or details mentioned",
  "additional_info": {"key": "value pairs of other relevant info"},
  "confidence_score": 0.8
}

If information is missing or unclear, set the field to null. Provide a confidence score (0-1) for the extraction quality.""",
    
    "follow_up_questions": """You are an intelligent email assistant that asks follow-up questions to gather missing email information.

Based on the extracted details and missing fields, generate helpful follow-up questions as JSON:
{
  "questions": [
    {
      "question": "Who would you like to send this email to?",
      "field": "recipient",
      "options": ["colleague", "client", "manager", "vendor"]
    }
  ],
  "message": "I need a few more details to help you create the perfect email."
}

Ask only for the most important missing information. Keep questions natural and conversational.""",
    
    "email_generation": """You are an expert email writer that creates professional emails based on confirmed details.

Generate a complete email with the following structure as JSON:
{
  "title": "Descriptive title for the email",
  "subject": "Compelling subject line",
  "content": "Full email body with proper formatting and structure",
  "suggestions": ["Optional suggestions for improvement"]
}

Use the confirmed details to create a well-structured, appropriate email that matches the requested tone and purpose.""",
    
    "email_revision": """You are an expert email editor that revises emails based on user feedback.

Revise the email according to the user's feedback and return as JSON:
{
  "title": "Updated title",
  "subject": "Revised subject line",
  "content": "Revised email body",
  "changes_made": ["List of specific changes made"]
}

Maintain the original intent while incorporating the requested changes."""
}


def extract_email_details(user_message: str) -> Dict[str, Any]:
    """Extract email details from user's natural language input"""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPTS["detail_extraction"]},
        {"role": "user", "content": user_message}
    ]
    
    response_text = call_openai(messages)
    return parse_openai_response(response_text)


def generate_follow_up_questions(extracted_details: Dict[str, Any], missing_fields: List[str]) -> Dict[str, Any]:
    """Generate follow-up questions for missing information"""
    context = f"Extracted details: {json.dumps(extracted_details)}\nMissing fields: {missing_fields}"
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPTS["follow_up_questions"]},
        {"role": "user", "content": context}
    ]
    
    response_text = call_openai(messages)
    return parse_openai_response(response_text)


def generate_intelligent_email(confirmed_details: Dict[str, Any]) -> Dict[str, Any]:
    """Generate email using confirmed details"""
    context = f"Email details: {json.dumps(confirmed_details)}"
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPTS["email_generation"]},
        {"role": "user", "content": f"Please generate an email with these details: {context}"}
    ]
    
    response_text = call_openai(messages)
    return parse_openai_response(response_text)


def revise_email(current_email: Dict[str, Any], feedback: str) -> Dict[str, Any]:
    """Revise email based on user feedback"""
    context = f"Current email: {json.dumps(current_email)}\nUser feedback: {feedback}"
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPTS["email_revision"]},
        {"role": "user", "content": context}
    ]
    
    response_text = call_openai(messages)
    return parse_openai_response(response_text)


def call_openai(messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: int = 1000) -> str:
    """Call OpenAI API (Azure or regular) with the provided messages"""
    
    if USE_AZURE_OPENAI:
        # Use Azure OpenAI
        if not AZURE_OPENAI_API_KEY:
            raise ValueError("Azure OpenAI API key not found in environment variables")
        
        client = openai.AzureOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            api_version=AZURE_OPENAI_API_VERSION,
            azure_endpoint=AZURE_OPENAI_ENDPOINT
        )
        model = AZURE_OPENAI_DEPLOYMENT_NAME
    else:
        # Use regular OpenAI
        if not OPENAI_API_KEY:
            raise ValueError("OpenAI API key not found in environment variables")
        
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        model = OPENAI_MODEL
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content
    except Exception as e:
        service_type = "Azure OpenAI" if USE_AZURE_OPENAI else "OpenAI"
        print(f"Error calling {service_type} API: {str(e)}")
        raise Exception(f"Failed to process request with {service_type}: {str(e)}")


def parse_openai_response(response_text: str) -> Dict[str, Any]:
    """Parse the JSON response from OpenAI"""
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        try:
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
        except Exception:
            pass
        
        # Fallback response
        return {
            "error": "Failed to parse AI response",
            "raw_response": response_text
        }


def identify_missing_fields(extracted_details: Dict[str, Any]) -> List[str]:
    """Identify which required fields are missing from extracted details"""
    required_fields = ["recipient", "purpose", "context"]
    missing = []
    
    for field in required_fields:
        if not extracted_details.get(field):
            missing.append(field)
    
    return missing


def is_ready_for_generation(extracted_details: Dict[str, Any]) -> bool:
    """Check if we have enough information to generate an email"""
    required_fields = ["recipient", "purpose", "context"]
    
    for field in required_fields:
        if not extracted_details.get(field):
            return False
    
    return True