import axios from 'axios';
import {
  EmailTemplate,
  EmailTemplateCreate,
  EmailTemplateUpdate,
  EmailGenerateRequest,
  EmailGenerateResponse,
  EmailTranslateRequest,
  EmailTranslateResponse,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Email Templates API
export const emailTemplatesApi = {
  // Get all templates
  getAll: async (skip: number = 0, limit: number = 100): Promise<EmailTemplate[]> => {
    const response = await api.get(`/email-templates?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Get template by ID
  getById: async (id: number): Promise<EmailTemplate> => {
    const response = await api.get(`/email-templates/${id}`);
    return response.data;
  },

  // Create new template
  create: async (template: EmailTemplateCreate): Promise<EmailTemplate> => {
    const response = await api.post('/email-templates', template);
    return response.data;
  },

  // Update template
  update: async (id: number, template: EmailTemplateUpdate): Promise<EmailTemplate> => {
    const response = await api.put(`/email-templates/${id}`, template);
    return response.data;
  },

  // Delete template
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/email-templates/${id}`);
    return response.data;
  },

  // Generate email
  generate: async (request: EmailGenerateRequest): Promise<EmailGenerateResponse> => {
    const response = await api.post('/email-templates/generate', request);
    return response.data;
  },

  // Translate email
  translate: async (request: EmailTranslateRequest): Promise<EmailTranslateResponse> => {
    const response = await api.post('/email-templates/translate', request);
    return response.data;
  },
};

export default api;
