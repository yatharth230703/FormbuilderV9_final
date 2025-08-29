import { apiRequest } from "@/lib/queryClient";
import { FormConfig, PromptRequest, FormResponse } from "@shared/types";

/**
 * Form Engine API service
 * Handles communication with the backend API
 */

/**
 * Generate a form from a natural language prompt
 * @param prompt The user's natural language prompt
 * @returns Generated form configuration with optional error information
 */
export async function generateFormFromPrompt(prompt: string): Promise<{ 
  id: number; 
  config: FormConfig; 
  error?: string; 
  fallbackReason?: string; 
  usedFallback: boolean; 
}> {
  const response = await apiRequest({
    url: "/api/prompt",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  return response;
}

/**
 * Submit form responses to the backend
 * @param label Form label/identifier
 * @param formResponses The user's responses to the form
 * @returns Submission confirmation
 */
export async function submitFormResponses(label: string, formResponses: Record<string, any>): Promise<{ id: number; message: string }> {
  const response = await apiRequest({
    url: "/api/submit",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, response: formResponses })
  });
  return response;
}

/**
 * Get all form configurations
 * @returns List of form configurations
 */
export async function getFormConfigs(): Promise<FormConfig[]> {
  const response = await apiRequest({
    url: "/api/forms",
    method: "GET"
  });
  return response;
}

/**
 * Get a specific form configuration by ID
 * @param id Form configuration ID
 * @returns The requested form configuration
 */
export async function getFormConfig(id: number): Promise<FormConfig> {
  const response = await apiRequest({
    url: `/api/forms/${id}`,
    method: "GET"
  });
  return response;
}

/**
 * Generate document analysis using AI agent
 * @param formResponses User's form responses
 * @param documentData All tempJson data
 * @param contentPrompt The question to answer about the document
 * @param formId Form ID
 * @returns Generated analysis answer
 */
export async function generateQuotation({ formResponses, documentData, contentPrompt, formId }: {
  formResponses: any;
  documentData: any;
  contentPrompt: string;
  formId: number | null;
}): Promise<{ quotation: string }> {
  console.log('[API-SERVICE] generateQuotation called with:', {
    formResponsesKeys: Object.keys(formResponses || {}),
    documentDataKeys: Object.keys(documentData || {}),
    contentPrompt,
    formId
  });
  
  const requestBody = { formResponses, documentData, contentPrompt, formId };
  console.log('[API-SERVICE] Request body being sent:', JSON.stringify(requestBody, null, 2));
  
  const result = await apiRequest({
    url: '/api/generate-quotation',
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' },
  });
  
  console.log('[API-SERVICE] Response received:', result);
  console.log('[API-SERVICE] Response details:', {
    hasQuotation: !!result.quotation,
    quotationLength: result.quotation?.length || 0,
    quotationPreview: result.quotation?.substring(0, 200) + '...',
    quotationType: typeof result.quotation
  });
  
  return result;
}

export async function saveQuotationTemplate(data: {
  template: string;
  formId: number;
}): Promise<{ success: boolean; message: string }> {
  return apiRequest({
    url: '/api/quotation-template',
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getQuotationTemplate(formId: number): Promise<{ success: boolean; template: string }> {
  return apiRequest({
    url: `/api/quotation-template/${formId}`,
    method: 'GET',
  });
}