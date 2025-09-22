import { useEffect, useState, ReactNode, useRef } from "react";
import { FormProvider, useFormContext } from "@/contexts/form-context";
import EmbedFormRenderer from "@/components/form-renderer/embed-form-renderer";
import { FormConfig } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import "../index.css"; // Ensure styles are loaded

// Custom FormProvider that initializes with a specific icon mode
function FormProviderWithIconMode({ 
  children, 
  iconMode 
}: { 
  children: ReactNode; 
  iconMode: 'lucide' | 'emoji' | 'none'; 
}) {
  const [initialIconMode, setInitialIconMode] = useState(iconMode);
  
  // Update icon mode when prop changes
  useEffect(() => {
    setInitialIconMode(iconMode);
  }, [iconMode]);

  return (
    <FormProvider>
      <IconModeInitializer iconMode={initialIconMode} />
      {children}
    </FormProvider>
  );
}

// Component to set the initial icon mode in the form context
function IconModeInitializer({ iconMode }: { iconMode: 'lucide' | 'emoji' | 'none' }) {
  const { setIconMode } = useFormContext();
  
  useEffect(() => {
    setIconMode(iconMode);
  }, [iconMode, setIconMode]);
  
  return null;
}

// Define an extended form response type that includes the color property
interface FormConfigResponse {
  id: number;
  label: string;
  config: FormConfig & { config?: FormConfig }; // Allow for double-wrapped config
  created_at: string;
  iconMode?: string;
  color?: string; // Add the color property
  form_console?: any;
  language?: string;
  domain?: string;
  url?: string;
}

