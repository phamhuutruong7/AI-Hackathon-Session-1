-- Initialize the database schema

-- Create the email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create an index on purpose for faster queries
CREATE INDEX IF NOT EXISTS idx_email_templates_purpose ON email_templates(purpose);

-- Create an index on language for faster queries
CREATE INDEX IF NOT EXISTS idx_email_templates_language ON email_templates(language);

-- Create an index on is_active for faster queries
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

-- Create the conversations table for email assistant
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL UNIQUE,
    user_message TEXT NOT NULL,
    assistant_response TEXT,
    extracted_details JSON,
    status VARCHAR(50) DEFAULT 'in_progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the email_details table for email assistant
CREATE TABLE IF NOT EXISTS email_details (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL UNIQUE,
    recipient VARCHAR(255),
    purpose VARCHAR(255),
    tone VARCHAR(100) DEFAULT 'professional',
    language VARCHAR(10) DEFAULT 'en',
    context TEXT,
    additional_info TEXT,
    generated_email JSON,
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the messages table for storing individual chat messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id ON conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_email_details_conversation_id ON email_details(conversation_id);
CREATE INDEX IF NOT EXISTS idx_email_details_is_confirmed ON email_details(is_confirmed);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);

-- Insert some sample data
INSERT INTO email_templates (title, subject, content, purpose, language) VALUES
('Business Introduction', 'Introduction to Our Services', 'Dear [Name],\n\nI hope this email finds you well. I wanted to take a moment to introduce our company and the services we offer.\n\nBest regards,\n[Your Name]', 'business', 'en'),
('Meeting Request', 'Request for Meeting', 'Dear [Name],\n\nI would like to schedule a meeting to discuss [Topic]. Please let me know your availability.\n\nBest regards,\n[Your Name]', 'business', 'en'),
('Thank You Note', 'Thank You', 'Dear [Name],\n\nThank you for your time and consideration. I appreciate the opportunity to work with you.\n\nBest regards,\n[Your Name]', 'personal', 'en');
