
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
      console.log('[EmbedDocumentInfoStep] Generating quotation with Gemini...');
      const documentContent = tempJson.documentContent;
      const contentGenerationPrompt = TRANSLATION_QUOTATION_PROMPT;
      console.log('[EmbedDocumentInfoStep] Sending data:', { formResponses, documentContent, tempJson, contentGenerationPrompt });
      const result = await generateQuotation({
        formResponses,
        documentData: tempJson,
        contentPrompt: contentGenerationPrompt,
        formId: null, // No formId needed for this step
      });
      console.log('[EmbedDocumentInfoStep] Gemini API response:', result);
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
      console.error('[EmbedDocumentInfoStep] Error generating quotation:', error);
      setQuotationHtml('An error occurred while generating the quotation. Please try again.');
      setShowQuotation(true);
      updateResponse(step.title, 'An error occurred while generating the quotation. Please try again.');
      lastResponseRef.current = 'An error occurred while generating the quotation. Please try again.';
    } finally {
      setIsGenerating(false);
    }
  };

  // No need to update response with tempJson HTML anymore

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">
          {step.title}
        </h2>
        {step.subtitle && (
          <p className="text-gray-600">
            {step.subtitle}
          </p>
        )}
      </div>

      <div className="max-w-full">
        {!showQuotation ? (
          <div className="text-center">
            <Button 
              onClick={handleGenerateQuotation}
              disabled={isGenerating}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Receive Quotation
                </>
              )}
            </Button>
          </div>
        ) : (
          <div 
            className="bg-white border border-gray-200 rounded-lg p-4 overflow-auto"
            style={{ 
              maxHeight: step.config.maxHeight || "400px",
              minHeight: "300px"
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-900 text-sm">Generated Quotation</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowQuotation(false)}
                className="text-xs"
              >
                Back
              </Button>
            </div>
            <div 
              className="quotation-display text-sm"
              dangerouslySetInnerHTML={{ __html: quotationHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
