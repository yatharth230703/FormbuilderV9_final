
import { useEffect, useState, useRef } from "react";
import { useFormContext } from "@/contexts/form-context";
import { DocumentInfoStep as DocumentInfoStepType } from "@shared/types";
import { FileText, FileCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateQuotation } from "@/services/api";

interface DocumentInfoStepProps {
  step: DocumentInfoStepType;
}

export default function DocumentInfoStep({ step }: DocumentInfoStepProps) {
  const { updateResponse, formResponses, tempJson } = useFormContext();
  const [quotationHtml, setQuotationHtml] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);
  const lastResponseRef = useRef<string | null>(null);

  // Static translation quotation prompt from user image
  const TRANSLATION_QUOTATION_PROMPT = `FOR TRANSLATION\n\nItem\tUnit\tTypical Unit Price (€)\n\nStandard certified translation\tper page\t65-80 €\n\nCertification stamp (sworn seal)\tper document\t15 €\n\nExpress service (48 h)\tsurcharge\t+30 % of base translation fee (≈ 20 € on one page)\n\nTracked domestic shipping\tflat\t5 €\n\n// If Express Service option is chosen then put the +30% surcharge\n// Add domestic shipping surcharge to all\n// Total displayed should be in a range and a sum.\n// Total will be multiplied based on number of pages\n// Add 19% VAT`;

  // Handle quotation generation
  const handleGenerateQuotation = async () => {
    setIsGenerating(true);
    try {
      console.log('[DocumentInfoStep] Generating quotation with Gemini...');
      const documentContent = tempJson.documentContent;
      const contentGenerationPrompt = TRANSLATION_QUOTATION_PROMPT;
      console.log('[DocumentInfoStep] Sending data:', { formResponses, documentContent, tempJson, contentGenerationPrompt });
      const result = await generateQuotation({
        formResponses,
        documentData: tempJson,
        contentPrompt: contentGenerationPrompt,
        formId: null, // No formId needed for this step
      });
      console.log('[DocumentInfoStep] Gemini API response:', result);
      let quotation = '';
      if (result && typeof result.quotation === 'string' && result.quotation.trim().length > 0) {
        quotation = result.quotation;
      } else if (result && typeof (result as any).quotationHtml === 'string' && (result as any).quotationHtml.trim().length > 0) {
        quotation = (result as any).quotationHtml;
      } else {
        quotation = 'Failed to generate quotation. Please try again.';
      }
      setQuotationHtml(quotation);
      setShowQuotation(true);
      // Only update response with the generated quotation
      updateResponse(step.title, quotation);
      lastResponseRef.current = quotation;
    } catch (error) {
      console.error('[DocumentInfoStep] Error generating quotation:', error);
      setQuotationHtml('An error occurred while generating the quotation. Please try again.');
      setShowQuotation(true);
      updateResponse(step.title, 'An error occurred while generating the quotation. Please try again.');
      lastResponseRef.current = 'An error occurred while generating the quotation. Please try again.';
    } finally {
      setIsGenerating(false);
    }
  };

  // No need to update response with tempJson HTML anymore

  useEffect(() => {
    handleGenerateQuotation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          {step.title}
        </h2>
        {step.subtitle && (
          <p className="text-gray-600 text-lg">
            {step.subtitle}
          </p>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <span className="text-lg text-gray-700">Generating Quotation...</span>
          </div>
        ) : showQuotation ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] w-full" style={{ minHeight: "400px", maxHeight: step.config.maxHeight || "600px" }}>
            <div className="w-full flex flex-col items-center">
              <div className="w-full bg-gray-100 py-2 mb-8 flex justify-center">
                <span className="text-6xl font-light tracking-wide text-gray-900 text-center">YOUR ESTIMATED TOTAL</span>
              </div>
              <div className="w-full flex justify-center mb-8">
                <div className="bg-orange-300 rounded border border-gray-400 flex items-center justify-center" style={{ minWidth: 350, minHeight: 120, maxWidth: 500, width: "100%" }}>
                  <span className="text-3xl text-black text-center font-normal" dangerouslySetInnerHTML={{ __html: quotationHtml }} />
                </div>
              </div>
              <div className="w-full flex flex-col items-center mt-4">
                <span className="text-lg text-black mb-2">(including VAT and Surcharge)</span>
                <span className="text-xl text-black text-center">Accurate price will be sent to your email by our partner soon (in 12-24hrs)</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-8"
                onClick={() => setShowQuotation(false)}
              >
                Back to Document Info
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
