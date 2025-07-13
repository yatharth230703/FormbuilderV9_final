import { useMemo, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import TilesStep from "./form-steps/tiles-step.tsx";
import MultiSelectStep from "./form-steps/multi-select-step";
import SliderStep from "./form-steps/slider-step";
import FollowupStep from "./form-steps/followup-step";
import TextboxStep from "./form-steps/textbox-step";
import LocationStep from "./form-steps/location-step";
import ContactStep from "./form-steps/contact-step";
import DocumentUploadStep from "./form-steps/document-upload-step";
import DocumentInfoStep from "./form-steps/document-info-step";
import SubmissionStep from "./form-steps/submission-step";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
    resetResponses,
  } = useFormContext();

  // Use prop formConfig if provided, otherwise use context formConfig
  const formConfig = propFormConfig || contextFormConfig;

  // If prop formConfig is provided, update the context
  useEffect(() => {
    if (propFormConfig && propFormConfig !== contextFormConfig) {
      setFormConfig(propFormConfig);
    }
  }, [propFormConfig, contextFormConfig, setFormConfig]);

  const { toast } = useToast();

  const handleNextStep = () => {
    const isValid = validateCurrentStep();
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please complete this step before continuing",
        variant: "destructive",
      });
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
    console.log('Form Config at submit time:', formConfig); // <-- ADD THIS
    console.log('Form Config ID at submit time:', formConfig?.id); // <-- ADD THIS
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
            form_config_id: formConfig.id, // <-- add this line!!
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
    if (!formConfig?.ui) return "Continue";
    if (currentStep === totalSteps) {
      return isSubmitting
        ? formConfig.ui.buttons.submitting || "Submitting..."
        : formConfig.ui.buttons.submit || "Submit";
    }
    return formConfig.ui.buttons.next || "Continue";
  }, [currentStep, totalSteps, formConfig, isSubmitting]);

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
      <div className="flex-1 overflow-auto px-6 pt-12 pb-4 hide-scrollbar">
        <div className="mb-4">{currentStepContent}</div>
      </div>

      {/* Fixed Footer Navigation */}
      <div
        className={`px-6 py-4 flex justify-between items-center ${
          formConfig.steps[currentStep - 1]?.type !== "tiles"
            ? "bg-white dark:bg-slate-900 border-t dark:border-slate-800"
            : ""
        }`}
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
        {!isFormComplete &&
          formConfig.steps[currentStep - 1]?.type !== "tiles" && (
            <Button
              className="bg-primary text-white hover:bg-primary/90 transition-colors flex items-center"
              onClick={handleNextStep}
              disabled={isSubmitting}
            >
              {nextButtonText}
              {currentStep < totalSteps && (
                <ArrowRight className="ml-1 h-5 w-5" />
              )}
            </Button>
          )}
      </div>
    </div>
  );
}
