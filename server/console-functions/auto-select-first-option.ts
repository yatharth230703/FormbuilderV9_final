import { FormConfig } from "@shared/types";

export interface AutoSelectCondition {
  [optionId: string]: boolean;
}

export interface AutoSelectOptions {
  formId: number;
  conditionResult: AutoSelectCondition;
  formConfig: FormConfig;
}

/**
 * Auto-select first option console function
 * This function automatically pre-selects the first option in a form
 * based on AI-processed conditions from the form config
 * 
 * @param options - Configuration object containing form ID, condition result, and form config
 * @returns Modified form config with pre-selected options
 */

export function autoSelectFirstOption(options: AutoSelectOptions): FormConfig {
  const { formId, conditionResult, formConfig } = options;
  
  console.log(`[Console Function] Auto-select first option triggered for form ${formId}`);
  
  // Clone the form config to avoid mutating the original
  const modifiedConfig = JSON.parse(JSON.stringify(formConfig)) as FormConfig;
  
  // Only process the first step/slide (index 0)
  if (modifiedConfig.steps && modifiedConfig.steps.length > 0) {
    const firstStep = modifiedConfig.steps[0];
    
    // Check if the first step has options (tiles or multiSelect)
    if (firstStep.type === 'tiles' || firstStep.type === 'multiSelect') {
      const stepWithOptions = firstStep as any; // Type assertion for options access
      
      if (stepWithOptions.options && Array.isArray(stepWithOptions.options)) {
        // Iterate through the options in the first step
        for (const option of stepWithOptions.options) {
          // Check if this option should be pre-selected based on AI condition
          if (conditionResult[option.id] === true) {
            console.log(`[Console Function] Pre-selecting option: ${option.id} (${option.title})`);
            
            // Add preselected property to the option
            option.preselected = true;
            
            // For tiles step, also mark as selected (single selection)
            if (firstStep.type === 'tiles') {
              option.selected = true;
              // Ensure only one option is selected for tiles
              stepWithOptions.options.forEach((opt: any) => {
                if (opt.id !== option.id) {
                  opt.selected = false;
                  opt.preselected = false;
                }
              });
              break; // Exit after first match for tiles
            }
          }
        }
      }
    }
  }
  
  console.log(`[Console Function] Auto-select first option completed for form ${formId}`);
  return modifiedConfig;
}

/**
 * Utility function to check if auto-select conditions are met
 * @param formConfig - The form configuration to check
 * @param conditionResult - The AI-processed condition result
 * @returns Boolean indicating if any conditions are met
 */
export function hasAutoSelectConditions(
  formConfig: FormConfig,
  conditionResult: AutoSelectCondition
): boolean {
  if (!formConfig.steps || formConfig.steps.length === 0) {
    return false;
  }
  
  const firstStep = formConfig.steps[0];
  
  if (firstStep.type === 'tiles' || firstStep.type === 'multiSelect') {
    const stepWithOptions = firstStep as any;
    
    if (stepWithOptions.options && Array.isArray(stepWithOptions.options)) {
      return stepWithOptions.options.some((option: any) => 
        conditionResult[option.id] === true
      );
    }
  }
  
  return false;
}

/**
 * Get the first step options for condition processing
 * @param formConfig - The form configuration
 * @returns Array of options from the first step, or empty array if none
 */
export function getFirstStepOptions(formConfig: FormConfig): any[] {
  if (!formConfig.steps || formConfig.steps.length === 0) {
    return [];
  }
  
  const firstStep = formConfig.steps[0];
  
  if (firstStep.type === 'tiles' || firstStep.type === 'multiSelect') {
    const stepWithOptions = firstStep as any;
    return stepWithOptions.options || [];
  }
  
  return [];
}