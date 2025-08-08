import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { FormConfig, FormStep } from "@shared/types";

type IconMode = 'lucide' | 'emoji' | 'none';

interface FormContextType {
  formConfig: FormConfig | null;
  setFormConfig: (config: FormConfig) => void;
  formId: number | null;
  setFormId: (id: number) => void;
  promptHistory: string[];
  setPromptHistory: (history: string[]) => void;
  resetServerConfig: () => Promise<void>;
  formResponses: Record<string, any>;
  tempJson: Record<string, any>;
  updateResponse: (key: string, value: any) => void;
  resetForm: () => void;
  resetResponses: () => void;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  isFormComplete: boolean;
  setIsFormComplete: (isComplete: boolean) => void;
  validateCurrentStep: () => boolean;
  isStepValid: (stepIndex: number) => boolean;
  updateThemeColor: (colorType: 'primary' | 'secondary' | 'accent', colorValue: string) => void;
  updateFontFamily: (fontFamily: string) => void;
  // Icon mode management
  iconMode: IconMode;
  setIconMode: (mode: IconMode) => void;
  // Device / embedding information
  isMobile: boolean;
  isIframe: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {

  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formId, setFormId] = useState<number | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [tempJson, setTempJson] = useState<Record<string, any>>({});
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);
  const [iconMode, setIconMode] = useState<IconMode>('lucide');

  // Device detection
  const { isMobile, isIframe } = useDeviceDetection();

  // Initialize form config if available
  useEffect(() => {
    if (window._initialFormConfig) {
      setFormConfig(window._initialFormConfig);
      window._initialFormConfig = null; // Clear after use
    }
  }, []);

  // Reset step when form config changes
