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

  // Use prop formConfig if provided, otherwise use context formConfig
  const formConfig = propFormConfig || contextFormConfig;

  // If prop formConfig is provided, update the context
  useEffect(() => {
    if (propFormConfig && propFormConfig !== contextFormConfig) {
      setFormConfig(propFormConfig);
    }
  }, [propFormConfig, contextFormConfig, setFormConfig]);

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
    if (!formConfig?.steps) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading form...</p>
        </div>
      );
    }

    if (isFormComplete && formConfig.submission) {
      return <SubmissionStep submission={formConfig.submission} />;
    }

    const step = formConfig.steps[currentStep - 1];
    if (!step) return null;

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
    if (!formConfig?.steps) return false;
    const step = formConfig.steps[currentStep - 1];
    return step?.type === "tiles";
  }, [currentStep, formConfig]);

  // Check if current step is optional
  const isCurrentStepOptional = useMemo(() => {
    if (!formConfig?.steps) return false;
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
    <div className="w-full h-screen overflow-hidden relative flex flex-col bg-white">
      
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

      {/* Main Content - scroll only inside content area (matches build form) */}
      <div className="flex-1 overflow-auto px-6 pt-12 pb-4 hide-scrollbar">
        <div className="mb-6">{currentStepContent}</div>
      </div>

      {/* Fixed Footer Navigation (matches build form footer behavior) */}
      <div className="px-6 py-4 flex justify-between items-center bg-white border-t border-gray-200">
        <div className="flex gap-3">
            {currentStep > 1 && !isFormComplete && (
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center px-4 py-2"
                onClick={prevStep}
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
                  onClick={nextStep}
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