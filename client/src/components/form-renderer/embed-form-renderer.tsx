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
import { ArrowLeft, ArrowRight } from "lucide-react";
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
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Determine form ID - either from prop or from config
      const submissionFormId = formId || (formConfig as any)?.id || null;

      // Use the correct endpoint with form ID
      await apiRequest({
        url: `/api/forms/${submissionFormId}/submit`,
        method: "POST",
        body: JSON.stringify(formResponses),
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
    <div className="w-full min-h-screen flex flex-col bg-white">
      
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
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 flex-1">
        <div className="mb-6">{currentStepContent}</div>
      </div>

      {/* Footer Navigation for embed */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white mt-auto">
        <div className="flex justify-between items-center">
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

          {!isFormComplete && (
              <Button
                className="bg-primary text-white hover:bg-primary/90 transition-all duration-200 flex items-center px-6 py-2"
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                {nextButtonText}
                {currentStep < totalSteps && (
                  <ArrowRight className="ml-2 h-4 w-4" />
                )}
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}