import { FormConfig } from "@shared/types";
import { generateIconsFromOptions } from "./icons"; 
import dotenv from "dotenv";

dotenv.config();

/**
 * This module handles interactions with the Google Gemini API
 * for generating form configurations from natural language prompts
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// System prompt that instructs Gemini how to structure the form JSON
const SYSTEM_PROMPT = `You are a form generation engine that creates multi-step forms based on given prompts.
Output ONLY valid JSON without any explanation or extra text.
Make sure you extract all keywords from the prompt and include relevant questions that address the user's specific needs. If in the given prompt you feel the need to add a document upload step , add it .This can usually be deduced by looking for keywords like 'upload document' or 'try our service' or 'get a quote'.

CRITICAL RULES FOR TITLES AND QUESTIONS:
1. Each title and subtitle MUST be unique across all steps, and should never be untitled. It should hold significance. The title must be a question and the subtitle must be related to that question. No need for very long titles or subtitles, they should be to the point . FOR LOCATION STEP SUBTITLES ONLY POSTAL CODE IS REQUIRED SINCE THAT IS THE ONLY VALUE WE ASK OUR USER TO INPUT 
2. Never repeat the same question in different formats
3. Avoid semantically similar questions (e.g., "What's your budget?" vs "How much can you spend?")
4. Use distinct icons for each step
5. Ensure each option within tiles/multiSelect steps has a unique title
6. Make sure that the tiles step is always having only and exclusively 4 options . No other amount of options ,only 4 .
7. Make each step focus on a distinct aspect of information gathering
8. Make sure the dropdown slide has anywhere between 3-6 options . no more no less
9. Make sure the 'type' key strictly has one of the following values from the list , absolutely nothing else: [ tiles, multiSelect, dropdown, slider, followup, textbox, location, documentUpload ,documentInfo ,  contact]
10. Always make sure whenever a document upload step is added , a document info step is added right after it. So if the document upload step is at index 3 , the document info step should be at index 4.
11. If and only if there is a document upload step involved,  make sure that the previous steps are asking questions / contain content that is relevant to the document upload step and the document that needs to be uploaded. Let us say for example , if the document upload step is asking for a resume , make sure that the previous steps are asking questions like 'What is your current job title?' , 'What is your current company?' etc. Or if the document upload step is asking for a business plan , make sure that the previous steps are asking questions like 'What is your business idea?' , 'What is your business model?' etc.
12. Please make sure that the steps before the document upload step are the only ones that ask document upload related questions, rest can be generic based on prompt.
13. Always check if a number/amount of slides or questions is given. If so , generate the exact amount of slides asked , else generate about 7-8 slides.


The following form configuration is to be used as a reference for any configs that you generate. Focus largely on structure and keynames, values are placeholders:

{
  theme: {
    colors: {
      text: {
        dark: "#333333",
        light: "#ecebe4",
        muted: "#6a6a6a",
      },
      primary: "#0E565B",
      background: {
        light: "#ffffff",
        white: "#ffffff",
      },
    },
  },
  steps: [
    {
      type: "tiles",
      title: "Title Name",
      subtitle: "Subtitle Name",
      options: [
        {
          id: "id_1",
          title: "Title_1",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_2",
          title: "Title_2",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_3",
          title: "Title_3",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_4",
          title: "Title_4",
          description: "Extremely Short Description",
          icon: "",
        },
      ],
    },
    {
      type: "multiSelect",
      title: "Title Name",
      subtitle: "Subtitle Name",
      options: [
        {
          id: "id_1",
          title: "Title_1",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_2",
          title: "Title_2",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_3",
          title: "Title_3",
          description: "Extremely Short Description",
          icon: "",
        },
        {
          id: "id_4",
          title: "Tite_4",
          description: "Extremely Short Description",
          icon: "",
        },
      ],
    },
    {
      type: "slider",
      title: "Title Name",
      subtitle: "Subtitle Name",
      min: min_val,
      max: max_val,
      step: step_for_slider_val,
      defaultValue: default_val,
      prefix: "",
    },
    {
      type: "textbox",
      title: "Title Name",
      subtitle: "Subtitle Name",
      placeholder: "Placeholder content",
      rows: num_rows,
      validation: {
        required: true,
        minLength: 20,
      },
    },
    {
      type: "location",
      title: "Where are you located?",
      subtitle: "Please enter your location to check service availability",
      config: {
        labels: {
          searchPlaceholder: "Enter your postal code",
        },
      },
      validation: {
        required: true,
      },
    },
    {
      type: "documentUpload",
      title: "Upload Your Document",
      subtitle: "Please upload your document for processing",
      config: {
        acceptedTypes: [".pdf", ".doc", ".docx", ".txt"],
        maxFileSize: "10MB",
        labels: {
          uploadButton: "Choose File",
          dragDropText: "Drag and drop your file here",
          supportedFormats: "Supported formats: PDF, DOC, DOCX, TXT",
        },
      },
      validation: {
        required: false,
      },
    },
    {
      type: "documentInfo",
      title: "Document Information",
      subtitle: "Here's the processed information from your document",
      config: {
        displayMode: "scrollable",
        maxHeight: "400px",
        labels: {
          loadingText: "Processing your document...",
          errorText: "Unable to process document. Please try again.",
        },
      },
    },
    {
      type: "dropdown",
      title: "Title Name",
      subtitle: "Subtitle Name",
      options: [
        {
          id: "option_1",
          title: "Option 1",
        },
        {
          id: "option_2",
          title: "Option 2",
        },
        {
          id: "option_3",
          title: "Option 3",
        },
        {
          id: "option_4",
          title: "Option 4",
        },
        {
          id: "option_5",
          title: "Option 5",
        },
      ],
      placeholder: "Select",
      validation: {
        required: true,
      },
    },
    {
      type: "contact",
      title: "Your Contact Information",
      subtitle: "How can we reach you?",
      config: {
        labels: {
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email Address",
          phone: "Phone Number",
        },
        placeholders: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
        },
      },
    },

  ],
  ui: {
    buttons: {
      next: "Continue",
      skip: "Skip",
      submit: "Submit",
      startOver: "Start Over",
      submitting: "Submitting...",
      check: "Check Availability",
      checking: "Checking...",
    },
    messages: {
      optional: "Optional",
      required: "Required",
      invalidEmail: "Please enter a valid email address",
      submitError: "There was an error submitting your form. Please try again.",
      thankYou: "Thank You!",
      submitAnother: "Submit Another Response",
      multiSelectHint: "Select all that apply",
      loadError: "Failed to load the form. Please refresh the page.",
      thisFieldRequired: "This field is required",
      enterValidEmail: "Please enter a valid email address",
    },
    contact: {
      title: "Need help?",
      description: "Contact our support team",
      email: "support@example.com",
      phone: "+1 (555) 987-6543",
    },
  },
  submission: {
    title: "Thank You for Your Submission! 🎉",
    description: "We've received your information and will be in touch soon.",
    steps: [
      {
        title: "Request Received ✓",
        description: "We've successfully received your request.",
      },
      {
        title: "Review Process ⏱️",
        description: "Our team is reviewing your submission.",
      },
      {
        title: "Next Steps 🚀",
        description: "We'll contact you within 24 hours with a proposal.",
      },
    ],
  },
}

Follow these strict rules:
1. Each page should have 1-2 elements (except for tiles which can have up to 6)
2. Layout must be designed for 16:9 aspect ratio
3. Use minimal brand colors (1-2 brand colors globally)
4. Always include a location question asking for postal code and country
5. Always include a contact step to collect user's contact information
6. Each tile or multiSelect step must have exactly 4 or 6 options
7. Keep descriptions under each option very short (less than 4 words)
8. Always use modern, concise language .


`;

// Demo form configuration for development (without API key)
const demoFormConfig: FormConfig = {
  theme: {
    colors: {
      text: {
        dark: "#333333",
        light: "#ecebe4",
        muted: "#6a6a6a",
      },
      primary: "#0E565B",
      background: {
        light: "#ffffff",
        white: "#ffffff",
      },
    },
  },
  steps: [
    {
      type: "tiles",
      title: "This is a DEMO FORM CONFIG , if you were not expecting this , please try again.",
      subtitle: "Select the option that best describes your needs",
      options: [
        {
          id: "web-design",
          title: "Website Design",
          description: "Professional, modern sites",
          icon: "Laptop",
        },
        {
          id: "mobile-app",
          title: "Mobile App",
          description: "iOS and Android apps",
          icon: "Smartphone",
        },
        {
          id: "branding",
          title: "Brand Identity",
          description: "Logo and brand assets",
          icon: "Palette",
        },
        {
          id: "marketing",
          title: "Digital Marketing",
          description: "Grow your audience",
          icon: "TrendingUp",
        },
      ],
    },
    {
      type: "multiSelect",
      title: "What features do you need?",
      subtitle: "Select all the features you want to include",
      options: [
        {
          id: "responsive",
          title: "Responsive Design",
          description: "Works on all devices",
          icon: "Smartphone",
        },
        {
          id: "ecommerce",
          title: "E-commerce",
          description: "Sell products online",
          icon: "ShoppingCart",
        },
        {
          id: "blog",
          title: "Blog System",
          description: "Content management",
          icon: "FileText",
        },
        {
          id: "analytics",
          title: "Analytics",
          description: "Track performance",
          icon: "BarChart",
        },
      ],
    },
    {
      type: "slider",
      title: "What's your budget?",
      subtitle: "Drag the slider to select your budget range",
      min: 1000,
      max: 10000,
      step: 500,
      defaultValue: 5000,
      prefix: "$",
    },
    {
      type: "textbox",
      title: "Tell us about your project",
      subtitle: "Provide details about what you're looking to achieve",
      placeholder: "Enter project details here...",
      rows: 4,
      validation: {
        required: true,
        minLength: 20,
      },
    },
    {
      type: "location",
      title: "Where are you located?",
      subtitle: "Please enter your location to check service availability",
      config: {
        labels: {
          searchPlaceholder: "Enter your postal code",
        },
      },
      validation: {
        required: true,
      },
    },
    {
      type: "contact",
      title: "Your Contact Information",
      subtitle: "How can we reach you?",
      config: {
        labels: {
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email Address",
          phone: "Phone Number",
        },
        placeholders: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
        },
      },
    },
  ],
  ui: {
    buttons: {
      next: "Continue",
      skip: "Skip",
      submit: "Submit",
      startOver: "Start Over",
      submitting: "Submitting...",
      check: "Check Availability",
      checking: "Checking...",
    },
    messages: {
      optional: "Optional",
      required: "Required",
      invalidEmail: "Please enter a valid email address",
      submitError: "There was an error submitting your form. Please try again.",
      thankYou: "Thank You!",
      submitAnother: "Submit Another Response",
      multiSelectHint: "Select all that apply",
      loadError: "Failed to load the form. Please refresh the page.",
      thisFieldRequired: "This field is required",
      enterValidEmail: "Please enter a valid email address",
    },
    contact: {
      title: "Need help?",
      description: "Contact our support team",
      email: "support@example.com",
      phone: "+1 (555) 987-6543",
    },
  },
  submission: {
    title: "Thank You for Your Submission! 🎉",
    description: "We've received your information and will be in touch soon.",
    steps: [
      {
        title: "Request Received ✓",
        description: "We've successfully received your request.",
      },
      {
        title: "Review Process ⏱️",
        description: "Our team is reviewing your submission.",
      },
      {
        title: "Next Steps 🚀",
        description: "We'll contact you within 24 hours with a proposal.",
      },
    ],
  },
};

/**
 * Validates and ensures uniqueness of titles and questions in a form configuration
 * @param config The form configuration to validate
 * @returns The validated and deduplicated form configuration
 */
