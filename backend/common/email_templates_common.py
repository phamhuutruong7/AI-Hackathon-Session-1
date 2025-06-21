import os
import json
from typing import List, Dict, Any, Optional, Union
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get OpenAI API key from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# System prompt templates
SYSTEM_PROMPTS = {
    "email_generation": """Return results in JSON format with these attributes:
- title: A concise, attention-grabbing title for the email
- subject: An effective subject line that encourages opening the email
- content: The full email body with proper formatting

You act as a {purpose} expert who crafts compelling emails. 
Create an email with a {tone} tone.
""",
    
    "translation": """Return results in JSON format with these attributes:
- title: The translated title
- subject: The translated subject line
- content: The translated email body with proper formatting

You act as a professional translator with expertise in multiple languages.
Translate the provided content accurately while preserving the original meaning, tone, and formatting.
"""
}

def generate(
    purpose: str = "",
    context: str = "",
    tone: str = "professional"
) -> Dict[str, Any]:
    """Generate email content based on purpose and context"""
    # Format the system prompt with the provided parameters
    system_content = SYSTEM_PROMPTS["email_generation"].format(
        purpose=purpose,
        tone=tone
    )
    
    # Create message objects
    messages = [
        {"role": "system", "content": system_content},
        {"role": "user", "content": f"Please create an email with this context: {context}"}
    ]
    
    # Get the response from OpenAI
    response_text = call_openai(messages)
    
    # Parse the JSON response
    return parse_openai_response(response_text)

def call_openai(
    messages: List[Dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int = 1000
) -> str:
    """Call OpenAI API with the provided messages"""
    # Check if API key is available
    if not OPENAI_API_KEY:
        raise ValueError("OpenAI API key not found in environment variables")
    
    # Initialize OpenAI client
    client = openai.OpenAI(
        api_key=OPENAI_API_KEY
    )

    # Make API call
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return response.choices[0].message.content
    except Exception as e:
        # Log the error and return a user-friendly message
        print(f"Error calling OpenAI API: {str(e)}")
        raise Exception(f"Failed to generate content: {str(e)}")

def translate(
    content: str,
    target_language: str,
    source_language: str = "en"
) -> Dict[str, Any]:
    """Translate email content to the target language"""
    # Create message objects
    messages = [
        {"role": "system", "content": SYSTEM_PROMPTS["translation"]},
        {"role": "user", "content": f"Please translate the following content from {source_language} to {target_language}:\n\n{content}"}
    ]
    
    # Get the response from OpenAI
    response_text = call_openai(messages)
    
    # Parse the JSON response
    return parse_openai_response(response_text)


def parse_openai_response(response_text: str) -> Dict[str, Any]:
    """Parse the JSON response from OpenAI"""
    try:
        # Try to parse the response as JSON
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        # If the response is not valid JSON, try to extract JSON from the text
        try:
            # Look for JSON-like structure in the text
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}')
            
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx+1]
                return json.loads(json_str)
            else:
                # If no JSON structure found, create a basic structure
                return {
                    "title": "Generated Email",
                    "subject": "Generated Subject",
                    "content": response_text
                }
        except Exception as e:
            print(f"Error parsing OpenAI response: {str(e)}")
            # Return a fallback structure
            return {
                "title": "Generated Email",
                "subject": "Generated Subject",
                "content": response_text
            }