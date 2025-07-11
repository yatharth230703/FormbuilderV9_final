import { Resend } from "resend";
import dotenv from "dotenv";
import { fileLogger } from "./file-logger";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends form response data to the user via email
 * @param fromEmail - Email of the form creator (sender)
 * @param toEmail - Email of the form respondent (receiver)
 * @param formLabel - Label/title of the form
 * @param responseData - The form response data
 */
export async function sendFormResponseEmail(
  fromEmail: string,
  toEmail: string,
  formLabel: string,
  responseData: Record<string, any>,
): Promise<void> {
  try {
    // Format the response data for email display
    const formattedResponse = Object.entries(responseData)
      .map(([key, value]) => {
        const displayValue =
          typeof value === "object"
            ? JSON.stringify(value, null, 2)
            : String(value);
        return `<strong>${key}:</strong> ${displayValue}`;
      })
      .join("<br/>");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Form Submission Confirmation</h2>
        <p>Thank you for submitting the form: <strong>${formLabel}</strong></p>
        
        <h3>Your Response:</h3>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${formattedResponse}
        </div>
        
        <p style="margin-top: 20px; color: #666;">
          This is an automated confirmation email. Please do not reply to this email.
        </p>
      </div>
    `;
    fileLogger.info('email-service', `Sending email to ${toEmail} for form: ${formLabel}`);
    fileLogger.info('email-service', `Email data: ${JSON.stringify({ fromEmail, formLabel, responseKeys: Object.keys(responseData) })}`);
    
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: toEmail,
      subject: `Form Submission Confirmation - ${formLabel}`,
      html: htmlContent,
    });

    fileLogger.info('email-service', `Email sent successfully to ${toEmail} for form: ${formLabel}`);
  } catch (error) {
    fileLogger.error('email-service', `Error sending email: ${error}`);
    throw new Error("Failed to send confirmation email");
  }
}