function validateAndDeduplicateForm(config: FormConfig): FormConfig {
  const usedTitles = new Set<string>();
  const usedSubtitles = new Set<string>();
  const usedEmojis = new Set<string>();

  // No longer needed since we use icons instead of emojis
  const getEmoji = (str: string | undefined): string | null => {
    return null;
  };

  // Helper to make title unique
  const makeUnique = (title: string | undefined, set: Set<string>): string => {
    if (!title || typeof title !== "string") title = "Untitled";

    let newTitle = title;
    let counter = 1;

    while (set.has(newTitle)) {
      const emoji = getEmoji(title);
      const baseTitle = emoji ? title.replace(emoji, "").trim() : title;
      newTitle = `${baseTitle} ${counter}${emoji ? ` ${emoji}` : ""}`;
      counter++;
    }

    return newTitle;
  };

  // Process each step
  config.steps = config.steps.map((step) => {
    // Make title unique
    step.title = makeUnique(step.title, usedTitles);
    usedTitles.add(step.title);

    // Make subtitle unique
    step.subtitle = makeUnique(step.subtitle, usedSubtitles);
    usedSubtitles.add(step.subtitle);

    // Handle options for tiles and multiSelect steps
    if ("options" in step && Array.isArray(step.options)) {
      const usedOptionTitles = new Set<string>();

      step.options = step.options.map((option) => {
        option.title = makeUnique(option.title, usedOptionTitles);
        usedOptionTitles.add(option.title);
        return option;
      });
    }

    return step;
  });

  return config;
}

