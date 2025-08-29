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
  // Session management
  sessionId: number | null;
  sessionNo: number | null;
  initializeSession: () => Promise<void>;
  getSessionInfo: () => { sessionId: number | null; sessionNo: number | null };
  // Document upload tracking
  hasDocumentUploaded: () => boolean;
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
  // Session management state
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionNo, setSessionNo] = useState<number | null>(null);
  const [sessionInitialized, setSessionInitialized] = useState<boolean>(false);

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
    // Reset session state when form config changes
    setSessionId(null);
    setSessionNo(null);
    setSessionInitialized(false);
  }
}, [formConfig]);

// Reset session state whenever formId changes (new form access)
useEffect(() => {
  if (formId) {
    console.log(`[Session] Form ID changed to ${formId}, resetting session state for fresh start`);
    setSessionId(null);
    setSessionNo(null);
    setSessionInitialized(false);
    setFormResponses({});
    setTempJson({});
    setCurrentStep(1);
    setIsFormComplete(false);
  }
}, [formId]);

  // Auto-update temp response when formResponses change and session is ready
  useEffect(() => {
    if (sessionInitialized && sessionId && Object.keys(formResponses).length > 0) {
      updateTempResponse(formResponses);
    }
  }, [formResponses, sessionInitialized, sessionId]);

  // Calculate total steps
  const totalSteps = formConfig?.steps.length || 1;

  // Initialize session for temporary response tracking
  const initializeSession = async () => {
    if (!formId || sessionInitialized) return;
    
    try {
      console.log(`[Session] Creating NEW session for form ${formId}`);
      const response = await fetch(`/api/forms/${formId}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize session: ${response.statusText}`);
      }

      const sessionData = await response.json();
      setSessionId(sessionData.sessionId);
      setSessionNo(sessionData.sessionNo);
      setSessionInitialized(true);
      
      // Don't restore any existing temp response data - start fresh
      // Each new session should start with empty responses
      console.log(`[Session] NEW session created: ID=${sessionData.sessionId}, No=${sessionData.sessionNo}`);
    } catch (error) {
      console.error('[Session] Failed to initialize session:', error);
    }
  };

  // Update temp response on server
  const updateTempResponse = async (responses: Record<string, any>) => {
    if (!sessionId) return;

    try {
      await fetch(`/api/sessions/${sessionId}/temp-response`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tempResponse: responses }),
      });
      console.log(`[Session] Updated temp response for session ${sessionId}`);
    } catch (error) {
      console.error('[Session] Failed to update temp response:', error);
    }
  };

  // Update a response value
  const updateResponse = (key: string, value: any) => {
    const newResponses = {
      ...formResponses,
      [key]: value
    };
    
    setFormResponses(newResponses);

    // Initialize session on first interaction if not already done, then update temp response
    if (!sessionInitialized && formId) {
      initializeSession().then(() => {
        // This will be handled by the effect that watches sessionId changes
      });
    } else if (sessionInitialized && sessionId) {
      // Update temp response on server if session is already initialized
      updateTempResponse(newResponses);
    }

    // Update tempJson with responses up to documentUpload step (existing logic)
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
            if (currentStepIndex === documentUploadIndex && typeof value === 'object' && (value.extractedText || value.documentContent || value.documentUrl)) {
              console.log('[FORM-CONTEXT] Document upload step detected:', {
                stepIndex: currentStepIndex,
                documentUploadIndex,
                value,
                valueKeys: Object.keys(value || {})
              });
              
              // Store the extracted text if available
              if (value.extractedText) {
                newTempJson.documentContent = value.extractedText;
                console.log('[FORM-CONTEXT] Stored extractedText:', value.extractedText.substring(0, 100) + '...');
              } else if (value.documentContent) {
                newTempJson.documentContent = value.documentContent;
                console.log('[FORM-CONTEXT] Stored documentContent:', value.documentContent.substring(0, 100) + '...');
              }
              
              // Store the document URL for images
              if (value.documentUrl) {
                newTempJson.documentUrl = value.documentUrl;
                console.log('[FORM-CONTEXT] Stored documentUrl:', value.documentUrl);
              }

              // Log tempJson to CLI after document upload
              console.log('\n=== TEMP JSON AFTER DOCUMENT UPLOAD ===');
              console.log(JSON.stringify(newTempJson, null, 2));
              console.log('=== END TEMP JSON ===\n');
              
              console.log('[FORM-CONTEXT] Final tempJson after document processing:', {
                tempJsonKeys: Object.keys(newTempJson),
                documentContentLength: newTempJson.documentContent?.length || 0,
                documentUrl: newTempJson.documentUrl
              });
            }

            return newTempJson;
          });
        }
      }
    }
  };

  // Helper function to check if a document was actually uploaded
  const hasDocumentUploaded = (): boolean => {
    if (!formConfig?.steps) return false;
    
    const documentUploadStep = formConfig.steps.find(step => step.type === 'documentUpload');
    if (!documentUploadStep) return false;
    
    const documentResponse = formResponses[documentUploadStep.title];
    
    console.log('[FORM-CONTEXT] Checking if document uploaded:', {
      hasResponse: !!documentResponse,
      responseType: typeof documentResponse,
      responseKeys: documentResponse ? Object.keys(documentResponse) : [],
      hasFile: documentResponse?.file,
      hasExtractedText: !!documentResponse?.extractedText,
      hasDocumentContent: !!documentResponse?.documentContent,
      hasDocumentUrl: !!documentResponse?.documentUrl
    });
    
    // Check if there's a valid document response with actual file content
    // For images, we only have documentUrl, for text files we have extractedText/documentContent
    return !!documentResponse && 
           typeof documentResponse === 'object' && 
           (documentResponse.file || documentResponse.extractedText || documentResponse.documentContent || documentResponse.documentUrl);
  };

  // Move to the next step
  const nextStep = () => {
    console.log('[FORM-CONTEXT] nextStep called:', {
      currentStep,
      totalSteps,
      hasDocumentUploaded: hasDocumentUploaded(),
      formResponsesKeys: Object.keys(formResponses)
    });
    
    if (currentStep < totalSteps) {
      // Check if we're on a document upload step and it's being skipped
      if (formConfig?.steps && currentStep <= formConfig.steps.length) {
        const currentStepData = formConfig.steps[currentStep - 1];
        const nextStepData = formConfig.steps[currentStep];
        
        console.log('[FORM-CONTEXT] Step data:', {
          currentStepType: currentStepData?.type,
          nextStepType: nextStepData?.type,
          hasDocumentUploaded: hasDocumentUploaded()
        });
        
        // If current step is documentUpload and it's being skipped (no response), 
        // and next step is documentInfo, skip the documentInfo step too
        if (currentStepData?.type === 'documentUpload' && 
            nextStepData?.type === 'documentInfo' && 
            !hasDocumentUploaded()) {
          console.log('[FORM-CONTEXT] Skipping documentUpload and documentInfo steps');
          // Skip both documentUpload and documentInfo steps
          setCurrentStep(currentStep + 2);
          return;
        }
      }
      
      // Check if we're moving to a documentInfo step and no document was uploaded
      if (formConfig?.steps && currentStep < formConfig.steps.length) {
        const nextStepData = formConfig.steps[currentStep];
        if (nextStepData?.type === 'documentInfo' && !hasDocumentUploaded()) {
          console.log('[FORM-CONTEXT] Skipping documentInfo step - no document uploaded');
          // Skip documentInfo step if no document was uploaded
          setCurrentStep(currentStep + 2);
          return;
        }
      }
      
      console.log('[FORM-CONTEXT] Moving to next step normally');
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
    setSessionId(null);
    setSessionNo(null);
    setSessionInitialized(false);
  };

  // Reset just the responses (keep the config)
  const resetResponses = () => {
    setFormResponses({});
    setTempJson({});
    setCurrentStep(1);
    setIsFormComplete(false);
    setSessionId(null);
    setSessionNo(null);
    setSessionInitialized(false);
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
          'followup' in stepResponse;

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
        // Contact step now requires firstName, lastName, and email
        if (!stepResponse || typeof stepResponse !== 'object') return false;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const { firstName, lastName, email } = stepResponse as any;

        // All three fields are required
        if (!firstName || !lastName || !email) {
          return false;
        }

        // Email must be valid
        if (!emailRegex.test(email)) {
          return false;
        }

        return true;

      case 'documentUpload':
        // Document upload is skippable if validation.required is false
        if (step.validation?.required) {
          return !!stepResponse;
        }
        // For skippable document upload, we consider it valid even without a response
        // but we'll track if something was actually uploaded for the document info step
        return true;

      case 'documentInfo':
        // Document info is only valid if a document was actually uploaded
        return hasDocumentUploaded();

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

  // Get current session information
  const getSessionInfo = () => {
    return { sessionId, sessionNo };
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
        isIframe,
        // session management
        sessionId,
        sessionNo,
        initializeSession,
        getSessionInfo,
        // document upload tracking
        hasDocumentUploaded
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