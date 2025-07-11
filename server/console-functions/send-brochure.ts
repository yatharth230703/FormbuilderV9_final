import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendBrochureCondition {
  [responseKey: string]: boolean;
}

export interface SendBrochureOptions {
  formId: number;
  conditionResult: SendBrochureCondition;
  formResponse: Record<string, any>;
  brochureText: string; // User-provided brochure text from console config
  recipientEmail: string;
  formLabel: string;
}

/**
 * Send brochure console function
 * This function sends a brochure email to the user when specific keywords
 * are found in the form response based on AI-processed conditions
 * 
 * @param options - Configuration object containing form details and brochure content
 * @returns Promise<boolean> indicating success or failure
 */
export async function sendBrochure(options: SendBrochureOptions): Promise<boolean> {
  const { 
    formId, 
    conditionResult, 
    formResponse, 
    brochureText, 
    recipientEmail, 
    formLabel 
  } = options;
  
  console.log(`[Console Function] Send brochure triggered for form ${formId}`);
  console.log(`[Console Function] Full formResponse:`, JSON.stringify(formResponse));
  console.log(`[Console Function] Brochure trigger conditionResult:`, JSON.stringify(conditionResult));
  
  try {
    // Check if any conditions are met
    const shouldSendBrochure = checkBrochureConditions(formResponse, conditionResult);
    
    if (!shouldSendBrochure) {
      console.log(`[Console Function] Brochure conditions not met for form ${formId}`);
      return false;
    }
    
    // Validate email address
    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      console.error(`[Console Function] Invalid recipient email: ${recipientEmail}`);
      return false;
    }
    
    // Prepare email content
    const emailSubject = `Brochure - ${formLabel}`;
    const emailHtml = formatBrochureEmail(brochureText, formLabel);
    
    // Send the brochure email
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: recipientEmail,
      subject: emailSubject,
      html: emailHtml,
    });
    
    console.log(`[Console Function] Brochure sent successfully to ${recipientEmail} for form ${formId}`);
    return true;
    
  } catch (error) {
    console.error(`[Console Function] Error sending brochure for form ${formId}:`, error);
    return false;
  }
}

/**
 * Check if brochure conditions are met based on form response
 * @param formResponse - The form response data
 * @param conditionResult - The AI-processed condition result
 * @returns Boolean indicating if brochure should be sent
 */
function valueExistsInResponse(obj: any, target: string): boolean {
  if (typeof obj === 'string') {
    const match = obj === target;
    if (match) console.log(`[Console Function] Value match found: ${obj} === ${target}`);
    return match;
  }
  if (Array.isArray(obj)) {
    const match = obj.includes(target);
    if (match) console.log(`[Console Function] Array value match found: ${JSON.stringify(obj)} includes ${target}`);
    return match;
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj).some(val => valueExistsInResponse(val, target));
  }
  return false;
}

export function checkBrochureConditions(
  formResponse: Record<string, any>,
  conditionResult: SendBrochureCondition
): boolean {
  console.log(`[Console Function] Checking brochure conditions...`);
  for (const [responseKey, shouldTrigger] of Object.entries(conditionResult)) {
    console.log(`[Console Function] Checking responseKey: ${responseKey}, shouldTrigger: ${shouldTrigger}`);
    if (shouldTrigger === true) {
      // Check if the response value matches the trigger
      if (valueExistsInResponse(formResponse, responseKey)) {
        console.log(`[Console Function] Brochure condition met for value: ${responseKey}`);
        return true;
      }
      console.log(`[Console Function] No match for value: ${responseKey} in formResponse`);
    }
  }
  console.log(`[Console Function] No brochure trigger conditions matched.`);
  return false;
}

/**
 * Format the brochure email HTML
 * @param brochureText - The user-provided brochure text from console config
 * @param formLabel - The form label for context
 * @returns Formatted HTML email content
 */
function formatBrochureEmail(brochureText: string, formLabel: string): string {
  // Convert plain text to HTML, preserving line breaks
  const htmlContent = brochureText.replace(/\n/g, '<br>');
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="border-bottom: 2px solid #0E565B; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #0E565B; margin: 0;">Information Request - ${formLabel}</h2>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: #333; line-height: 1.6; margin: 0;">
          ${htmlContent}
        </p>
      </div>
      
      <div style="border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          This brochure was sent based on your form submission. 
          If you have any questions, please contact us.
        </p>
      </div>
    </div>
  `;
}

/**
 * Simple email validation
 * @param email - Email address to validate
 * @returns Boolean indicating if email is valid
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Utility function to extract email from form response
 * @param formResponse - The form response data
 * @returns Email address if found, null otherwise
 */
export function extractEmailFromResponse(formResponse: Record<string, any>): string | null {
  // Common email field names
  const emailFields = ['email', 'Email', 'emailAddress', 'email_address', 'contact_email', 'user_email'];
  
  for (const field of emailFields) {
    if (formResponse[field] && isValidEmail(formResponse[field])) {
      return formResponse[field];
    }
  }
  
  // Check for nested email fields
  for (const [key, value] of Object.entries(formResponse)) {
    if (typeof value === 'object' && value !== null) {
      for (const emailField of emailFields) {
        if (value[emailField] && isValidEmail(value[emailField])) {
          return value[emailField];
        }
      }
    }
  }
  
  return null;
}

/**
 * Get response elements that could trigger brochure sending
 * @param formResponse - The form response data
 * @returns Array of response keys that contain text content
 */
export function getResponseElementsForCondition(formResponse: Record<string, any>): string[] {
  const elements: string[] = [];
  
  function extractKeys(obj: any, prefix: string = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string' || typeof value === 'number') {
        elements.push(fullKey);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string' || typeof item === 'number') {
            elements.push(`${fullKey}[${index}]`);
          } else if (typeof item === 'object' && item !== null) {
            extractKeys(item, `${fullKey}[${index}]`);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        extractKeys(value, fullKey);
      }
    }
  }
  
  extractKeys(formResponse);
  return elements;
}