// Utility to clean text (no longer needed since we use icons)
function cleanText(str: string): string {
  return str.trim();
}

// Remove emojis from all option titles in all steps
function cleanOptionTitles(config: FormConfig): FormConfig {
  config.steps = config.steps.map((step) => {
    if ("options" in step && Array.isArray(step.options)) {
      step.options = step.options.map((option) => ({
        ...option,
        title: typeof option.title === "string" ? cleanText(option.title) : option.title,
      }));
    }
    return step;
  });
  return config;
}

// Failsafe: Ensure all 'tiles' steps have 4 or 6 options only
function ensureTilesOptionCount(config: FormConfig): FormConfig {
  let needsFix = false;
  for (const step of config.steps) {
    if (step.type === "tiles" && step.options && Array.isArray(step.options)) {
      if (step.options.length !== 4 && step.options.length !== 6) {
        needsFix = true;
        break;
      }
    }
  }
  if (!needsFix) return config;
  // Only fix if needed
  config.steps = config.steps.map((step) => {
    if (step.type === "tiles" && step.options && Array.isArray(step.options)) {
      let opts = step.options;
      if (opts.length < 4) {
        // Duplicate first option until 4
        while (opts.length < 4) {
          opts.push({ ...opts[0], id: opts[0].id + "_dup" + opts.length });
        }
      } else if (opts.length === 5) {
        // Remove last option
        opts = opts.slice(0, 4);
      } else if (opts.length > 6) {
        // Keep only first 6
        opts = opts.slice(0, 6);
      }
      step.options = opts;
    }
    return step;
  });
  return config;
}

