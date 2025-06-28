const API_BASE_URL = '/api/v1';

// Types
export interface ExtractedEmailDetails {
  recipient?: string;
  purpose?: string;
  tone?: string;
  language?: string;
  context?: string;
  additional_info?: string;
}

export interface FollowUpQuestion {
  question: string;
  field: string;
  options?: string[];
}

export interface EmailContent {
  subject: string;
  content: string;
  tone?: string;
  language?: string;
}

export interface EmailAssistantRequest {
  conversation_id: string;
  user_message: string;
}

export interface EmailAssistantResponse {
  conversation_id: string;
  response_type: 'follow_up' | 'confirmation' | 'generation' | 'revision';
  message: string;
  extracted_details?: ExtractedEmailDetails;
  follow_up_questions?: FollowUpQuestion[];
  missing_fields?: string[];
  generated_email?: EmailContent;
  requires_confirmation: boolean;
}

export interface EmailConfirmationRequest {
  conversation_id: string;
  confirmed_details: ExtractedEmailDetails;
}

export interface EmailRevisionRequest {
  conversation_id: string;
  current_email: EmailContent;
  feedback: string;
}

export interface ConversationHistory {
  id: number;
  conversation_id: string;
  user_message: string;
  assistant_response?: string;
  extracted_details?: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EmailDetailsResponse {
  id: number;
  conversation_id: string;
  recipient?: string;
  purpose?: string;
  tone?: string;
  language?: string;
  context?: string;
  additional_info?: string;
  generated_email?: EmailContent;
  is_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewConversationResponse {
  conversation_id: string;
}

// API Functions
export async function chatWithAssistant(request: EmailAssistantRequest): Promise<EmailAssistantResponse> {
  const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function confirmAndGenerate(request: EmailConfirmationRequest): Promise<EmailAssistantResponse> {
  const response = await fetch(`${API_BASE_URL}/assistant/confirm-and-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function reviseEmail(request: EmailRevisionRequest): Promise<EmailAssistantResponse> {
  const response = await fetch(`${API_BASE_URL}/assistant/revise`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getConversationHistory(conversationId: string): Promise<ConversationHistory[]> {
  const response = await fetch(`${API_BASE_URL}/assistant/conversation/${conversationId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getEmailDetails(conversationId: string): Promise<EmailDetailsResponse> {
  const response = await fetch(`${API_BASE_URL}/assistant/details/${conversationId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function startNewConversation(): Promise<NewConversationResponse> {
  const response = await fetch(`${API_BASE_URL}/assistant/new-conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}