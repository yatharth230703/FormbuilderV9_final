import { useMemo, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import TilesStep from "./embed-form-steps/tiles-step";
import MultiSelectStep from "./embed-form-steps/multi-select-step";
import DropdownStep from "./embed-form-steps/dropdown-step";
import SliderStep from "./embed-form-steps/slider-step";
import FollowupStep from "./embed-form-steps/followup-step";
import TextboxStep from "./embed-form-steps/textbox-step";
import LocationStep from "./embed-form-steps/location-step";
import ContactStep from "./embed-form-steps/contact-step";
import DocumentUploadStep from "./embed-form-steps/document-upload-step";
import DocumentInfoStep from "./embed-form-steps/document-info-step";
import SubmissionStep from "./embed-form-steps/submission-step";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, SkipForwardIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FormConfig } from "@shared/types";

interface EmbedFormRendererProps {
  testMode?: boolean;
  formConfig?: FormConfig;
  formId?: number | null;
}

export default function EmbedFormRenderer({
  testMode = false,
  formConfig: propFormConfig,
  formId,
}: EmbedFormRendererProps) {
  const {
    formConfig: contextFormConfig,
    setFormConfig,
    setFormId,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    formResponses,
    isSubmitting,
    setIsSubmitting,
    isFormComplete,
    setIsFormComplete,
    validateCurrentStep,
    isStepValid,
    initializeSession,
    getSessionInfo,
    isStepOptional,
  } = useFormContext();

  // Handle both regular and double-wrapped configs
  // If config.config exists, it's a double-wrapped config from the API
  const unwrapConfig = (config: any) => {
    if (!config) return config;
    return config.config ? config.config : config;
  };
  
  // Unwrap both prop config and context config
  const unwrappedPropConfig = propFormConfig ? unwrapConfig(propFormConfig) : null;
  const unwrappedContextConfig = contextFormConfig ? unwrapConfig(contextFormConfig) : null;
  
  // Use unwrapped prop formConfig if provided, otherwise use unwrapped context formConfig
  const formConfig = unwrappedPropConfig || unwrappedContextConfig;
  
  console.log("🔍 FORM RENDERER - Config format detection:", {
    hasPropConfig: !!propFormConfig,
    propHasNestedConfig: propFormConfig && !!propFormConfig.config,
    contextHasNestedConfig: contextFormConfig && !!contextFormConfig.config,
    usingUnwrappedConfig: !!formConfig
  });

  // If prop formConfig is provided, update the context
  useEffect(() => {
    if (propFormConfig && propFormConfig !== contextFormConfig) {
      const configToUse = unwrapConfig(propFormConfig);
      console.log("🔄 FORM RENDERER - Updating form config from props:", {
        hasSteps: configToUse && Array.isArray(configToUse.steps),
        stepsLength: configToUse && configToUse.steps?.length || 0,
        hasNestedConfig: !!propFormConfig.config
      });
      
      // Validate the form config before setting it
      if (!configToUse || !configToUse.steps || !Array.isArray(configToUse.steps) || configToUse.steps.length === 0) {
        console.error("⚠️ FORM RENDERER - Invalid form config: no steps found");
      } else {
        setFormConfig(configToUse);
      }
    }
  }, [propFormConfig, contextFormConfig, setFormConfig]);
  
  // Log current step information for debugging
  useEffect(() => {
    console.log("👣 FORM RENDERER - Current step info:", {
      currentStep,
      totalSteps,
      hasFormConfig: !!formConfig,
      stepsLength: formConfig?.steps?.length || 0
    });
  }, [currentStep, totalSteps, formConfig]);

  // Set formId if provided (but don't initialize session yet)
  useEffect(() => {
    if (formId) {
      setFormId(formId);
      // Don't initialize session here - wait for first slide interaction
    }
  }, [formId, setFormId]);

  const { toast } = useToast();

  // Check if current step is valid for continue button state
  const isCurrentStepValid = useMemo(() => {
    if (!formConfig?.steps || currentStep < 1 || currentStep > formConfig.steps.length) {
      return false;
    }
    return isStepValid(currentStep - 1);
  }, [formConfig?.steps, currentStep, isStepValid]);

  const handleNextStep = () => {
    const isValid = validateCurrentStep();
    if (!isValid) {
      return;
    }

    if (currentStep === totalSteps) {
      handleSubmit();
    } else {
      nextStep();
      
      // Send height update message when changing steps
      setTimeout(() => {
        if (window.self !== window.top) {
          // We're in an iframe, send height update to parent
          const height = document.querySelector('[data-testid="embed-form-container"]')?.getBoundingClientRect().height || 
                         document.documentElement.scrollHeight;
          
          window.parent.postMessage({ type: 'form-resize', height }, '*');
          window.parent.postMessage({ type: 'heightUpdate', height }, '*');
        }
      }, 50); // Small delay to allow content to render
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Determine form ID - either from prop or from config
      const submissionFormId = formId || (formConfig as any)?.id || null;
      
      // Get session information
      const { sessionId, sessionNo } = getSessionInfo();

      // Prepare submission data with session info
      const submissionData = {
        ...formResponses,
        _sessionInfo: {
          sessionId,
          sessionNo
        }
      };

      // Use the correct endpoint with form ID
      await apiRequest({
        url: `/api/forms/${submissionFormId}/submit`,
        method: "POST",
        body: JSON.stringify(submissionData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setIsFormComplete(true);

      toast({
        title: "Form Submitted",
        description: testMode
          ? "Form submission successful (test mode)"
          : "Form has been submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? `Failed to submit the form: ${error.message}`
            : "Failed to submit the form",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepContent = useMemo(() => {
    // Check if formConfig exists
    if (!formConfig) {
      console.log("⚠️ FORM RENDERER - No formConfig found");
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading form...</p>
        </div>
      );
    }
    
    // Process steps - handle both array and object formats
    let stepsArray = [];
    
    // Log the raw form config structure
    console.log("🔍 FORM RENDERER - Raw form config:", {
      hasSteps: !!formConfig.steps,
      stepsType: typeof formConfig.steps,
      isArray: Array.isArray(formConfig.steps),
      stepsLength: formConfig.steps?.length || 0,
      configKeys: Object.keys(formConfig)
    });
    
    // First approach: Check if steps is directly an array
    if (Array.isArray(formConfig.steps)) {
      console.log("✅ FORM RENDERER - Steps is directly an array");
      stepsArray = formConfig.steps;
    } 
    // Second approach: Check if steps is an object with numeric keys
    else if (typeof formConfig.steps === 'object' && formConfig.steps !== null) {
      console.log("🔄 FORM RENDERER - Steps is an object, trying to convert to array");
      try {
        const keys = Object.keys(formConfig.steps).filter(k => !isNaN(Number(k))).sort((a, b) => Number(a) - Number(b));
        if (keys.length > 0) {
          stepsArray = keys.map(k => formConfig.steps[k]);
          console.log("✅ FORM RENDERER - Converted steps object to array:", { 
            convertedLength: stepsArray.length 
          });
        }
      } catch (err) {
        console.error("❌ FORM RENDERER - Error converting steps object to array:", err);
      }
    }
    // Third approach: Try to extract steps from raw config JSON
    else {
      console.log("🔄 FORM RENDERER - Trying to extract steps from raw config");
      try {
        const configStr = JSON.stringify(formConfig);
        const stepsMatch = configStr.match(/"steps"\s*:\s*(\[[\s\S]*?\])(?=\s*,|\s*\})/);
        
        if (stepsMatch && stepsMatch[1]) {
          try {
            const parsedSteps = JSON.parse(stepsMatch[1]);
            if (Array.isArray(parsedSteps) && parsedSteps.length > 0) {
              stepsArray = parsedSteps;
              console.log("✅ FORM RENDERER - Extracted steps from raw JSON:", {
                length: stepsArray.length,
                firstStepTitle: stepsArray[0]?.title
              });
            }
          } catch (parseErr) {
            console.error("❌ FORM RENDERER - Error parsing steps from raw JSON:", parseErr);
          }
        }
      } catch (err) {
        console.error("❌ FORM RENDERER - Error extracting steps from raw config:", err);
      }
    }
    
    // Log the steps processing results
    console.log("📊 FORM RENDERER - Steps processing:", {
      originalStepsType: typeof formConfig.steps,
      isOriginalArray: Array.isArray(formConfig.steps),
      processedStepsLength: stepsArray.length,
      currentStep
    });
    
    // Check if we have any steps
    if (!stepsArray.length) {
      console.log("⚠️ FORM RENDERER - No steps found in formConfig:", formConfig);
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">This form has no steps. Please contact the form creator.</p>
        </div>
      );
    }

    if (isFormComplete) {
      // If submission data exists, use it; otherwise, create a default submission
      const submissionData = formConfig.submission || {
        title: "Thank You for Your Submission! 🎉",
        description: "We've received your information and will be in touch soon.",
        steps: [
          {
            title: "Request Received ✓",
            description: "We've successfully received your request."
          },
          {
            title: "Processing ⏱️",
            description: "Our team is reviewing your submission."
          },
          {
            title: "Next Steps 🚀",
            description: "We'll contact you soon with more information."
          }
        ]
      };
      return <SubmissionStep submission={submissionData} />;
    }

    // Check if currentStep is valid
    if (currentStep < 1 || currentStep > stepsArray.length) {
      console.log("⚠️ FORM RENDERER - Invalid currentStep:", {
        currentStep,
        totalSteps: stepsArray.length
      });
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Invalid step number. Please refresh the page.</p>
        </div>
      );
    }

    const step = stepsArray[currentStep - 1];
    if (!step) {
      console.log("⚠️ FORM RENDERER - Step not found:", {
        currentStep,
        totalSteps: stepsArray.length,
        steps: stepsArray
      });
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Step data not found. Please refresh the page.</p>
        </div>
      );
    }

    switch (step.type) {
      case "tiles":
        return <TilesStep step={step} />;
      case "multiSelect":
        return <MultiSelectStep step={step} />;
      case "dropdown":
        return <DropdownStep step={step} />;
      case "slider":
        return <SliderStep step={step} />;
      case "followup":
        return <FollowupStep step={step} />;
      case "textbox":
        return <TextboxStep step={step} />;
      case "location":
        return <LocationStep step={step} />;
      case "contact":
        return <ContactStep step={step} />;
      case "documentUpload":
        return <DocumentUploadStep step={step} />;
      case "documentInfo":
        return <DocumentInfoStep step={step} />;
      default:
        return null;
    }
  }, [currentStep, formConfig, isFormComplete]);

  const nextButtonText = useMemo(() => {
    if (currentStep === totalSteps) {
      return isSubmitting ? "Submitting..." : "Submit";
    }
    return formConfig?.ui?.buttons?.next || "Continue";
  }, [currentStep, totalSteps, isSubmitting, formConfig]);

  // Check if current step is a tiles step (single correct type that auto-advances)
  const isCurrentStepTiles = useMemo(() => {
    if (!formConfig) return false;
    
    // Process steps - handle both array and object formats
    let stepsArray = [];
    if (Array.isArray(formConfig.steps)) {
      stepsArray = formConfig.steps;
    } else if (typeof formConfig.steps === 'object' && formConfig.steps !== null) {
      // If it's an object with numeric keys like {0: {...}, 1: {...}}
      const keys = Object.keys(formConfig.steps).filter(k => !isNaN(Number(k))).sort((a, b) => Number(a) - Number(b));
      if (keys.length > 0) {
        stepsArray = keys.map(k => formConfig.steps[k]);
      }
    }
    
    if (!stepsArray.length || currentStep < 1 || currentStep > stepsArray.length) return false;
    
    const step = stepsArray[currentStep - 1];
    return step?.type === "tiles";
  }, [currentStep, formConfig]);

  // Check if current step is optional
  const isCurrentStepOptional = useMemo(() => {
    if (!formConfig) return false;
    
    // Process steps - handle both array and object formats
    let stepsArray = [];
    if (Array.isArray(formConfig.steps)) {
      stepsArray = formConfig.steps;
    } else if (typeof formConfig.steps === 'object' && formConfig.steps !== null) {
      // If it's an object with numeric keys like {0: {...}, 1: {...}}
      const keys = Object.keys(formConfig.steps).filter(k => !isNaN(Number(k))).sort((a, b) => Number(a) - Number(b));
      if (keys.length > 0) {
        stepsArray = keys.map(k => formConfig.steps[k]);
      }
    }
    
    if (!stepsArray.length || currentStep < 1 || currentStep > stepsArray.length) return false;
    
    return isStepOptional(currentStep - 1);
  }, [currentStep, formConfig, isStepOptional]);

  if (!formConfig) {
    return (
      <div className="aspect-[16/9] relative flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-center px-6">
          Loading form...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-white no-scrollbar" data-testid="embed-form-container">
      
      {/* Progress bar for embed */}
      <div className="p-6 border-b border-gray-200">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{
              width: `${Math.max(2, (currentStep / totalSteps) * 100)}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">
            Question {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
      </div>

      {/* Main Content - no scrolling, content fits in available space */}
      <div className="flex-grow flex flex-col px-6 pt-12 pb-4 no-scrollbar">
        <div className="flex-grow">{currentStepContent}</div>
      </div>

      {/* Fixed Footer Navigation (matches build form footer behavior) */}
      <div className="px-6 py-4 flex justify-between items-center bg-white border-t border-gray-200">
        <div className="flex gap-3">
            {currentStep > 1 && !isFormComplete && (
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center px-4 py-2"
                onClick={() => {
                  prevStep();
                  // Send height update message when changing steps
                  setTimeout(() => {
                    if (window.self !== window.top) {
                      // We're in an iframe, send height update to parent
                      const height = document.querySelector('[data-testid="embed-form-container"]')?.getBoundingClientRect().height || 
                                    document.documentElement.scrollHeight;
                      
                      window.parent.postMessage({ type: 'form-resize', height }, '*');
                      window.parent.postMessage({ type: 'heightUpdate', height }, '*');
                    }
                  }, 50); // Small delay to allow content to render
                }}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
          </div>
        <div className="flex gap-2">
          {!isFormComplete && !isCurrentStepTiles && (
            <>
              {isCurrentStepOptional && (
                <Button
                  variant="outline"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center px-4 py-2"
                  onClick={() => {
                    nextStep();
                    // Send height update message when changing steps
                    setTimeout(() => {
                      if (window.self !== window.top) {
                        // We're in an iframe, send height update to parent
                        const height = document.querySelector('[data-testid="embed-form-container"]')?.getBoundingClientRect().height || 
                                      document.documentElement.scrollHeight;
                        
                        window.parent.postMessage({ type: 'form-resize', height }, '*');
                        window.parent.postMessage({ type: 'heightUpdate', height }, '*');
                      }
                    }, 50); // Small delay to allow content to render
                  }}
                  disabled={isSubmitting}
                >
                  <SkipForwardIcon className="mr-2 h-4 w-4" />
                  Skip
                </Button>
              )}
              <Button
                className={`transition-all duration-200 flex items-center px-6 py-2 ${
                  isCurrentStepValid
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                }`}
                onClick={handleNextStep}
                disabled={isSubmitting || !isCurrentStepValid}
              >
                {nextButtonText}
                {currentStep < totalSteps && (
                  <ArrowRight className="ml-2 h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}