/**
 * Reorders the final steps to ensure location and contact are at the end
 * @param config The form configuration to reorder
 * @returns The reordered form configuration
 */
function reorderFinalSteps(config: FormConfig): FormConfig {
  const steps = config.steps;

  if (!Array.isArray(steps)) return config;

  const contactStepIndex = steps.findIndex((s) => s.type === "contact");
  const locationStepIndex = steps.findIndex((s) => s.type === "location");

  const contactStep =
    contactStepIndex !== -1 ? steps.splice(contactStepIndex, 1)[0] : null;
  const locationStep =
    locationStepIndex !== -1
      ? steps.splice(
          locationStepIndex < contactStepIndex
            ? locationStepIndex
            : locationStepIndex - 1,
          1,
        )[0]
      : null;

  // Now push them to the right place
  if (locationStep) steps.push(locationStep);
  if (contactStep) steps.push(contactStep);

  config.steps = steps;

  return config;
}

/**
 * Generates a form configuration from a natural language prompt using Gemini API
 * @param prompt The natural language prompt describing the form to generate
 * @returns FormConfig object representing the generated form structure
 */
export async function generateFormFromPrompt(
  prompt: string,
): Promise<FormConfig> {
  // Create a customized demo form based on prompt for fallback
  const customDemoForm = createCustomizedDemoForm(prompt);

  // Verify GEMINI_API_KEY is available
  if (!GEMINI_API_KEY) {
    console.warn(
      "GEMINI_API_KEY environment variable not set - using demo form configuration",
    );
    return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
            role: "system",
            parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Now create a form for the following request:\n${prompt}`,
              },
            ],
          },
        ],
        tools: [
          {
            "googleSearch": {}
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 60000,
        },
      }),
    });

    if (!response.ok) {
      console.error(
        `Gemini API HTTP error: ${response.status} ${response.statusText}`,
      );
      try {
        const errorData = await response.json();
        console.error(`Gemini API error details: ${JSON.stringify(errorData)}`);
      } catch (e) {
        const errorText = await response.text();
        console.error(`Gemini API error response: ${errorText}`);
      }

      return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0]
    ) {
      console.error(
        "Unexpected response structure from Gemini API:",
        JSON.stringify(data),
      );
      return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
    }

    const textResponse = data.candidates[0].content.parts[0].text;

    if (!textResponse) {
      console.error("Empty response from Gemini API");
      return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
    }

    try {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : textResponse;

      let formConfig = JSON.parse(jsonString) as FormConfig;

      if (
        !formConfig.steps ||
        !Array.isArray(formConfig.steps) ||
        formConfig.steps.length === 0
      ) {
        console.warn("Invalid form configuration detected, attempting one retry...");
        // One retry attempt
        try {
          const retryResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              systemInstruction: {
                  role: "system",
                  parts: [{ text: SYSTEM_PROMPT }]
              },
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `This is a retry attempt. Please ensure valid form structure for the following request:\n${prompt}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1, // Reduced temperature for more focused output
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 60000,
              },
            }),
          });

          const retryData = await retryResponse.json();
          const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text;

          if (retryText) {
            const retryJsonMatch = retryText.match(/\{[\s\S]*\}/);
            const retryConfig = JSON.parse(retryJsonMatch ? retryJsonMatch[0] : retryText);

            if (retryConfig.steps && Array.isArray(retryConfig.steps) && retryConfig.steps.length > 0) {
              formConfig = retryConfig;
            } else {
              console.error("Retry attempt failed: still invalid form configuration");
              return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
            }
          } else {
            console.error("Retry attempt failed: empty response");
            return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
          }
        } catch (retryError) {
          console.error("Retry attempt failed:", retryError);
          return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
        }
      }

      // Fix inconsistent property naming in steps
      formConfig.steps = formConfig.steps.map((step) => {
        if ("label" in step && !("title" in step)) {
          (step as any).title = (step as any).label;
          delete (step as any).label;
        } else if ("question" in step && !("title" in step)) {
          (step as any).title = (step as any).question;
          delete (step as any).question;
        }

        if ("field" in step && !("subtitle" in step)) {
          (step as any).subtitle = `Please select your ${(step as any).field}`;
          delete (step as any).field;
        } else if ("description" in step && !("subtitle" in step)) {
          (step as any).subtitle = (step as any).description;
          delete (step as any).description;
        }

        if (step.type === "tiles" || step.type === "multiSelect") {
          if ("options" in step) {
            const options = (step as any).options;
            if (Array.isArray(options)) {
              (step as any).options = options.map((opt: any) => ({
                id:
                  opt.value ||
                  opt.id ||
                  `option-${Math.random().toString(36).substring(2, 9)}`,
                title: opt.label || opt.title || "Option",
                description: opt.description || "",
                icon: opt.icon || "CheckCircle",
              }));
            }
          }
        }

        if (step.type === "location") {
          if (!("config" in step)) {
            (step as any).config = {
              labels: {
                searchPlaceholder: "Enter your postal code",
              },
            };
          }

          if (!("validation" in step) && "required" in step) {
            (step as any).validation = {
              required: (step as any).required,
            };
            delete (step as any).required;
          }
        }

        if (step.type === "slider") {
          if ("required" in step) {
            delete (step as any).required;
          }

          if (!("min" in step)) (step as any).min = 0;
          if (!("max" in step)) (step as any).max = 100;
          if (!("step" in step)) (step as any).step = 1;
          if (!("defaultValue" in step)) (step as any).defaultValue = 50;
        }

        if (step.type === "contact") {
          if (!("config" in step)) {
            (step as any).config = {
              labels: {
                firstName: "First Name",
                lastName: "Last Name",
                email: "Email Address",
                phone: "Phone Number",
              },
              placeholders: {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phone: "+1 (555) 123-4567",
              },
            };
          }

          if ("fields" in step && Array.isArray((step as any).fields)) {
            const fields = (step as any).fields;

            fields.forEach((field: any) => {
              if (field.field === "name" || field.field === "firstName") {
                (step as any).config.labels.firstName =
                  field.label || "First Name";
                if (field.placeholder) {
                  (step as any).config.placeholders.firstName =
                    field.placeholder;
                }
              } else if (field.field === "lastName") {
                (step as any).config.labels.lastName =
                  field.label || "Last Name";
                if (field.placeholder) {
                  (step as any).config.placeholders.lastName =
                    field.placeholder;
                }
              } else if (field.field === "email") {
                (step as any).config.labels.email =
                  field.label || "Email Address";
                if (field.placeholder) {
                  (step as any).config.placeholders.email = field.placeholder;
                }
              } else if (field.field === "phone") {
                (step as any).config.labels.phone =
                  field.label || "Phone Number";
                if (field.placeholder) {
                  (step as any).config.placeholders.phone = field.placeholder;
                }
              }
            });

            delete (step as any).fields;
          }

          if ("name" in step) {
            const nameConfig = (step as any).name;
            if (nameConfig && typeof nameConfig === "object") {
              (step as any).config.labels.firstName =
                nameConfig.label || "First Name";
              if (nameConfig.placeholder) {
                (step as any).config.placeholders.firstName =
                  nameConfig.placeholder;
              }
            }
            delete (step as any).name;
          }

          if ("email" in step) {
            const emailConfig = (step as any).email;
            if (emailConfig && typeof emailConfig === "object") {
              (step as any).config.labels.email =
                emailConfig.label || "Email Address";
              if (emailConfig.placeholder) {
                (step as any).config.placeholders.email =
                  emailConfig.placeholder;
              }
            }
            delete (step as any).email;
          }

          if ("phone" in step) {
            const phoneConfig = (step as any).phone;
            if (phoneConfig && typeof phoneConfig === "object") {
              (step as any).config.labels.phone =
                phoneConfig.label || "Phone Number";
              if (phoneConfig.placeholder) {
                (step as any).config.placeholders.phone =
                  phoneConfig.placeholder;
              }
            }
            delete (step as any).phone;
          }
        }

        return step;
      });

      if (!formConfig.ui) {
        formConfig.ui = demoFormConfig.ui;
      }

      if (!formConfig.submission) {
        formConfig.submission = demoFormConfig.submission;
      }

      formConfig = reorderFinalSteps(formConfig);

      ///added new from here
      try {
        // collect every option title in reading order
        const flatTitles: string[] = [];
        formConfig.steps.forEach((step) => {
          if (Array.isArray((step as any).options)) {
            (step as any).options.forEach((opt: any) => {
              flatTitles.push(opt.title);
            });
          }
        });

        if (flatTitles.length) {
          // Generate both Lucide icons and emojis
          const [flatIcons, flatEmojis] = await Promise.all([
            generateIconsFromOptions(flatTitles),
            generateEmojisFromOptions(flatTitles)
          ]);
          
          let idx = 0;

          // stitch them back _onto_ each option – preserve everything else on `step`
          formConfig.steps.forEach((step) => {
            if (Array.isArray((step as any).options)) {
              (step as any).options = (step as any).options.map((opt: any) => {
                const result = {
                  ...opt,
                  icon: flatIcons[idx] || "Circle",
                  emoji: flatEmojis[idx] || "❓",
                };
                idx++; // Increment for each option, not each step
                return result;
              });
            }
          });
        }
      } catch (err) {
        console.warn("Icon/emoji augmentation failed, proceeding without it", err);
      }

      // Validate and deduplicate the form configuration
      // Remove emojis from option titles before returning
      formConfig = cleanOptionTitles(formConfig);
      formConfig = ensureTilesOptionCount(formConfig);
      formConfig = validateAndDeduplicateForm(formConfig);
      
      // Log the final JSON configuration being sent to frontend
      console.log("=== FINAL FORM CONFIGURATION SENT TO FRONTEND ===");
      console.log(JSON.stringify(formConfig, null, 2));
      console.log("=== END FORM CONFIGURATION ===");
      
      return formConfig;
    } catch (parseError) {
      console.error("Error parsing Gemini response as JSON:", parseError);
      console.warn("Using demo form configuration due to parsing error");
      // Remove emojis from option titles before returning
      return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.warn("Using demo form configuration due to API error");
    // Remove emojis from option titles before returning
    return validateAndDeduplicateForm(cleanOptionTitles(customDemoForm));
  }
}

