
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
      html += `<div style="margin-bottom: 16px;">`;
      html += `<h3 style="color: #374151; font-weight: 600; margin-bottom: 6px; font-size: 14px;">${key}</h3>`;
      
      // Special handling for document upload step (contains object with documentUrl)
      if (typeof value === 'object' && value !== null && 'documentUrl' in value) {
        // Extract filename from URL for display
        const urlParts = value.documentUrl.split('/');
        const fileName = urlParts[urlParts.length - 1].replace(/^\d+_/, '');
        html += `<p style="color: #6B7280; line-height: 1.5; margin: 0; font-size: 13px;">📄 ${fileName}</p>`;
      }
      // Special handling for documentContent (extracted text)
      else if (key === 'documentContent') {
        html += `<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; max-height: 150px; overflow-y: auto;">`;
        html += `<p style="color: #374151; line-height: 1.5; margin: 0; font-size: 12px; white-space: pre-wrap;">${String(value)}</p>`;
        html += `</div>`;
      }
      // Regular form responses
      else {
        html += `<p style="color: #6B7280; line-height: 1.5; margin: 0; font-size: 13px;">${String(value)}</p>`;
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
      console.error('[EmbedDocumentInfoStep] Error generating quotation:', error);
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
          <>
            <div 
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto mb-4"
              style={{ 
                maxHeight: step.config.maxHeight,
                minHeight: "180px"
              }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium text-gray-900 text-sm">Document Information</span>
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
          </>
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
