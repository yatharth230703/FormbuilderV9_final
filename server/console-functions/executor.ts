import { FormConfig } from "@shared/types";
import { autoSelectFirstOption } from "./auto-select-first-option";
import { sendBrochure, extractEmailFromResponse } from "./send-brochure";
import * as supabaseService from "../services/supabase";

export interface ConsoleConfig {
  enable: boolean;
  formConfig: {
    enabled_actions: string[];
    trigger: {
      slide_no: number[]; // Now an array of slide numbers
      option: string;
    };
    last_updated: string;
  };
  responseConfig: {
    enabled_actions: string[];
    trigger: {
      slide_no: number[]; // Now an array of slide numbers
      option: string[];
    };
    brochure_text?: string;
    last_updated: string;
  };
}

/**
 * Execute form config console functions
 * This runs when a form is being configured/displayed
 * @param formConfig - The form configuration
 * @param consoleConfig - The console configuration
 * @returns Modified form configuration
 */
export async function executeFormConfigFunctions(
  formConfig: FormConfig,
  consoleConfig: ConsoleConfig
): Promise<FormConfig> {
  if (!consoleConfig.enable) {
    return formConfig;
  }

  let modifiedConfig = { ...formConfig };

  // Auto-select first option function
  if (consoleConfig.formConfig.enabled_actions.includes('auto_select_first_option')) {
    const selectedOption = consoleConfig.formConfig.trigger.option;
    
    if (selectedOption) {
      // Create condition result for auto-select function
      const conditionResult = { [selectedOption]: true };
      
      try {
        modifiedConfig = autoSelectFirstOption({
          formId: 0, // Will be updated with actual form ID
          conditionResult,
          formConfig: modifiedConfig
        });
        
        console.log(`[Console Executor] Auto-select first option executed for option: ${selectedOption}`);
        process.stdout.write(''); // Force flush
      } catch (error) {
        console.error(`[Console Executor] Error executing auto-select first option:`, error);
        process.stderr.write(''); // Force flush
      }
    }
  }

  return modifiedConfig;
}

/**
 * Execute response config console functions
 * This runs when a form response is submitted
 * @param formId - The form ID
 * @param formResponse - The form response data
 * @param consoleConfig - The console configuration
 * @param formLabel - The form label
 */
export async function executeResponseConfigFunctions(
  formId: number,
  formResponse: Record<string, any>,
  consoleConfig: ConsoleConfig,
  formLabel: string
): Promise<void> {
  if (!consoleConfig.enable) {
    return;
  }

  // Send brochure function
  if (consoleConfig.responseConfig.enabled_actions.includes('send_brochure')) {
    const triggerOptions = consoleConfig.responseConfig.trigger.option;
    const brochureText = consoleConfig.responseConfig.brochure_text || '';
    
    if (triggerOptions.length > 0 && brochureText.trim()) {
      // Check if any trigger option is present in the response
      const shouldSendBrochure = checkResponseTriggers(formResponse, triggerOptions);
      
      if (shouldSendBrochure) {
        const recipientEmail = extractEmailFromResponse(formResponse);
        
        if (recipientEmail) {
          try {
            // Create condition result for send brochure function
            const conditionResult = triggerOptions.reduce((acc, option) => {
              acc[option] = true;
              return acc;
            }, {} as Record<string, boolean>);
            
            const success = await sendBrochure({
              formId,
              conditionResult,
              formResponse,
              brochureText,
              recipientEmail,
              formLabel
            });
            
            if (success) {
              console.log(`[Console Executor] Brochure sent successfully to ${recipientEmail} for form ${formId}`);
              process.stdout.write(''); // Force flush
            } else {
              console.error(`[Console Executor] Failed to send brochure to ${recipientEmail} for form ${formId}`);
              process.stderr.write(''); // Force flush
            }
          } catch (error) {
            console.error(`[Console Executor] Error executing send brochure:`, error);
            process.stderr.write(''); // Force flush
          }
        } else {
          console.log(`[Console Executor] No valid email found in response for form ${formId}`);
          process.stdout.write(''); // Force flush
        }
      } else {
        console.log(`[Console Executor] Brochure trigger conditions not met for form ${formId}`);
        process.stdout.write(''); // Force flush
      }
    }
  }
}

/**
 * Check if form response contains any of the trigger options
 * @param formResponse - The form response data
 * @param triggerOptions - Array of option IDs that should trigger the function
 * @returns Boolean indicating if any trigger option is found
 */
function checkResponseTriggers(formResponse: Record<string, any>, triggerOptions: string[]): boolean {
  // Check if any trigger option is present in the response
  for (const option of triggerOptions) {
    if (isOptionInResponse(formResponse, option)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a specific option is present in the form response
 * @param formResponse - The form response data
 * @param optionId - The option ID to search for
 * @returns Boolean indicating if the option is found
 */
function isOptionInResponse(formResponse: Record<string, any>, optionId: string): boolean {
  // Check direct keys
  if (formResponse[optionId] !== undefined) {
    return true;
  }
  
  // Check nested objects and arrays
  for (const [key, value] of Object.entries(formResponse)) {
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        // Check if array contains the option ID
        if (value.includes(optionId)) {
          return true;
        }
      } else {
        // Check nested objects
        if (isOptionInResponse(value, optionId)) {
          return true;
        }
      }
    } else if (typeof value === 'string') {
      // Check if string value matches option ID
      if (value === optionId) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get console configuration for a form
 * @param formId - The form ID
 * @returns Promise<ConsoleConfig | null>
 */
export async function getConsoleConfig(formId: number): Promise<ConsoleConfig | null> {
  try {
    const form = await supabaseService.getFormConfig(formId);
    
    if (!form || !form.form_console) {
      return null;
    }
    
    return form.form_console as ConsoleConfig;
  } catch (error) {
    console.error(`[Console Executor] Error getting console config for form ${formId}:`, error);
    return null;
  }
}

/**
 * Main execution function for console functions
 * This should be called from the form submission endpoint
 * @param formId - The form ID
 * @param formResponse - The form response data
 * @param formLabel - The form label
 */
export async function executeConsoleActions(
  formId: number,
  formResponse: Record<string, any>,
  formLabel: string
): Promise<void> {
  try {
    const consoleConfig = await getConsoleConfig(formId);
    
    if (!consoleConfig) {
      console.log(`[Console Executor] No console config found for form ${formId}`);
      return;
    }
    
    // Execute response config functions
    await executeResponseConfigFunctions(formId, formResponse, consoleConfig, formLabel);
    
    console.log(`[Console Executor] Console actions executed for form ${formId}`);
  } catch (error) {
    console.error(`[Console Executor] Error executing console actions for form ${formId}:`, error);
  }
}