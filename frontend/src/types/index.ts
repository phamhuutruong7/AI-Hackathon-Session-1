export interface EmailTemplate {
  id: number;
  title: string;
  subject: string;
  content: string;
  purpose: string;
  language: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface EmailTemplateCreate {
  title: string;
  subject: string;
  content: string;
  purpose: string;
  language?: string;
}

export interface EmailTemplateUpdate {
  title?: string;
  subject?: string;
  content?: string;
  purpose?: string;
  language?: string;
  is_active?: boolean;
}

export interface EmailGenerateRequest {
  purpose: string;
  context?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  language?: string;
}

export interface EmailGenerateResponse {
  subject: string;
  content: string;
  purpose: string;
  language: string;
}

export interface EmailTranslateRequest {
  content: string;
  target_language: string;
  source_language?: string;
}

export interface EmailTranslateResponse {
  original_content: string;
  translated_content: string;
  source_language: string;
  target_language: string;
}
