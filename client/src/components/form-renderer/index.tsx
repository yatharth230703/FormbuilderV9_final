import { useMemo, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { useLocation } from "wouter";
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
import { ArrowLeft, ArrowRight, SkipForward, SkipForwardIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FormConfig } from "@shared/types";

interface FormRendererProps {
  testMode?: boolean;
  formConfig?: FormConfig;
}

export default function FormRenderer({
  testMode = false,
  formConfig: propFormConfig,
}: FormRendererProps) {
  const [location] = useLocation();
  const {
    formConfig: contextFormConfig,
    setFormConfig,
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
    resetResponses,
    hasDocumentUploaded,
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

  // Auto-advance past document info steps when no document is available
  useEffect(() => {
    if (formConfig?.steps && currentStep <= formConfig.steps.length) {
      const currentStepData = formConfig.steps[currentStep - 1];
      if (currentStepData?.type === 'documentInfo' && !hasDocumentUploaded()) {
        // Automatically advance past document info step if no document was uploaded
        nextStep();
      }
    }
  }, [currentStep, formConfig, hasDocumentUploaded, nextStep]);

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
    if (!formConfig) return;
    //as any kyu bola isne ??
    console.log('Form Config at submit time:', formConfig); // <-- ADD THIS
    console.log('Form Config ID at submit time:', (formConfig as any)?.id); // <-- ADD THIS
    setIsSubmitting(true);

    try {
      if (!testMode) {
        const enhancedResponses = {
          formData: formResponses,
          questions: formConfig.steps.map((step) => ({
            title: step.title,
            subtitle: step.subtitle,
            type: step.type,
          })),
        };

        const formTitle = formConfig.steps?.[0]?.title || "Form Submission";

        const response = await apiRequest<{ id: number; message: string }>({
          url: "/api/submit",
          method: "POST",
          body: JSON.stringify({
            label: formTitle,
            language: "en",
            response: enhancedResponses,
            domain: null,
            form_config_id: (formConfig as any).id || null,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response)
          throw new Error("Failed to submit form - no server response");
      }

      setIsFormComplete(true);
      toast({
        title: "Form Submitted",
        description: testMode
          ? "Form submission successful (test mode)"
          : "Form has been submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Check if we're on the buildform route
      if (location === "/buildform") {
        toast({
          title: "Preview Mode",
          description: "THIS IS A PREVIEW, CAN NOT SUBMIT FORM",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? `Failed to submit the form: ${error.message}`
              : "Failed to submit the form",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepContent = useMemo(() => {
    if (!formConfig?.steps) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Enter a prompt to generate a form</p>
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
        // Check if a document was actually uploaded
        if (!hasDocumentUploaded()) {
          return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <SkipForward className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Document Available</h3>
              <p className="text-gray-500 mb-6">
                Since no document was uploaded in the previous step, this step has been skipped.
              </p>
              <Button
                onClick={nextStep}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Continue to Next Step
              </Button>
            </div>
          );
        }
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
          Enter a prompt in the left panel to generate a form
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-h-[calc(100vh-100px)] overflow-hidden relative flex flex-col rounded-xl shadow-md bg-white dark:bg-slate-900">
      {/* Simple progress bar at top FOR NOW ,REMOVING DARK BG SLATE 700*/}
      <div className="p-4">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${Math.max(1, (currentStep / totalSteps) * 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto px-6 pt-4 pb-4 hide-scrollbar">
        <div className="mb-4">{currentStepContent}</div>
      </div>

      {/* Fixed Footer Navigation */}
      <div
        className="px-6 py-4 flex justify-between items-center bg-white dark:bg-slate-900 border-t dark:border-slate-800"
      >
        <div className="flex gap-2">
          {currentStep > 1 && !isFormComplete && (
            //REMOVING THE DARK HOVER AND DARK TEXT OPTIONS
            <Button
              variant="ghost"
              className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-100 flex items-center"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-1 h-5 w-5" />
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {!isFormComplete && !isCurrentStepTiles && (
            <>
              {isCurrentStepOptional && (
                <Button
                  variant="outline"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center"
                  onClick={nextStep}
                  disabled={isSubmitting}
                >
                  <SkipForwardIcon className="mr-1 h-4 w-4" />
                  Skip
                </Button>
              )}
              <Button
                className={`transition-all duration-200 flex items-center ${
                  isCurrentStepValid
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                }`}
                onClick={handleNextStep}
                disabled={isSubmitting || !isCurrentStepValid}
              >
                {nextButtonText}
                {currentStep < totalSteps && (
                  <ArrowRight className="ml-1 h-5 w-5" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
