import dotenv from "dotenv";

dotenv.config();

/**
 * AI agent responsible for generating structured quotations
 * based on form content and document data
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent";

const TRANSLATION_PRICING_PROMPT = `FOR TRANSLATION\nItem\nUnit\nTypical Unit Price (€)\nStandard certified translation\nper page\n65-80 € \nCertification stamp (sworn seal)\nper document\n15 € \nExpress service (48 h)\nsurcharge\n+30 % of base translation fee (≈ 20 € on one page) \nTracked domestic shipping\nflat\n5 € \n\n// If Express Service option is chosen then put the +30% surcharge \n// Add domestic shipping surcharge to all\n// Total displayed should be in a range and a sum. \n// Total will be multiplied based on number of pages\n// Add 19% VAT`;

const QUOTATION_SYSTEM_PROMPT = `You are a translation price estimation agent.\n\nYour task is to:\n1. Analyze the provided form responses and document content\n2. Use the following translation pricing structure:\n${TRANSLATION_PRICING_PROMPT}\n3. Calculate the estimated price range for the user's translation request, following all rules in the pricing prompt.\n4. If Express Service is selected, add the 30% surcharge. Always add the domestic shipping fee. Multiply by number of pages if provided. Add 19% VAT.\n\nCRITICAL RULES:\n- Return ONLY 1-2 lines of content, citing the estimated price range (e.g., \"Estimated total: 120-150 € (including VAT and surcharges)\").\n- Do NOT generate a full business quotation, no headers, no lengthy text, no official formatting.\n- Be concise and clear.\n- Output only the price estimate, nothing else.`;

export interface QuotationRequest {
  formResponses: Record<string, any>;
  documentContent?: string;
  contentGenerationPrompt: string;
}

export interface QuotationResponse {
  quotationHtml: string;
  success: boolean;
  error?: string;
}

/**
 * Generates a structured quotation using Gemini AI
 * @param request Contains form responses, document content, and generation prompt
 * @returns Generated quotation as HTML
 */
export async function generateQuotation(request: QuotationRequest): Promise<QuotationResponse> {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not available for quotation generation");
    return {
      success: false,
      error: "AI service unavailable",
      quotationHtml: generateFallbackQuotation(request)
    };
  }

  try {
    const prompt = buildQuotationPrompt(request);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          role: "system",
          parts: [{ text: QUOTATION_SYSTEM_PROMPT }]
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
      }),
    });

    if (!response.ok) {
      console.error(`Quotation API error: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: "Failed to generate quotation",
        quotationHtml: generateFallbackQuotation(request)
      };
    }

    const data = await response.json();
    const quotationText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!quotationText) {
      console.error("Empty response from quotation API");
      return {
        success: false,
        error: "Empty response from AI",
        quotationHtml: generateFallbackQuotation(request)
      };
    }

    // Clean and format the quotation
    const cleanedQuotation = cleanQuotationHtml(quotationText);

    return {
      success: true,
      quotationHtml: cleanedQuotation
    };

  } catch (error) {
    console.error("Error generating quotation:", error);
    return {
      success: false,
      error: "AI service error",
      quotationHtml: generateFallbackQuotation(request)
    };
  }
}

/**
 * Builds the prompt for quotation generation
 */
function buildQuotationPrompt(request: QuotationRequest): string {
  const { formResponses, documentContent, contentGenerationPrompt } = request;

  return `
You are a professional quotation generator. Based on the following information, create a structured, formal quotation:

Document Information:
${JSON.stringify(documentContent, null, 2)}

Form Responses:
${JSON.stringify(formResponses, null, 2)}

${contentGenerationPrompt ? `
Quotation Template/Pricing Structure:
${contentGenerationPrompt}

Please use this template as the basis for your quotation. Follow the pricing structure, calculate totals according to the specified rules, and present it in a professional format.
` : `
Content Generation Prompt:
${contentGenerationPrompt || 'Generate a professional quotation based on the provided information'}
`}

Please generate a formal quotation that includes:
1. Header with company information
2. Client details
3. Service description
4. Itemized pricing (following the template if provided)
5. Calculated totals with any applicable surcharges and taxes
6. Terms and conditions
7. Final total amount

The quotation should be professional, clear, and ready for client presentation. If a pricing template was provided, ensure all calculations follow the specified rules (e.g., surcharges, VAT, per-page multipliers).
  `;
}

/**
 * Cleans and formats the AI-generated quotation HTML
 */
function cleanQuotationHtml(quotationText: string): string {
  // Remove markdown code blocks if present
  let cleaned = quotationText.replace(/```html\s*/g, '').replace(/```\s*/g, '');

  // Ensure proper HTML structure
  if (!cleaned.includes('<div') && !cleaned.includes('<html')) {
    cleaned = `<div class="quotation-content">${cleaned}</div>`;
  }

  return cleaned;
}

/**
 * Generates a fallback quotation when AI service is unavailable
 */
function generateFallbackQuotation(request: QuotationRequest): string {
  const { formResponses, contentGenerationPrompt } = request;

  return `
    <div class="quotation-content">
      <div style="text-align: center; margin-bottom: 30px; padding: 20px; border-bottom: 2px solid #0E565B;">
        <h1 style="color: #0E565B; margin: 0; font-size: 28px;">PROFESSIONAL QUOTATION</h1>
        <p style="color: #6a6a6a; margin: 5px 0 0 0;">Quote #${Date.now()}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Project Requirements</h3>
        <p style="color: #6B7280; line-height: 1.6;">${contentGenerationPrompt}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Service Details</h3>
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
          <p style="color: #374151; margin: 0; line-height: 1.6;">
            Based on your requirements, we will provide comprehensive services tailored to your specific needs.
            A detailed proposal will be prepared and sent to you within 24-48 hours.
          </p>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Next Steps</h3>
        <ol style="color: #6B7280; line-height: 1.6;">
          <li>Review of submitted information and documents</li>
          <li>Detailed project analysis and planning</li>
          <li>Comprehensive quotation preparation</li>
          <li>Direct contact for discussion and clarification</li>
        </ol>
      </div>

      <div style="background: #0E565B; color: white; padding: 20px; border-radius: 6px; text-align: center;">
        <p style="margin: 0; font-weight: 600;">Thank you for your interest in our services!</p>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">We will contact you soon with a detailed quotation.</p>
      </div>
    </div>
  `;
}