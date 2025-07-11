import { FormConfig, FormStep, StepType } from "@shared/types";

/**
 * Utility functions for working with form configurations and responses
 */

/**
 * Validates a form configuration JSON
 * @param config The form configuration object to validate
 * @returns True if valid, false otherwise
 */
export function validateFormConfig(config: unknown): config is FormConfig {
  if (!config || typeof config !== 'object') return false;
  
  // Check for required top-level properties
  const formConfig = config as Partial<FormConfig>;
  
  if (!formConfig.steps || !Array.isArray(formConfig.steps) || formConfig.steps.length === 0) {
    return false;
  }
  
  if (!formConfig.theme || typeof formConfig.theme !== 'object') {
    return false;
  }
  
  // Check for required theme properties
  if (
    !formConfig.theme.colors ||
    typeof formConfig.theme.colors !== 'object' ||
    !formConfig.theme.colors.primary
  ) {
    return false;
  }
  
  // Validate each step has a type, title and subtitle
  for (const step of formConfig.steps) {
    if (!step.type || !step.title || !step.subtitle) {
      return false;
    }
    
    // Validate step type
    if (!isValidStepType(step.type)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Checks if a string is a valid step type
 * @param type The type string to check
 * @returns True if it's a valid step type
 */
function isValidStepType(type: string): type is StepType {
  const validTypes: StepType[] = [
    'tiles', 
    'multiSelect', 
    'slider', 
    'followup', 
    'textbox', 
    'location', 
    'contact'
  ];
  
  return validTypes.includes(type as StepType);
}

/**
 * Checks if all required steps are present in the form config
 * @param config The form configuration to check
 * @returns True if all required steps are present
 */
export function hasRequiredSteps(config: FormConfig): boolean {
  const hasLocation = config.steps.some(step => step.type === 'location');
  const hasContact = config.steps.some(step => step.type === 'contact');
  
  return hasLocation && hasContact;
}

/**
 * Checks if a form has been completed with all required fields
 * @param config The form configuration
 * @param responses The user's responses
 * @returns True if all required fields are filled
 */
export function isFormComplete(config: FormConfig, responses: Record<string, any>): boolean {
  // This is a simplified implementation
  // A real implementation would check each step type's required fields
  
  // Make sure we have at least one response for each step
  return config.steps.every(step => 
    responses[step.title] !== undefined && 
    responses[step.title] !== null && 
    responses[step.title] !== ''
  );
}

/**
 * Formats a form response for display or submission
 * @param responses The raw response values keyed by step title
 * @param config The form configuration
 * @returns A structured response object
 */
export function formatFormResponses(
  responses: Record<string, any>, 
  config: FormConfig
): Record<string, any> {
  // Convert step titles to machine-friendly keys
  return Object.entries(responses).reduce((acc, [key, value]) => {
    const stepKey = key
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '_');
    
    return { 
      ...acc, 
      [stepKey]: value 
    };
  }, {});
}
