import dotenv from "dotenv";

dotenv.config();

/**
 * AI agent responsible for analyzing documents and answering questions
 * based on form content and document data (text, images, etc.)
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const DOCUMENT_ANALYSIS_SYSTEM_PROMPT = `You are a document analysis agent.

Your task is to:
1. Answer the specific question asked by the document info step
2. Provide ONLY the direct answer

CRITICAL RULES:
- Answer the question in 3-4 sentences maximum
- Do NOT mention "based on provided responses" or similar phrases
- Do NOT describe the document content or context
- Do NOT include document details or file names
- Focus ONLY on answering the question asked
- Use simple, clear language
- Output ONLY the answer, nothing else
- Do NOT use markdown formatting (no bold, italic, code, headers, bullets, etc.)
- Output plain text only`;

export interface DocumentAnalysisRequest {
  formResponses: Record<string, any>;
  documentContent?: string;
  documentUrl?: string;
  question: string;
  isImage: boolean;
}

export interface DocumentAnalysisResponse {
  answer: string;
  success: boolean;
  error?: string;
}

/**
 * Generates document analysis using Gemini AI
 * @param request Contains form responses, document content, and the question to answer
 * @returns Generated analysis answer
 */
export async function analyzeDocument(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResponse> {
  console.log('[DOCUMENT-ANALYZER] Starting document analysis with request:', {
    hasFormResponses: !!request.formResponses,
    formResponsesKeys: Object.keys(request.formResponses || {}),
    hasDocumentContent: !!request.documentContent,
    documentContentLength: request.documentContent?.length || 0,
    hasDocumentUrl: !!request.documentUrl,
    documentUrl: request.documentUrl,
    question: request.question,
    isImage: request.isImage
  });

  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not available for document analysis");
    return {
      success: false,
      error: "AI service unavailable",
      answer: generateFallbackAnswer(request)
    };
  }

  try {
    const prompt = buildAnalysisPrompt(request);
    console.log('[DOCUMENT-ANALYZER] Built prompt:', prompt);

    // Prepare the request body based on whether it's an image or text
    let requestBody;
    
    if (request.isImage && request.documentUrl) {
      // For images, we need to fetch the image data and encode it as base64
      try {
        console.log('[DOCUMENT-ANALYZER] Fetching image from URL:', request.documentUrl);
        const imageResponse = await fetch(request.documentUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        
        requestBody = {
          systemInstruction: {
            role: "system",
            parts: [{ text: DOCUMENT_ANALYSIS_SYSTEM_PROMPT }]
          },
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                { 
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                  }
                }
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096,
          },
        };
      } catch (imageError) {
        console.error('[DOCUMENT-ANALYZER] Error fetching image:', imageError);
        // Fallback to text-only if image fetch fails
        requestBody = {
          systemInstruction: {
            role: "system",
            parts: [{ text: DOCUMENT_ANALYSIS_SYSTEM_PROMPT }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 4096,
          },
        };
      }
    } else {
      // For text documents, use text-only parts
      requestBody = {
        systemInstruction: {
          role: "system",
          parts: [{ text: DOCUMENT_ANALYSIS_SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        },
      };
    }

    console.log('[DOCUMENT-ANALYZER] Request body for Gemini:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`Document Analysis API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: "Failed to analyze document",
        answer: generateFallbackAnswer(request)
      };
    }

    const data = await response.json();
    console.log('[DOCUMENT-ANALYZER] Raw Gemini API response:', JSON.stringify(data, null, 2));
    
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('[DOCUMENT-ANALYZER] Extracted analysis text:', analysisText);

    if (!analysisText) {
      console.error("Empty response from document analysis API");
      return {
        success: false,
        error: "Empty response from AI",
        answer: generateFallbackAnswer(request)
      };
    }

    // Clean the analysis text
    const cleanedAnswer = cleanAnalysisText(analysisText);
    console.log('[DOCUMENT-ANALYZER] After cleaning:', cleanedAnswer);

  // Final check: if the answer is still too long, truncate it
  const maxLength = 200; // Maximum characters for a concise answer
  let finalAnswer = cleanedAnswer;
  
  if (cleanedAnswer.length > maxLength) {
    // Find the first sentence or two and truncate
    const textContent = cleanedAnswer.replace(/<[^>]*>/g, '');
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
         if (sentences.length >= 2) {
               const shortAnswer = sentences.slice(0, 2).join('. ') + '.';
        finalAnswer = `<div class="analysis-content" style="text-align: center; line-height: 1.5; padding: 15px; font-size: 16px; color: #333; width: 100%; display: flex; justify-content: center; align-items: center;">${shortAnswer}</div>`;
     }
  }
  
  // Final cleaning: remove any remaining markdown artifacts
  finalAnswer = finalAnswer.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').replace(/_/g, '');
  
  console.log('[DOCUMENT-ANALYZER] Final answer before return:', finalAnswer);
  console.log('[DOCUMENT-ANALYZER] Final answer length:', finalAnswer.length);

  return {
    success: true,
    answer: finalAnswer
  };

  } catch (error) {
    console.error("Error analyzing document:", error);
    return {
      success: false,
      error: "AI service error",
      answer: generateFallbackAnswer(request)
    };
  }
}

/**
 * Builds the prompt for document analysis
 */
function buildAnalysisPrompt(request: DocumentAnalysisRequest): string {
  const { formResponses, documentContent, documentUrl, question, isImage } = request;

  console.log('[DOCUMENT-ANALYZER] Building prompt for:', { isImage, hasDocumentUrl: !!documentUrl, hasDocumentContent: !!documentContent });

  if (isImage) {
    return `
Question: ${question}

Document Type: Image
Image URL: ${documentUrl}

Please analyze this image and answer the question above in 1-2 sentences maximum. Do not mention form responses, document context, or any other details. Provide ONLY the direct answer to the question.
`;
  } else {
    return `
Question: ${question}

Document Type: Text-based document
Document Content: ${documentContent || "No text content available"}

Answer the question above in 1-2 sentences maximum. Do not mention form responses, document context, or any other details. Provide ONLY the direct answer to the question.
`;
  }
}

/**
 * Cleans the AI-generated analysis text
 */
function cleanAnalysisText(analysisText: string): string {
  console.log('[DOCUMENT-ANALYZER] Starting to clean text:', analysisText);
  
  // Remove markdown code blocks if present
  let cleaned = analysisText.replace(/```html\s*/g, '').replace(/```\s*/g, '');
  console.log('[DOCUMENT-ANALYZER] After removing code blocks:', cleaned);
  
  // Remove any HTML tags that might interfere with clean display
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  console.log('[DOCUMENT-ANALYZER] After removing HTML tags:', cleaned);
  
  // Remove ALL markdown formatting
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove **bold** text
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1'); // Remove *italic* text
  cleaned = cleaned.replace(/`(.*?)`/g, '$1'); // Remove `code` text
  cleaned = cleaned.replace(/_(.*?)_/g, '$1'); // Remove _underline_ text
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1'); // Remove ~~strikethrough~~ text
  console.log('[DOCUMENT-ANALYZER] After removing markdown formatting:', cleaned);
  
  // Remove context references and form response mentions
  cleaned = cleaned.replace(/based on (the )?provided (responses?|context|information)/gi, '');
  cleaned = cleaned.replace(/based on (the )?document (content|context)/gi, '');
  cleaned = cleaned.replace(/according to (the )?form responses?/gi, '');
  cleaned = cleaned.replace(/using (the )?provided (data|information)/gi, '');
  console.log('[DOCUMENT-ANALYZER] After removing context references:', cleaned);
  
  // Remove any remaining markdown-like patterns
  cleaned = cleaned.replace(/^#+\s*/gm, ''); // Remove headers
  cleaned = cleaned.replace(/^\s*\d+\.\s*/gm, ''); // Remove numbered lists
  console.log('[DOCUMENT-ANALYZER] After removing headers and lists:', cleaned);
  
  // Final aggressive markdown removal
  cleaned = cleaned.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').replace(/_/g, '');
  console.log('[DOCUMENT-ANALYZER] After final markdown removal:', cleaned);
  
  // Clean up extra whitespace and ensure proper sentence formatting
  cleaned = cleaned.trim().replace(/\s+/g, ' ');
  console.log('[DOCUMENT-ANALYZER] After whitespace cleanup:', cleaned);
  
  // Ensure sentences end properly and are well-formatted
  if (!cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
    cleaned += '.';
  }
  
  // Format as clean, readable text with center alignment
  cleaned = `<div class="analysis-content" style="text-align: center; line-height: 1.5; padding: 15px; font-size: 16px; color: #333; width: 100%; display: flex; justify-content: center; align-items: center;">${cleaned}</div>`;
  console.log('[DOCUMENT-ANALYZER] Final cleaned result:', cleaned);

  return cleaned;
}

/**
 * Generates a fallback answer when AI service is unavailable
 */
function generateFallbackAnswer(request: DocumentAnalysisRequest): string {
  const { question, isImage } = request;

  return `
    <div class="analysis-content" style="text-align: center; line-height: 1.5; padding: 15px; font-size: 16px; color: #333; width: 100%; display: flex; justify-content: center; align-items: center;">
      <p style="margin: 0;">
        AI analysis service is currently unavailable. We will contact you within 24-48 hours with a detailed analysis.
      </p>
    </div>
  `;
}