/**
 * Creates a customized version of the demo form based on the prompt
 * @param prompt The natural language prompt
 * @returns A customized form configuration
 */
function createCustomizedDemoForm(prompt: string): FormConfig {
  const customForm: FormConfig = JSON.parse(JSON.stringify(demoFormConfig));

  const promptLower = prompt.toLowerCase();

  if (customForm.steps && customForm.steps.length > 0) {
    const firstStep = customForm.steps[0];

    const promptWords = prompt.split(" ");

    if (promptWords.length > 5) {
      firstStep.title = promptWords.slice(0, 5).join(" ") + "...";
    } else {
      firstStep.title = prompt;
    }

    firstStep.subtitle = "Tell us about your needs";

    if (customForm.submission) {
      customForm.submission.title = "Thank You for Your Submission! 🎉";
      customForm.submission.description =
        "We've received your information and will be in touch soon about your request.";
    }

    if (
      promptLower.includes("product") ||
      promptLower.includes("service") ||
      promptLower.includes("offering") ||
      promptLower.includes("solution")
    ) {
      if (firstStep.type === "tiles") {
        firstStep.title = "What are you interested in?";

        if (
          promptLower.includes("web") ||
          promptLower.includes("website") ||
          promptLower.includes("application")
        ) {
          firstStep.options[0].title = "Website Development";
          firstStep.options[0].icon = "Globe";
        }

        if (promptLower.includes("consult") || promptLower.includes("advice")) {
          firstStep.options[1].title = "Consultation";
          firstStep.options[1].icon = "HelpCircle";
        }

        if (promptLower.includes("support") || promptLower.includes("help")) {
          firstStep.options[2].title = "Technical Support";
          firstStep.options[2].icon = "LifeBuoy";
        }
      }
    }

    const contactStep = customForm.steps.find(
      (step) => step.type === "contact",
    );
    if (contactStep) {
      contactStep.title = "Your Contact Information";
      contactStep.subtitle = "How can we reach you about your request?";
    }
  }

  return customForm;
}

