
const API_BASE_URL = '/api/v1';

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
  tone?: string;
  language?: string;
}

export interface EmailTranslateRequest {
  content: string;
  target_language: string;
  source_language?: string;
}

// Template management
export const getEmailTemplates = async (skip = 0, limit = 100): Promise<EmailTemplate[]> => {
  const response = await fetch(`${API_BASE_URL}/email-templates?skip=${skip}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  return response.json();
};

export const getEmailTemplate = async (templateId: number): Promise<EmailTemplate> => {
  const response = await fetch(`${API_BASE_URL}/email-templates/${templateId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch template');
  }
  return response.json();
};

export const createEmailTemplate = async (template: EmailTemplateCreate): Promise<EmailTemplate> => {
  const response = await fetch(`${API_BASE_URL}/email-templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });
  if (!response.ok) {
    throw new Error('Failed to create template');
  }
  return response.json();
};

export const updateEmailTemplate = async (templateId: number, template: EmailTemplateUpdate): Promise<EmailTemplate> => {
  const response = await fetch(`${API_BASE_URL}/email-templates/${templateId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });
  if (!response.ok) {
    throw new Error('Failed to update template');
  }
  return response.json();
};

export const deleteEmailTemplate = async (templateId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/email-templates/${templateId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete template');
  }
};

// Email generation
export const generateEmail = async (request: EmailGenerateRequest): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/email-templates/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error('Failed to generate email');
  }
  return response.json();
};

// Email translation
export const translateEmail = async (request: EmailTranslateRequest): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/email-templates/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error('Failed to translate email');
  }
  return response.json();
};