export default function EmbedForm() {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formId, setFormId] = useState<number | null>(null);
  const [iconMode, setIconMode] = useState<'lucide' | 'emoji' | 'none'>('lucide');
  const [formColor, setFormColor] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set theme for embedded forms
  useEffect(() => {
    // Remove background for iframe compatibility
    document.body.style.backgroundColor = "transparent";
    document.documentElement.style.backgroundColor = "transparent";

    // Generate a darker shade of a color for hover states
    const getDarkerShade = (hexColor: string): string => {
      // Convert hex to RGB
      const r = parseInt(hexColor.substring(1, 3), 16);
      const g = parseInt(hexColor.substring(3, 5), 16);
      const b = parseInt(hexColor.substring(5, 7), 16);
      
      // Make each component darker by reducing by 20%
      const darkerR = Math.max(0, Math.floor(r * 0.8));
      const darkerG = Math.max(0, Math.floor(g * 0.8));
      const darkerB = Math.max(0, Math.floor(b * 0.8));
      
      // Convert back to hex
      return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
    };

    // Helper: convert HEX -> HSL string "H S% L%" for Tailwind CSS variables
    const hexToHslString = (hex: string): string => {
      const clean = hex.replace('#', '');
      const r = parseInt(clean.substring(0, 2), 16) / 255;
      const g = parseInt(clean.substring(2, 4), 16) / 255;
      const b = parseInt(clean.substring(4, 6), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          default:
            h = (r - g) / d + 4;
        }
        h /= 6;
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Load saved custom theme or set defaults
    const savedPrimary = localStorage.getItem('custom-theme-primary') || "#3b82f6";
    const savedSecondary = localStorage.getItem('custom-theme-secondary') || "#a855f7";
    const savedAccent = localStorage.getItem('custom-theme-accent') || "#2dd4bf";
    const savedFont = localStorage.getItem('custom-theme-font') || "'Poppins', sans-serif";

    // Add CSS variables for theming
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      :root {
        --color-primary: ${savedPrimary};
        --color-primary-dark: ${getDarkerShade(savedPrimary)};
        --color-secondary: ${savedSecondary};
        --color-background: #ffffff;
        --color-foreground: #1e293b;
        --color-accent: ${savedAccent};
        --font-primary: ${savedFont};
      }
      body, button, input, select, textarea { font-family: var(--font-primary); }
      .text-primary { color: var(--color-primary); }
      .bg-primary { background-color: var(--color-primary); }
      .hover\\:bg-primary-dark:hover { background-color: var(--color-primary-dark); }
    `;
    document.head.appendChild(styleEl);

    // Also set Tailwind CSS variable --primary so utilities like bg-primary/10 use the chosen color
    try {
      const hsl = hexToHslString(savedPrimary);
      document.documentElement.style.setProperty("--primary", hsl);
    } catch {}

    // Add font styles for all supported fonts
    const fontLinks = [
      "https://fonts.googleapis.com/css2?family=Arial&family=Helvetica&display=swap",
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
    ];

    const fontElements: HTMLLinkElement[] = [];
    fontLinks.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      fontElements.push(link);
    });

    return () => {
      document.body.style.backgroundColor = "";
      document.head.removeChild(styleEl);
      fontElements.forEach((el) => document.head.removeChild(el));
    };
  }, []);

  useEffect(() => {
    document.body.classList.add('embed-mode');
    return () => document.body.classList.remove('embed-mode');
  }, []);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        // Get the URL directly from window.location
        const url = new URL(window.location.href);
        console.log("🔍 EMBED PAGE - Full URL:", url.toString());

        // Get the new parameters
        const language = url.searchParams.get("language");
        const label = url.searchParams.get("label");
        const domain = url.searchParams.get("domain");
        const iconModeParam = url.searchParams.get("iconMode") as 'lucide' | 'emoji' | 'none' | null;
        
        // Fallback to old form parameter for backward compatibility
        const oldFormId = url.searchParams.get("form") || url.searchParams.get("id");
        
        console.log("🔍 EMBED PAGE - URL params:", { language, label, domain, oldFormId, iconModeParam });
        
        // Set icon mode from URL parameter
        if (iconModeParam && ['lucide', 'emoji', 'none'].includes(iconModeParam)) {
          setIconMode(iconModeParam);
        }

        if (!language && !label && !domain && !oldFormId) {
          setError("No form parameters provided");
          setLoading(false);
          return;
        }

        let response;
        
        if (language && label && domain) {
          // New URL structure
          console.log("🔍 EMBED PAGE - Using new URL structure with properties");
          response = await apiRequest<FormConfigResponse>({
            url: `/api/forms/by-properties?language=${encodeURIComponent(language)}&label=${encodeURIComponent(label)}&domain=${encodeURIComponent(domain)}`,
          });
        } else if (oldFormId) {
          // Old URL structure (backward compatibility)
          console.log("🔍 EMBED PAGE - Using old URL structure with form ID:", oldFormId);
          response = await apiRequest<FormConfigResponse>({
            url: `/api/forms/${oldFormId}`,
          });
        }

        if (response && response.config) {
          console.log("📄 EMBED PAGE - Form loaded:", {
            id: response.id,
            label: response.label,
            iconMode: response.iconMode,
            hasConfig: !!response.config,
            configSteps: response.config.steps?.length || 0,
            configTheme: !!response.config.theme,
            color: response.color // Log the color value from the database
          });
          
          // Store the color from the form_config table
          setFormColor(response.color || null);
          
          console.log("📄 EMBED PAGE - Full form config:", JSON.stringify(response.config, null, 2));
          
          // Handle both regular and double-wrapped configs
          // If response.config.config exists, it's a double-wrapped config from the API
          const formConfiguration = response.config.config ? response.config.config : response.config;
          
          console.log("📄 EMBED PAGE - Detecting config format:", {
            hasNestedConfig: !!response.config.config,
            usingUnwrappedConfig: !response.config.config,
            configKeys: Object.keys(response.config)
          });
          
          // Log the raw steps data for debugging using the detected configuration
          console.log("📄 EMBED PAGE - Raw steps data:", {
            stepsType: typeof formConfiguration.steps,
            isArray: Array.isArray(formConfiguration.steps),
            rawSteps: formConfiguration.steps,
            stepsLength: formConfiguration.steps?.length || 0,
            stepsKeys: formConfiguration.steps ? Object.keys(formConfiguration.steps) : [],
            configKeys: Object.keys(formConfiguration)
          });

          
          // Direct access to the steps array from the unwrapped config object
          let stepsArray = [];
          
          // First approach: Check if steps is directly an array
          if (Array.isArray(formConfiguration.steps)) {
            console.log("📄 EMBED PAGE - Steps is directly an array in unwrapped config");
            stepsArray = formConfiguration.steps;
          } 
          // Second approach: Check if steps is an object with numeric keys
          else if (typeof formConfiguration.steps === 'object' && formConfiguration.steps !== null) {
            console.log("📄 EMBED PAGE - Steps is an object in unwrapped config, trying to convert to array");
            try {
              const keys = Object.keys(formConfiguration.steps).filter(k => !isNaN(Number(k)));
              if (keys.length > 0) {
                stepsArray = keys.map(k => formConfiguration.steps[k]);
                console.log("📄 EMBED PAGE - Converted object to array:", { 
                  convertedLength: stepsArray.length 
                });
              }
            } catch (err) {
              console.error("📄 EMBED PAGE - Error converting steps object to array:", err);
            }
          }
          // Third approach: Check if formConfiguration is the steps array itself
          else if (Array.isArray(formConfiguration) && formConfiguration.length > 0 && formConfiguration[0].type) {
            console.log("📄 EMBED PAGE - Found steps array directly in formConfiguration");
            stepsArray = formConfiguration;
          }
          // Fourth approach: Look for steps in different locations in the config
          else {
            console.log("📄 EMBED PAGE - Searching for steps in the unwrapped config object");
            // Check if there's a nested 'steps' property somewhere else
            for (const key of Object.keys(formConfiguration)) {
              if (Array.isArray(formConfiguration[key]) && 
                  formConfiguration[key].length > 0 && 
                  formConfiguration[key][0] && 
                  typeof formConfiguration[key][0] === 'object' &&
                  formConfiguration[key][0].type) {
                console.log(`📄 EMBED PAGE - Found steps array in formConfiguration.${key}`);
                stepsArray = formConfiguration[key];
                break;
              }
            }
          }
          
          // Fifth approach: Try to extract steps from the raw config JSON string
          if (stepsArray.length === 0) {
            try {
              console.log("📄 EMBED PAGE - Attempting to extract steps from raw config JSON");
              const configStr = JSON.stringify(response.config);
              
              // Try to find the steps array in the raw config string
              const stepsRegex = /"steps"\s*:\s*(\[[\s\S]*?\])(?=\s*,|\s*\})/;
              const stepsMatch = configStr.match(stepsRegex);
              
              if (stepsMatch && stepsMatch[1]) {
                const rawStepsJson = stepsMatch[1];
                console.log("📄 EMBED PAGE - Found steps in raw JSON:", rawStepsJson.substring(0, 50) + "...");
                
                try {
                  // Parse the raw steps JSON
                  const parsedSteps = JSON.parse(rawStepsJson);
                  if (Array.isArray(parsedSteps) && parsedSteps.length > 0) {
                    stepsArray = parsedSteps;
                    console.log("📄 EMBED PAGE - Successfully extracted steps from raw JSON:", {
                      length: stepsArray.length,
                      firstStepTitle: stepsArray[0]?.title
                    });
                  }
                } catch (parseErr) {
                  console.error("📄 EMBED PAGE - Error parsing steps from raw JSON:", parseErr);
                  
                  // Try to fix common JSON issues and parse again
                  try {
                    console.log("📄 EMBED PAGE - Attempting to fix JSON and parse again");
                    const fixedJson = rawStepsJson
                      .replace(/,(\s*[\]}])/g, '$1') // Remove trailing commas
                      .replace(/'/g, '"')           // Replace single quotes with double quotes
                      .replace(/\\"/g, '\\"');      // Fix escaped quotes
                      
                    const parsedSteps = JSON.parse(fixedJson);
                    if (Array.isArray(parsedSteps) && parsedSteps.length > 0) {
                      stepsArray = parsedSteps;
                      console.log("📄 EMBED PAGE - Successfully parsed steps after fixing JSON:", {
                        length: stepsArray.length,
                        firstStepTitle: stepsArray[0]?.title
                      });
                    }
                  } catch (fixErr) {
                    console.error("📄 EMBED PAGE - Error parsing fixed JSON:", fixErr);
                  }
                }
              }
            } catch (err) {
              console.error("📄 EMBED PAGE - Error extracting steps from raw config JSON:", err);
            }
          }
          
          // Sixth approach: Try to directly access the steps from the original form config JSON
          if (stepsArray.length === 0 && typeof response.config === 'string') {
            try {
              console.log("📄 EMBED PAGE - Attempting to parse config as string");
              const parsedConfig = JSON.parse(response.config);
              if (parsedConfig && Array.isArray(parsedConfig.steps)) {
                stepsArray = parsedConfig.steps;
                console.log("📄 EMBED PAGE - Successfully extracted steps from string config:", {
                  length: stepsArray.length,
                  firstStepTitle: stepsArray[0]?.title
                });
              }
            } catch (err) {
              console.error("📄 EMBED PAGE - Error parsing config as string:", err);
            }
          }
          
          // Log the found steps array
          console.log("📄 EMBED PAGE - Steps array before validation:", {
            isArray: Array.isArray(stepsArray),
            length: stepsArray.length,
            firstStep: stepsArray.length > 0 ? stepsArray[0] : null
          });
          
          // If we still don't have steps, but we can see them in the form config JSON,
          // try a more direct approach by parsing the JSON again
          if (stepsArray.length === 0) {
            try {
              console.log("📄 EMBED PAGE - Attempting to extract steps directly from JSON");
              // Try to parse the full config JSON again
              const configJson = JSON.stringify(response.config);
              const parsedConfig = JSON.parse(configJson);
              
              // Check if steps exists in the parsed config
              if (parsedConfig.steps && Array.isArray(parsedConfig.steps) && parsedConfig.steps.length > 0) {
                console.log("📄 EMBED PAGE - Found steps in reparsed JSON");
                stepsArray = parsedConfig.steps;
              }
              // If not, look for steps in the raw JSON string
              else {
                // Look for a steps array in the raw JSON
                const stepsMatch = configJson.match(/"steps"\s*:\s*(\[.*?\])/s);
                if (stepsMatch && stepsMatch[1]) {
                  try {
                    console.log("📄 EMBED PAGE - Extracting steps from raw JSON");
                    const extractedSteps = JSON.parse(stepsMatch[1]);
                    if (Array.isArray(extractedSteps) && extractedSteps.length > 0) {
                      stepsArray = extractedSteps;
                      console.log("📄 EMBED PAGE - Extracted steps from raw JSON:", {
                        length: stepsArray.length
                      });
                    }
                  } catch (err) {
                    console.error("📄 EMBED PAGE - Error parsing steps from raw JSON:", err);
                  }
                }
              }
            } catch (err) {
              console.error("📄 EMBED PAGE - Error in direct JSON extraction:", err);
            }
          }
          
          // DO NOT create hardcoded steps - only use the actual steps from the config
          if (stepsArray.length === 0) {
            console.log("📄 EMBED PAGE - No steps found, but will not use hardcoded steps");
            // Instead of using hardcoded steps, we'll try to extract the steps directly from the raw JSON
            // This is a last attempt to get the actual steps from the form config
            try {
              const configStr = JSON.stringify(response.config, null, 2);
              console.log("📄 EMBED PAGE - Raw config string:", configStr.substring(0, 100) + "...");
              
              // Look for the steps array in the raw config string
              const stepsMatch = configStr.match(/"steps"\s*:\s*(\[[\s\S]*?\])/);
              if (stepsMatch && stepsMatch[1]) {
                try {
                  // Fix any potential JSON issues in the steps array
                  const cleanedStepsJson = stepsMatch[1]
                    .replace(/,(\s*[\]}])/g, '$1') // Remove trailing commas
                    .replace(/'/g, '"'); // Replace single quotes with double quotes
                  
                  console.log("📄 EMBED PAGE - Attempting to parse steps from raw config string");
                  const extractedSteps = JSON.parse(cleanedStepsJson);
                  if (Array.isArray(extractedSteps) && extractedSteps.length > 0) {
                    stepsArray = extractedSteps;
                    console.log("📄 EMBED PAGE - Successfully extracted steps from raw config string:", {
                      length: stepsArray.length,
                      firstStepTitle: stepsArray[0]?.title
                    });
                  }
                } catch (err) {
                  console.error("📄 EMBED PAGE - Error parsing steps from raw config string:", err);
                }
              }
            } catch (err) {
              console.error("📄 EMBED PAGE - Error extracting steps from raw config:", err);
            }
          }
          
          // Ensure the config has the required structure for API-generated forms
          const validatedConfig = {
            ...formConfiguration,  // Use the unwrapped config as the base
            // Use the processed steps array - do not use fallback steps to preserve original content
            steps: stepsArray,
            // Ensure theme exists
            theme: formConfiguration.theme || {
              colors: {
                text: {
                  dark: "#333333",
                  light: "#ecebe4",
                  muted: "#6a6a6a"
                },
                primary: "#10b981",
                background: {
                  light: "#ffffff",
                  white: "#ffffff"
                }
              }
            },
            // Ensure UI exists for buttons and messages
            ui: formConfiguration.ui || {
              buttons: {
                next: "Continue",
                skip: "Skip",
                submit: "Submit",
                startOver: "Start Over",
                submitting: "Submitting...",
                check: "Check",
                checking: "Checking..."
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
                enterValidEmail: "Please enter a valid email address"
              }
            }
          };
          
          console.log("📄 EMBED PAGE - Validated config:", {
            hasSteps: Array.isArray(validatedConfig.steps),
            stepsLength: validatedConfig.steps?.length || 0,
            hasTheme: !!validatedConfig.theme,
            hasUI: !!validatedConfig.ui
          });
          
          // Check if steps array is empty
          if (!validatedConfig.steps || !validatedConfig.steps.length) {
            console.error("📄 EMBED PAGE - Form has no steps after all extraction attempts!");
            
            // Check if we can see steps in the raw config JSON
            const configStr = JSON.stringify(response.config);
            if (configStr.includes('"steps"') && configStr.includes('"type"') && configStr.includes('"title"')) {
              console.log("📄 EMBED PAGE - Steps found in raw config but extraction failed. Using original config.");
              // Use the original config as-is without modification
              setFormConfig(response.config);
              setFormId(response.id); // Set formId state
              
              // Set icon mode from database if available
              if (response.iconMode && ['lucide', 'emoji', 'none'].includes(response.iconMode)) {
                console.log("🎨 EMBED PAGE - Setting icon mode from database:", response.iconMode);
                setIconMode(response.iconMode as 'lucide' | 'emoji' | 'none');
              }
              
              // Skip the rest of the processing since we're using the original config
              setLoading(false);
              return;
            } else {
              setError("This form has no steps. Please contact the form creator.");
              setLoading(false);
              return;
            }
          }
          
          // Only use validated config if we have valid steps
          setFormConfig(validatedConfig);
          setFormId(response.id); // Set formId state
          
          // Set icon mode from database if available
          if (response.iconMode && ['lucide', 'emoji', 'none'].includes(response.iconMode)) {
            console.log("🎨 EMBED PAGE - Setting icon mode from database:", response.iconMode);
            setIconMode(response.iconMode as 'lucide' | 'emoji' | 'none');
          } else {
            console.log("⚠️ EMBED PAGE - No valid icon mode in response, using default");
          }
        } else {
          console.log("❌ EMBED PAGE - Form not found or no response");
          setError("Form not found");
        }
      } catch (err) {
        console.error("❌ EMBED PAGE - Error fetching form:", err);
        console.error("❌ EMBED PAGE - Error details:", {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        });
        setError("Failed to load form");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, []);

  // Apply theme colors from form configuration
  useEffect(() => {
    if (formConfig?.theme?.colors) {
      const { colors } = formConfig.theme;

      // Convert color name to hex if needed
      const normalizeColor = (color: string): string => {
        // If it's already a hex color, return as is
        if (color.startsWith('#')) {
          return color;
        }
        
        // Convert common color names to hex
        const colorMap: { [key: string]: string } = {
          'red': '#ef4444',
          'blue': '#3b82f6',
          'green': '#10b981',
          'yellow': '#f59e0b',
          'purple': '#8b5cf6',
          'pink': '#ec4899',
          'indigo': '#6366f1',
          'orange': '#f97316',
          'teal': '#14b8a6',
          'cyan': '#06b6d4',
          'lime': '#84cc16',
          'emerald': '#10b981',
          'violet': '#8b5cf6',
          'fuchsia': '#d946ef',
          'rose': '#f43f5e',
          'sky': '#0ea5e9',
          'amber': '#f59e0b',
          'slate': '#64748b',
          'gray': '#6b7280',
          'zinc': '#71717a',
          'neutral': '#737373',
          'stone': '#78716c'
        };
        
        return colorMap[color.toLowerCase()] || color;
      };

      // Generate a darker shade of a color for hover states
      const getDarkerShade = (color: string): string => {
        const hexColor = normalizeColor(color);
        
        // Ensure it's a valid hex color
        if (!hexColor.startsWith('#') || hexColor.length !== 7) {
          console.warn('Invalid hex color:', hexColor);
          return '#ef4444'; // fallback to red
        }
        
        // Convert hex to RGB
        const r = parseInt(hexColor.substring(1, 3), 16);
        const g = parseInt(hexColor.substring(3, 5), 16);
        const b = parseInt(hexColor.substring(5, 7), 16);
        
        // Check for valid RGB values
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
          console.warn('Invalid RGB values:', { r, g, b });
          return '#bf3636'; // fallback darker red
        }
        
        // Make each component darker by reducing by 20%
        const darkerR = Math.max(0, Math.floor(r * 0.8));
        const darkerG = Math.max(0, Math.floor(g * 0.8));
        const darkerB = Math.max(0, Math.floor(b * 0.8));
        
        // Convert back to hex
        return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
      };

      // Use color from form_config.color column if available, 
      // otherwise use colors.primary from form config, 
      // then fallback to localStorage, and finally to green (#10b981)
      const rawColor = formColor || colors.primary || localStorage.getItem('custom-theme-primary') || "#10b981";
      const primaryColor = normalizeColor(rawColor);
      const savedSecondary = localStorage.getItem('custom-theme-secondary') || "#a855f7";
      const savedAccent = localStorage.getItem('custom-theme-accent') || "#2dd4bf";
      const savedFont = localStorage.getItem('custom-theme-font') || "'Poppins', sans-serif";
      
      console.log("🎨 EMBED - Applying form color:", rawColor, "->", primaryColor);
      console.log("🎨 EMBED - Form config colors:", colors);
      
      // Helper function to convert HEX to HSL string
      const hexToHslString = (color: string): string => {
        const hex = normalizeColor(color);
        const clean = hex.replace('#', '');
        
        // Ensure we have a valid hex color
        if (clean.length !== 6) {
          console.warn('Invalid hex color for HSL conversion:', hex);
          return '0 84% 60%'; // fallback HSL for red
        }
        
        const r = parseInt(clean.substring(0, 2), 16) / 255;
        const g = parseInt(clean.substring(2, 4), 16) / 255;
        const b = parseInt(clean.substring(4, 6), 16) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            default:
              h = (r - g) / d + 4;
          }
          h /= 6;
        }
        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      };
      
      // Create scoped CSS variables for form components only (NOT global)
      const styleEl = document.createElement("style");
      styleEl.id = "embed-form-theme-scoped";
      styleEl.textContent = `
        /* Target the main form container */
        [data-testid="embed-form-container"],
        [data-testid="embed-form-container"] * {
          --color-primary: ${primaryColor} !important;
          --color-primary-dark: ${getDarkerShade(primaryColor)} !important;
          --color-secondary: ${savedSecondary} !important;
          --color-accent: ${savedAccent} !important;
          --color-background: #ffffff !important;
          --color-foreground: #1e293b !important;
          --font-primary: ${savedFont} !important;
        }
        
        /* Target Tailwind primary classes within form */
        [data-testid="embed-form-container"] .border-primary,
        [data-testid="embed-form-container"] .bg-primary,
        [data-testid="embed-form-container"] .text-primary,
        [data-testid="embed-form-container"] .bg-primary\\/10,
        [data-testid="embed-form-container"] .bg-primary\\/5,
        [data-testid="embed-form-container"] .from-primary,
        [data-testid="embed-form-container"] .to-primary\\/80 {
          --primary: ${hexToHslString(primaryColor)} !important;
        }
        
        /* Override Tailwind's primary color for form elements with higher specificity */
        [data-testid="embed-form-container"] .border-primary {
          border-color: ${primaryColor} !important;
        }
        
        [data-testid="embed-form-container"] .bg-primary {
          background-color: ${primaryColor} !important;
        }
        
        [data-testid="embed-form-container"] .text-primary {
          color: ${primaryColor} !important;
        }
        
        [data-testid="embed-form-container"] .bg-primary\\/10 {
          background-color: ${primaryColor}1a !important;
        }
        
        [data-testid="embed-form-container"] .bg-primary\\/5 {
          background-color: ${primaryColor}0d !important;
        }
        
        [data-testid="embed-form-container"] .from-primary {
          --tw-gradient-from: ${primaryColor} !important;
        }
        
        [data-testid="embed-form-container"] .to-primary\\/80 {
          --tw-gradient-to: ${primaryColor}cc !important;
        }
        
        /* Additional high-specificity overrides */
        [data-testid="embed-form-container"] div.border-primary {
          border-color: ${primaryColor} !important;
        }
        
        [data-testid="embed-form-container"] div.bg-primary\\/10 {
          background-color: ${primaryColor}1a !important;
        }
        
        [data-testid="embed-form-container"] span.text-primary {
          color: ${primaryColor} !important;
        }
        
        [data-testid="embed-form-container"] div.from-primary {
          --tw-gradient-from: ${primaryColor} !important;
        }
        
        [data-testid="embed-form-container"] div.to-primary\\/80 {
          --tw-gradient-to: ${primaryColor}cc !important;
        }
        
        /* Target specific button classes */
        [data-testid="embed-form-container"] button.bg-primary {
          background-color: ${primaryColor} !important;
        }
        
        [data-testid="embed-form-container"] button.bg-primary\\/90 {
          background-color: ${primaryColor}e6 !important;
        }
        
        /* Target gradient text */
        [data-testid="embed-form-container"] span.bg-gradient-to-r {
          background-image: linear-gradient(to right, ${primaryColor}, ${primaryColor}b3) !important;
        }
        
        /* Target hover states */
        [data-testid="embed-form-container"] .hover\\:text-primary:hover {
          color: ${primaryColor} !important;
        }
        
        [data-testid="embed-form-container"] .hover\\:border-primary:hover {
          border-color: ${primaryColor} !important;
        }
        
        /* Target specific opacity variations */
        [data-testid="embed-form-container"] .to-primary\\/70 {
          --tw-gradient-to: ${primaryColor}b3 !important;
        }
      `;
      
      // Remove existing scoped styles
      const existingStyle = document.getElementById("embed-form-theme-scoped");
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Add new scoped styles
      document.head.appendChild(styleEl);
      
      console.log("🎨 EMBED - CSS style element added to DOM");
      console.log("🎨 EMBED - CSS content:", styleEl.textContent);

      // Debug: Check if elements are being targeted and try direct injection
      setTimeout(() => {
        const formContainer = document.querySelector('[data-testid="embed-form-container"]');
        if (formContainer) {
          console.log("🎨 EMBED - Form container found:", formContainer);
          const primaryElements = formContainer.querySelectorAll('.bg-primary, .text-primary, .border-primary');
          console.log("🎨 EMBED - Primary elements found:", primaryElements.length, primaryElements);
          
          // Try direct style injection as fallback
          console.log("🎨 EMBED - Attempting direct style injection...");
          (formContainer as HTMLElement).style.setProperty('--color-primary', primaryColor);
          (formContainer as HTMLElement).style.setProperty('--primary', hexToHslString(primaryColor));
          
          // Force apply to any elements with primary classes
          primaryElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            if (el.classList.contains('bg-primary')) {
              htmlEl.style.backgroundColor = primaryColor;
              console.log("🎨 EMBED - Applied bg-primary to:", el);
            }
            if (el.classList.contains('text-primary')) {
              htmlEl.style.color = primaryColor;
              console.log("🎨 EMBED - Applied text-primary to:", el);
            }
            if (el.classList.contains('border-primary')) {
              htmlEl.style.borderColor = primaryColor;
              console.log("🎨 EMBED - Applied border-primary to:", el);
            }
          });
        } else {
          console.log("🎨 EMBED - Form container NOT found!");
        }
      }, 1000);

      // Apply other theme colors from form config
      if (colors.text) {
        const textStyleEl = document.createElement("style");
        textStyleEl.id = "embed-form-text-theme-scoped";
        textStyleEl.textContent = `
          .embed-form-container,
          [data-testid="embed-form-container"],
          .form-renderer-container,
          .form-step-container {
            --text-dark: ${colors.text.dark} !important;
            --text-light: ${colors.text.light} !important;
          }
        `;
        
        // Remove existing text styles
        const existingTextStyle = document.getElementById("embed-form-text-theme-scoped");
        if (existingTextStyle) {
          existingTextStyle.remove();
        }
        
        // Add new text styles
        document.head.appendChild(textStyleEl);
      }

      // Clean up when component unmounts
      return () => {
        const styleToRemove = document.getElementById("embed-form-theme-scoped");
        if (styleToRemove) {
          styleToRemove.remove();
        }
        const textStyleToRemove = document.getElementById("embed-form-text-theme-scoped");
        if (textStyleToRemove) {
          textStyleToRemove.remove();
        }
      };
    }
  }, [formConfig, formColor]);

  // Enhanced ResizeObserver to measure content height and send to parent
  useEffect(() => {
    const container = containerRef.current;
    if (!container || loading) return;

    // Minimum reasonable height for the form
    const BASE_MIN_HEIGHT = 600;
    
    // Keep track of heights to prevent shrinking and ensure smooth transitions
    let lastHeight = 0;
    let maxHeightSent = BASE_MIN_HEIGHT;
    
    // Enhanced height calculation function with detailed debugging
    const calculateAndSendHeight = () => {
      // Get the form container element for more accurate height
      const formContainer = document.querySelector('[data-testid="embed-form-container"]');
      
      // Get all height measurements for debugging
      const bodyHeight = document.body.offsetHeight;
      const htmlHeight = document.documentElement.offsetHeight;
      const containerHeight = container.scrollHeight;
      const formContainerHeight = formContainer ? formContainer.getBoundingClientRect().height : 0;
      
      // Calculate height based on the most accurate source
      const calculatedHeight = formContainer 
        ? formContainer.getBoundingClientRect().height 
        : container.scrollHeight;
      
      // Debug all height measurements
      console.debug(`[embed] Height measurements:
        - body: ${bodyHeight}px
        - html: ${htmlHeight}px
        - container: ${containerHeight}px
        - formContainer: ${formContainerHeight}px
        - calculated: ${calculatedHeight}px
      `);
      
      // Apply smoothing to prevent jumps - don't shrink more than 10% at once
      let newHeight = calculatedHeight;
      
      // Never go below our minimum height
      newHeight = Math.max(BASE_MIN_HEIGHT, newHeight);
      
      // If we're shrinking, limit how much we shrink at once (prevents jarring changes)
      if (lastHeight > 0 && newHeight < lastHeight) {
        const limitedHeight = Math.max(newHeight, lastHeight * 0.9);
        console.debug(`[embed] Limiting height reduction: ${newHeight}px → ${limitedHeight}px`);
        newHeight = limitedHeight;
      }
      
      // Round up to prevent fractional pixel issues
      newHeight = Math.ceil(newHeight);
      
      // Add a small buffer to prevent scrollbars
      newHeight += 10;
      
      // Check for infinite expansion
      if (newHeight > lastHeight * 1.5 && lastHeight > 0) {
        console.warn(`[embed] Potential infinite expansion detected: ${lastHeight}px → ${newHeight}px`);
        // Cap the growth to prevent infinite expansion
        newHeight = lastHeight * 1.2;
      }
      
      // Keep track of our maximum height to prevent constant shrinking/growing
      maxHeightSent = Math.max(maxHeightSent, newHeight);
      
      // Send message if height has changed significantly (more than 5px) or every 15 calls to ensure parent receives it
      const forceUpdate = Math.random() < 0.1; // Occasionally force an update even if height hasn't changed
      if (Math.abs(newHeight - lastHeight) > 5 || forceUpdate) {
        console.debug(`[embed] Sending height update: ${newHeight}px (change: ${newHeight - lastHeight}px)`);
        
        // Send both message formats to ensure compatibility with different parent implementations
        window.parent.postMessage({ type: 'form-resize', height: newHeight }, '*');
        window.parent.postMessage({ type: 'heightUpdate', height: newHeight }, '*');
        
        lastHeight = newHeight;
      }
    };

    // Use ResizeObserver to automatically send height on content change
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(calculateAndSendHeight);
    });
    
    // Observe both the container and its children
    resizeObserver.observe(container);
    
    // Also observe the form container if it exists
    const formContainer = document.querySelector('[data-testid="embed-form-container"]');
    if (formContainer) {
      resizeObserver.observe(formContainer);
    }

    // Utility function to check for overflow issues
    const checkForOverflowIssues = () => {
      const elements = document.querySelectorAll('*');
      const overflowingElements: Array<{
        element: string;
        id: string;
        className: string;
        scrollWidth: number;
        clientWidth: number;
        scrollHeight: number;
        clientHeight: number;
      }> = [];
      
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          const hasOverflow = el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
          const isScrollable = 
            window.getComputedStyle(el).overflowY === 'scroll' || 
            window.getComputedStyle(el).overflowY === 'auto' ||
            window.getComputedStyle(el).overflowX === 'scroll' || 
            window.getComputedStyle(el).overflowX === 'auto';
            
          if (hasOverflow && isScrollable) {
            overflowingElements.push({
              element: el.tagName,
              id: el.id,
              className: el.className,
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
              scrollHeight: el.scrollHeight,
              clientHeight: el.clientHeight
            });
          }
        }
      });
      
      if (overflowingElements.length > 0) {
        console.warn('[embed] Found elements with overflow issues:', overflowingElements);
      }
    };

    // Send initial height after a short delay to ensure content is rendered
    setTimeout(() => {
      calculateAndSendHeight();
      checkForOverflowIssues();
    }, 100);

    // Also send height periodically to catch any missed changes
    const intervalId = setInterval(() => {
      calculateAndSendHeight();
      // Check for overflow issues every 5 seconds
      if (Date.now() % 5000 < 1000) {
        checkForOverflowIssues();
      }
    }, 1000);

    // Cleanup on component unmount
    return () => {
      resizeObserver.disconnect();
      clearInterval(intervalId);
    };
  }, [loading, formConfig]); // Dependencies ensure it runs after form is ready and when form changes

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md bg-white rounded-xl shadow-lg border">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  console.log("🎨 EMBED PAGE - Rendering with:", {
    formConfig: !!formConfig,
    formId,
    iconMode,
    loading,
    error
  });

  return (
    <FormProviderWithIconMode iconMode={iconMode}>
      <div className="w-full flex flex-col no-scrollbar" ref={containerRef}>
        {formConfig && (
          <EmbedFormRenderer testMode={false} formConfig={formConfig} formId={formId} />
        )}
        {!formConfig && !loading && !error && (
          <div className="p-4 text-center text-gray-500">
            No form configuration available
          </div>
        )}
      </div>
      <Toaster />
    </FormProviderWithIconMode>
  );
}
