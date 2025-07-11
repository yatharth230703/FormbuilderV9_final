/**
 * Console Functions - Drop-in Functions for Form Console THEN Actions
 * 
 * This directory contains modular console functions that can be used
 * throughout the codebase based on IF-THEN conditions from the form console.
 * 
 * Each function is designed to be:
 * - Drop-in replaceable
 * - Conditionally executable based on AI-processed conditions
 * - Form-specific (using formId parameter)
 * - Non-destructive to existing functionalities
 */

// Export auto-select first option function
export {
  autoSelectFirstOption,
  hasAutoSelectConditions,
  getFirstStepOptions,
  type AutoSelectCondition,
  type AutoSelectOptions,
} from './auto-select-first-option';

// Export send brochure function
export {
  sendBrochure,
  checkBrochureConditions,
  extractEmailFromResponse,
  getResponseElementsForCondition,
  type SendBrochureCondition,
  type SendBrochureOptions,
} from './send-brochure';

// Common types and interfaces
export interface ConsoleFunction {
  name: string;
  description: string;
  type: 'form-config' | 'response-config' | 'document';
  enabled: boolean;
}

export interface ConsoleFunctionResult {
  success: boolean;
  message?: string;
  data?: any;
}

// Console function registry for dynamic loading
export const CONSOLE_FUNCTIONS = {
  AUTO_SELECT_FIRST_OPTION: 'auto-select-first-option',
  SEND_BROCHURE: 'send-brochure',
} as const;

export type ConsoleFunctionType = typeof CONSOLE_FUNCTIONS[keyof typeof CONSOLE_FUNCTIONS];

/**
 * Utility function to check if a console function should be executed
 * @param functionName - Name of the console function
 * @param formId - ID of the form
 * @param conditionResult - AI-processed condition result
 * @returns Boolean indicating if function should execute
 */
export function shouldExecuteConsoleFunction(
  functionName: ConsoleFunctionType,
  formId: number,
  conditionResult: Record<string, any>
): boolean {
  // Check if any condition is met
  const hasConditions = Object.values(conditionResult).some(value => value === true);
  
  if (!hasConditions) {
    console.log(`[Console Functions] No conditions met for function ${functionName} on form ${formId}`);
    return false;
  }
  
  console.log(`[Console Functions] Conditions met for function ${functionName} on form ${formId}`);
  return true;
}

/**
 * Get all available console functions metadata
 * @returns Array of console function metadata
 */
export function getAvailableConsoleFunctions(): ConsoleFunction[] {
  return [
    {
      name: 'auto-select-first-option',
      description: 'Automatically pre-selects the first option based on form config conditions',
      type: 'form-config',
      enabled: true,
    },
    {
      name: 'send-brochure',
      description: 'Sends a brochure email when specific keywords are found in responses',
      type: 'response-config',
      enabled: true,
    },
  ];
}