// — add at the bottom of the file (just before the exports)

export async function generateEmojisFromOptions(
  optionTitles: string[]
): Promise<string[]> {
  const prompt = `
You are an emoji-selection engine.  
Given this array of option titles:
${JSON.stringify(optionTitles)}

Return ONLY a JSON array of emojis (strings) of the same length,
where each emoji semantically matches the corresponding title.
Example output: ["🍽️","📍","🛍️",…]
  `.trim();

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 60000,
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        }
      })
    });

    if (!res.ok) {
      console.error("Emoji API error:", await res.text());
      throw new Error("Failed to generate emojis");
    }

    const payload = await res.json();
    const part: any = payload?.candidates?.[0]?.content?.parts?.[0] ?? {};
    let emojisRaw: unknown = null;

    // 1) Preferred: structured JSON returned directly
    if (Array.isArray(part.json)) {
      emojisRaw = part.json;
    } else {
      // 2) Fallback: JSON delivered as text (possibly wrapped in ```json fences)
      let text = (part.text || "").trim();
      if (text.startsWith("```")) {
        // Remove any ```json / ``` wrappers
        text = text.replace(/```json|```/gi, "").trim();
      }
      // Attempt to parse the whole string first
      try {
        emojisRaw = JSON.parse(text);
      } catch {
        // If that fails, search the first JSON array inside the text
        const match = text.match(/\[[\s\S]*?\]/);
        if (match) {
          try {
            emojisRaw = JSON.parse(match[0]);
          } catch {
            /* ignore – will be handled below */
          }
        }
      }
    }

    if (!Array.isArray(emojisRaw)) {
      throw new Error("Invalid emoji response format");
    }

    let emojis = emojisRaw as string[];
    
    // Ensure we have the right number of emojis
    while (emojis.length < optionTitles.length) {
      emojis.push("❓");
    }
    
    return emojis.slice(0, optionTitles.length);
  } catch (error) {
    console.error("Error generating emojis:", error);
    // Fallback to default emojis
    return optionTitles.map(() => "❓");
  }
}