// Reset step when form config changes
useEffect(() => {
  if (formConfig) {
    setCurrentStep(1);
    setFormResponses({});
    setTempJson({});
    setIsFormComplete(false);
    // Removed setFormId(null); to retain the original form ID
    setPromptHistory([]);
  }
}, [formConfig]);




  // Calculate total steps
  const totalSteps = formConfig?.steps.length || 1;

  // Update a response value
  const updateResponse = (key: string, value: any) => {
    setFormResponses(prev => ({
      ...prev,
      [key]: value
    }));

    // Update tempJson with responses up to documentUpload step
    if (formConfig?.steps) {
      const documentUploadIndex = formConfig.steps.findIndex(step => step.type === 'documentUpload');

      if (documentUploadIndex !== -1) {
        const currentStepIndex = formConfig.steps.findIndex(step => step.title === key);

        // If current step is before or at the documentUpload step
        if (currentStepIndex !== -1 && currentStepIndex <= documentUploadIndex) {
          setTempJson(prev => {
            const newTempJson = {
              ...prev,
              [key]: value
            };

            // If this is the documentUpload step, add document content from extracted text
            if (currentStepIndex === documentUploadIndex && typeof value === 'object' && (value.extractedText || value.documentContent)) {
              // Store the extracted text if available
              if (value.extractedText) {
                newTempJson.documentContent = value.extractedText;
              } else if (value.documentContent) {
                newTempJson.documentContent = value.documentContent;
              }

              // Log tempJson to CLI after document upload
              console.log('\n=== TEMP JSON AFTER DOCUMENT UPLOAD ===');
              console.log(JSON.stringify(newTempJson, null, 2));
              console.log('=== END TEMP JSON ===\n');
            }

            return newTempJson;
          });
        }
      }
    }
  };

  // Move to the next step
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Move to the previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Reset the form (including config and responses)
  const resetForm = () => {
    setFormConfig(null);
    setFormResponses({});
    setTempJson({});
    setCurrentStep(1);
    setIsFormComplete(false);
  };

  // Reset just the responses (keep the config)
  const resetResponses = () => {
    setFormResponses({});
    setTempJson({});
    setCurrentStep(1);
    setIsFormComplete(false);
  };

  // Validate if a specific step has valid responses
  const isStepValid = (stepIndex: number): boolean => {
    if (!formConfig || !formConfig.steps || stepIndex < 0 || stepIndex >= formConfig.steps.length) {
      return false;
    }

    const step = formConfig.steps[stepIndex];
    const stepResponse = formResponses[step.title];

    switch (step.type) {
      case 'tiles':
        // Required by default, should have a selection
        return !!stepResponse;

      case 'multiSelect':
        // At least one selection required
        return Array.isArray(stepResponse) && stepResponse.length > 0;

      case 'dropdown':
        // Required by default, should have a selection
        if (step.validation?.required) {
          return !!stepResponse;
        }
        return true;

      case 'slider':
        // Slider always has a value (defaultValue)
        return true;

      case 'followup':
        // Should have both a selection and followup answer
        return !!stepResponse && 
          typeof stepResponse === 'object' && 
          'option' in stepResponse && 
          'value' in stepResponse;

      case 'textbox':
        // Only require non-empty text if marked required; ignore minLength
        if (step.validation?.required) {
          return !!stepResponse && 
            typeof stepResponse === 'string' && 
            stepResponse.trim().length > 0;
        }
        return true;

      case 'location':
        // Check if required and has a valid location response
        if (step.validation?.required) {
          return !!stepResponse && 
            typeof stepResponse === 'object' && 
            'postalCode' in stepResponse;
        }
        return true;

      case 'contact':
        // Contact step is now optional - if no response, it's valid
        if (!stepResponse || typeof stepResponse !== 'object') return true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const { firstName, email } = stepResponse as any;

        // If any contact info is provided, validate it properly
        if (firstName || email) {
          // If email is provided, it must be valid
          if (email && !emailRegex.test(email)) {
            return false;
          }
          // If firstName is provided, email is also required
          if (firstName && !email) {
            return false;
          }
        }

        // If no contact info is provided, it's still valid (optional)
        return true;

      case 'documentUpload':
        // Document upload should always have a response (even if placeholder)
        return !!stepResponse;

      case 'documentInfo':
        // Document info always has content, so always valid
        return true;

      default:
        return true;
    }
  };


  // Validate the current step
  const validateCurrentStep = (): boolean => {
    return isStepValid(currentStep - 1);
  };

  // Add AFTER your last function (maybe after validateCurrentStep)

  const updateThemeColor = (colorType: 'primary' | 'secondary' | 'accent', colorValue: string) => {
    setFormConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        theme: {
          ...prev.theme,
          colors: {
            ...prev.theme.colors,
            [colorType]: colorValue
          }
        }
      };
    });
  };

  const updateFontFamily = (fontFamily: string) => {
    setFormConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        theme: {
          ...prev.theme,
          font: {
            family: fontFamily,
            size: "medium",
            weight: "400"
          }
        }
      };
    });
  };
  // — fetch the last‐saved form from the server and overwrite our in-memory config+history
  const resetServerConfig = async () => {
    if (!formId) return;
    try {
      const res = await fetch(`/api/forms/${formId}`);
      const data = await res.json();
      setFormConfig(data.config);
      setFormId(data.id); // ✅ CRITICAL: set the form ID
      setPromptHistory(data.promptHistory || []);
      setCurrentStep(1);
      setFormResponses({});
      setTempJson({});
      setIsFormComplete(false);
    } catch (e) {
      console.error("resetServerConfig failed", e);
    }
  };

  return (
    <FormContext.Provider
      value={{
        formConfig,
        setFormConfig,
        formResponses,
        tempJson,
        updateResponse,
        resetForm,
        resetResponses,
        formId,
        setFormId,
        promptHistory,
        setPromptHistory,
        resetServerConfig,
        currentStep,
        totalSteps,
        nextStep,
        prevStep,
        isSubmitting,
        setIsSubmitting,
        isFormComplete,
        setIsFormComplete,
        validateCurrentStep,
        isStepValid,
        updateThemeColor,    
        updateFontFamily,
        iconMode,
        setIconMode 
        ,
        // expose device info
        isMobile,
        isIframe
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}