/**
 * Example usage of console functions
 * This file demonstrates how to integrate console functions into the existing codebase
 */

import { FormConfig } from "@shared/types";
import { 
  autoSelectFirstOption, 
  sendBrochure, 
  shouldExecuteConsoleFunction,
  CONSOLE_FUNCTIONS,
  type AutoSelectOptions,
  type SendBrochureOptions
} from "./index";

// Example 1: Auto-select first option integration
export async function handleFormConfigWithAutoSelect(
  formId: number,
  formConfig: FormConfig,
  aiConditionResult: Record<string, boolean>
): Promise<FormConfig> {
  
  // Check if console function should execute
  if (!shouldExecuteConsoleFunction(
    CONSOLE_FUNCTIONS.AUTO_SELECT_FIRST_OPTION,
    formId,
    aiConditionResult
  )) {
    return formConfig; // Return original config if no conditions met
  }
  
  // Execute auto-select console function
  const options: AutoSelectOptions = {
    formId,
    conditionResult: aiConditionResult,
    formConfig
  };
  
  const modifiedConfig = autoSelectFirstOption(options);
  
  console.log(`[Example] Auto-select applied to form ${formId}`);
  return modifiedConfig;
}

// Example 2: Send brochure integration
export async function handleFormResponseWithBrochure(
  formId: number,
  formResponse: Record<string, any>,
  formLabel: string,
  aiConditionResult: Record<string, boolean>
): Promise<boolean> {
  
  // Check if console function should execute
  if (!shouldExecuteConsoleFunction(
    CONSOLE_FUNCTIONS.SEND_BROCHURE,
    formId,
    aiConditionResult
  )) {
    return false; // No brochure needed
  }
  
  // Extract email from response
  const recipientEmail = extractEmailFromFormResponse(formResponse);
  if (!recipientEmail) {
    console.error(`[Example] No email found in response for form ${formId}`);
    return false;
  }
  
  // Generate brochure content (this would typically come from a database or config)
  const brochureContent = await generateBrochureContent(formId, formResponse);
  
  // Execute send brochure console function
  const options: SendBrochureOptions = {
    formId,
    conditionResult: aiConditionResult,
    formResponse,
    brochureContent,
    recipientEmail,
    formLabel
  };
  
  const success = await sendBrochure(options);
  
  console.log(`[Example] Brochure sending ${success ? 'successful' : 'failed'} for form ${formId}`);
  return success;
}

// Example 3: Combined console function execution
export async function executeConsoleFunctions(
  formId: number,
  formConfig: FormConfig,
  formResponse?: Record<string, any>,
  formLabel?: string
): Promise<{
  modifiedConfig: FormConfig;
  brochureSent: boolean;
}> {
  
  // Mock AI condition results (in real implementation, these would come from AI agents)
  const formConfigConditions = await processFormConfigConditions(formId, formConfig);
  const responseConditions = formResponse 
    ? await processResponseConditions(formId, formResponse)
    : {};
  
  // Execute auto-select if conditions met
  const modifiedConfig = await handleFormConfigWithAutoSelect(
    formId,
    formConfig,
    formConfigConditions
  );
  
  // Execute brochure sending if conditions met
  const brochureSent = formResponse && formLabel
    ? await handleFormResponseWithBrochure(formId, formResponse, formLabel, responseConditions)
    : false;
  
  return {
    modifiedConfig,
    brochureSent
  };
}

// Utility functions for the examples

/**
 * Extract email from form response using common patterns
 */
function extractEmailFromFormResponse(formResponse: Record<string, any>): string | null {
  const emailFields = ['email', 'Email', 'contact_email', 'user_email'];
  
  for (const field of emailFields) {
    if (formResponse[field] && typeof formResponse[field] === 'string') {
      return formResponse[field];
    }
  }
  
  return null;
}

/**
 * Generate brochure content based on form and response
 */
async function generateBrochureContent(
  formId: number,
  formResponse: Record<string, any>
): Promise<string> {
  // In real implementation, this would:
  // 1. Fetch brochure template from database
  // 2. Use AI to customize content based on response
  // 3. Return formatted HTML
  
  return `
    <h2>Thank you for your interest!</h2>
    <p>Based on your form submission, we've prepared this information for you.</p>
    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
      <h3>Relevant Information</h3>
      <p>This brochure contains information tailored to your specific needs.</p>
    </div>
    <p>If you have any questions, please don't hesitate to contact us.</p>
  `;
}

/**
 * Mock AI processing for form config conditions
 */
async function processFormConfigConditions(
  formId: number,
  formConfig: FormConfig
): Promise<Record<string, boolean>> {
  // In real implementation, this would call the AI agent
  // For demo purposes, return mock conditions
  console.log(`[Mock AI] Processing form config conditions for form ${formId}`);
  
  // Mock result: first option should be selected if it contains "birth"
  const firstStep = formConfig.steps[0];
  if (firstStep && (firstStep.type === 'tiles' || firstStep.type === 'multiSelect')) {
    const stepWithOptions = firstStep as any;
    const result: Record<string, boolean> = {};
    
    stepWithOptions.options?.forEach((option: any) => {
      result[option.id] = option.title.toLowerCase().includes('birth');
    });
    
    return result;
  }
  
  return {};
}

/**
 * Mock AI processing for response conditions
 */
async function processResponseConditions(
  formId: number,
  formResponse: Record<string, any>
): Promise<Record<string, boolean>> {
  // In real implementation, this would call the AI agent
  // For demo purposes, return mock conditions
  console.log(`[Mock AI] Processing response conditions for form ${formId}`);
  
  const result: Record<string, boolean> = {};
  
  // Mock result: trigger brochure if response contains "insurance"
  Object.entries(formResponse).forEach(([key, value]) => {
    if (typeof value === 'string' && value.toLowerCase().includes('insurance')) {
      result[key] = true;
    }
  });
  
  return result;
}

// Example integration with existing form processing
export async function integrateConsoleFunctionsWithExistingForm(
  formId: number,
  formConfig: FormConfig,
  formResponse?: Record<string, any>
): Promise<FormConfig> {
  
  console.log(`[Integration] Processing console functions for form ${formId}`);
  
  // Execute console functions
  const { modifiedConfig, brochureSent } = await executeConsoleFunctions(
    formId,
    formConfig,
    formResponse,
    'Example Form'
  );
  
  // Log results
  if (brochureSent) {
    console.log(`[Integration] Brochure sent for form ${formId}`);
  }
  
  return modifiedConfig;
}