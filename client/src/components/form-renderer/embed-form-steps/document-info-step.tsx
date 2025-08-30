
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
  const { updateResponse, formResponses, tempJson, formConfig } = useFormContext();
  const [quotationHtml, setQuotationHtml] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);
  const lastResponseRef = useRef<string | null>(null);

  // Get the question from the document upload step, not from this step
  const documentUploadStep = formConfig?.steps?.find((s: any) => s.type === 'documentUpload');
  const question = documentUploadStep?.title || documentUploadStep?.subtitle || step.title || step.subtitle || "Please analyze this document and provide relevant information.";
  
  console.log('[FRONTEND] Document upload step question:', {
    documentUploadStepTitle: documentUploadStep?.title,
    documentUploadStepSubtitle: documentUploadStep?.subtitle,
    fallbackTitle: step.title,
    fallbackSubtitle: step.subtitle,
    finalQuestion: question
  });

  // Static translation quotation prompt from user image
  const TRANSLATION_QUOTATION_PROMPT = `FOR TRANSLATION\n\nItem\tUnit\tTypical Unit Price (€)\n\nStandard certified translation\tper page\t65-80 €\n\nCertification stamp (sworn seal)\tper document\t15 €\n\nExpress service (48 h)\tsurcharge\t+30 % of base translation fee (≈ 20 € on one page)\n\nTracked domestic shipping\tflat\t5 €\n\n// If Express Service option is chosen then put the +30% surcharge\n// Add domestic shipping surcharge to all\n// Total displayed should be in a range and a sum.\n// Total will be multiplied based on number of pages\n// Add 19% VAT`;

  // Handle document analysis
  const handleAnalyzeDocument = async () => {
    setIsGenerating(true);
    try {
      console.log('[EmbedDocumentInfoStep] Analyzing document with Gemini...');
      const documentContent = tempJson.documentContent;
      const documentUrl = tempJson.documentUrl;
      console.log('[FRONTEND] Starting document analysis:', { 
        question, 
        tempJsonKeys: Object.keys(tempJson || {}),
        hasFormResponses: !!formResponses,
        formResponsesKeys: Object.keys(formResponses || {}),
        documentContent,
        documentUrl
      });
      
      const result = await generateQuotation({
        formResponses,
        documentData: tempJson,
        contentPrompt: question,
        formId: null, // No formId needed for this step
      });
      
      console.log('[FRONTEND] Gemini API response:', result);
      console.log('[FRONTEND] Response details:', {
        hasQuotation: !!result.quotation,
        quotationLength: result.quotation?.length || 0,
        quotationPreview: result.quotation?.substring(0, 200) + '...',
        quotationType: typeof result.quotation
      });
      let analysis = '';
      if (result && typeof result.quotation === 'string' && result.quotation.trim().length > 0) {
        analysis = result.quotation;
        console.log('[FRONTEND] Using quotation as analysis:', {
          analysisLength: analysis.length,
          analysisPreview: analysis.substring(0, 200) + '...'
        });
      } else {
        analysis = 'Failed to analyze document. Please try again.';
        console.log('[FRONTEND] No valid quotation, using fallback message');
      }
      
      console.log('[FRONTEND] Final analysis before setting state:', {
        analysis,
        analysisLength: analysis.length,
        analysisType: typeof analysis
      });
      
      setQuotationHtml(analysis);
      setShowQuotation(true);
      // Update response with the generated analysis
      updateResponse(step.title, analysis);
      lastResponseRef.current = analysis;
    } catch (error) {
      console.error('[EmbedDocumentInfoStep] Error analyzing document:', error);
      setQuotationHtml('An error occurred while analyzing the document. Please try again.');
      setShowQuotation(true);
      updateResponse(step.title, 'An error occurred while analyzing the document. Please try again.');
      lastResponseRef.current = 'An error occurred while analyzing the document. Please try again.';
    } finally {
      setIsGenerating(false);
    }
  };

  // No need to update response with tempJson HTML anymore

  useEffect(() => {
    handleAnalyzeDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex flex-col pt-4 sm:pt-3 pb-2 max-h-[90vh] max-w-full overflow-y-auto overflow-x-hidden px-4 hide-scrollbar space-y-4">
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
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <span className="text-base text-gray-700">Analyzing Document...</span>
          </div>
        ) : showQuotation ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] w-full" style={{ minHeight: "300px", maxHeight: step.config.maxHeight || "400px" }}>
            <div className="w-full flex flex-col items-center">
              {/* Content box with light blue borders */}
              <div className="w-full bg-gray-50 border-2 border-dotted border-blue-400 border-r-blue-500 rounded-lg p-4">
                <div className="w-full rounded-md py-3 mb-3 flex justify-center">
                  <span className="text-2xl font-semibold tracking-wide text-gray-900 text-center">Document Analysis</span>
                </div>
                <div className="w-full text-center mb-5">
                  <span className="text-sm text-gray-700 font-medium">Question: {documentUploadStep?.title || documentUploadStep?.subtitle || step.title || step.subtitle}</span>
                </div>
                <div className="w-full text-center mb-5">
                  <div
                    className="w-full flex justify-center items-center"
                    style={{ minHeight: 90 }}
                    dangerouslySetInnerHTML={{ __html: quotationHtml }}
                  />
                </div>
                <div className="w-full flex justify-center mt-3">
                  <span className="text-base text-gray-800 text-center">Analysis complete. Review the results above.</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
