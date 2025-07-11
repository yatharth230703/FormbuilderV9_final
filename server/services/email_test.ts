
import { sendFormResponseEmail } from "./email";

/**
 * Test function to verify email sending functionality
 * This is a temporary file for testing purposes
 */
async function testEmailFunctionality() {
  console.log("Starting email test...");
  
  try {
    const testData = {
      fromEmail: "test@example.com",
      toEmail: "vasub0723@gmail.com",
      formLabel: "Test Form - Email Functionality Check",
      responseData: {
        "Name": "Test User",
        "Email": "vasub0723@gmail.com",
        "Message": "This is a test email to verify the email service is working correctly sent from replit.",
        "Test Type": "Email Service Verification",
        "Timestamp": new Date().toISOString(),
        "Form ID": "TEST-001"
      }
    };

    console.log(`[Email Test] Attempting to send test email to: ${testData.toEmail}`);
    console.log(`[Email Test] Form: ${testData.formLabel}`);
    console.log(`[Email Test] Sample data:`, testData.responseData);

    await sendFormResponseEmail(
      testData.fromEmail,
      testData.toEmail,
      testData.formLabel,
      testData.responseData
    );

    console.log("[Email Test] ✅ Test email sent successfully!");
    console.log("[Email Test] Check your inbox at vasub0723@gmail.com");
    
  } catch (error) {
    console.error("[Email Test] ❌ Failed to send test email:", error);
    throw error;
  }
}

// Export the test function
export { testEmailFunctionality };

// If this file is run directly, execute the test
// Check if this is the main module in ES modules
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailFunctionality()
    .then(() => {
      console.log("[Email Test] Test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Email Test] Test failed:", error);
      process.exit(1);
    });
}