/**
 * Applies a user instruction to an existing FormConfig JSON
 * by calling the Gemini API and returning only the new JSON string.
 */
export async function editJsonWithLLM(
  original: object,
  instruction: string
): Promise<string> {
  // Build a prompt that gives Gemini ONLY the JSON plus your edit instruction
  const fullPrompt = `
You are given this JSON only (no extra text):
${JSON.stringify(original, null, 2)}

Apply this instruction and output ONLY the modified, valid JSON:
"${instruction}" and make sure to keep everything ELSE ,apart from instructed changes, the same.
Make sure the 'type' key strictly has one of the following values from the list , absolutely nothing else: [ tiles, multiSelect, dropdown, slider, followup, textbox, location, documentUpload ,documentInfo ,  contact]
`;

  // Send to the same Gemini endpoint you already use
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
          role: "system",
          parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        { role: "user", parts: [{ text: fullPrompt }] }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 60000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Gemini edit‑JSON API error: ${response.status} ${response.statusText}`
    );
  }
////removed an S
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini when editing JSON");
  }

  // Pull out the JSON block from any surrounding text
  const match = text.match(/\{[\s\S]*\}/);
  const jsonString = (match ? match[0] : text).trim();

  // Try to clean emojis from option titles if possible
  try {
    const parsed = JSON.parse(jsonString);
    const cleaned = cleanOptionTitles(parsed);
    const ensured = ensureTilesOptionCount(cleaned);
    return JSON.stringify(ensured, null, 2);
  } catch (e) {
    // If parsing fails, just return the original string
    return jsonString;
  }
}