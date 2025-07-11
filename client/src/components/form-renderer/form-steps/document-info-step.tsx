
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

  // Function to generate HTML from tempJson
  const generateHtmlFromTempJson = (data: Record<string, any>): string => {
    let html = '';
    
    Object.entries(data).forEach(([key, value]) => {
      html += `<div style="margin-bottom: 20px;">`;
      html += `<h3 style="color: #374151; font-weight: 600; margin-bottom: 8px; font-size: 16px;">${key}</h3>`;
      
      // Special handling for document upload step (contains object with documentUrl)
      if (typeof value === 'object' && value !== null && 'documentUrl' in value) {
        // Extract filename from URL for display
        const urlParts = value.documentUrl.split('/');
        const fileName = urlParts[urlParts.length - 1].replace(/^\d+_/, '');
        html += `<p style="color: #6B7280; line-height: 1.5; margin: 0; font-size: 14px;">📄 ${fileName}</p>`;
      }
      // Special handling for documentContent (extracted text)
      else if (key === 'documentContent') {
        html += `<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; max-height: 200px; overflow-y: auto;">`;
        html += `<p style="color: #374151; line-height: 1.5; margin: 0; font-size: 13px; white-space: pre-wrap;">${String(value)}</p>`;
        html += `</div>`;
      }
      // Regular form responses
      else {
        html += `<p style="color: #6B7280; line-height: 1.5; margin: 0; font-size: 14px;">${String(value)}</p>`;
      }
      
      html += `</div>`;
    });
    
    return html || '<p style="color: #6B7280; font-style: italic;">No form data available yet.</p>';
  };

  const documentInfoHtml = generateHtmlFromTempJson(tempJson);

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
      if (result && typeof result.quotation === 'string' && result.quotation.trim().length > 0) {
        setQuotationHtml(result.quotation);
        setShowQuotation(true);
      } else if (result && typeof (result as any).quotationHtml === 'string' && (result as any).quotationHtml.trim().length > 0) {
        setQuotationHtml((result as any).quotationHtml);
        setShowQuotation(true);
      } else {
        setQuotationHtml('Failed to generate quotation. Please try again.');
        setShowQuotation(true);
      }
    } catch (error) {
      console.error('[DocumentInfoStep] Error generating quotation:', error);
      setQuotationHtml('An error occurred while generating the quotation. Please try again.');
      setShowQuotation(true);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const currentValue = showQuotation ? quotationHtml : documentInfoHtml;
    if (lastResponseRef.current !== currentValue) {
      updateResponse(step.title, currentValue);
      lastResponseRef.current = currentValue;
    }
    // Only depend on values that should trigger a change
  }, [step.title, quotationHtml, documentInfoHtml, showQuotation]);

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
        {!showQuotation ? (
          <>
            <div 
              className="bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-auto mb-6"
              style={{ 
                maxHeight: step.config.maxHeight,
                minHeight: "200px"
              }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900">Document Information</span>
              </div>
              
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: documentInfoHtml }}
              />
            </div>

            <div className="text-center">
              <Button 
                onClick={handleGenerateQuotation}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Quotation...
                  </>
                ) : (
                  <>
                    <FileCheck className="mr-2 h-5 w-5" />
                    Receive Quotation
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div 
            className="bg-white border border-gray-200 rounded-lg p-6 overflow-auto"
            style={{ 
              maxHeight: step.config.maxHeight || "600px",
              minHeight: "400px"
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Generated Quotation</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowQuotation(false)}
              >
                Back to Document Info
              </Button>
            </div>
            
            <div 
              className="quotation-display"
              dangerouslySetInnerHTML={{ __html: quotationHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
