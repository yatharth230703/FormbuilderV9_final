import { useEffect, useState, ReactNode } from "react";
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

export default function EmbedForm() {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formId, setFormId] = useState<number | null>(null);
  const [iconMode, setIconMode] = useState<'lucide' | 'emoji' | 'none'>('lucide');

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
        console.log("Full URL:", url.toString());

        // Get the new parameters
        const language = url.searchParams.get("language");
        const label = url.searchParams.get("label");
        const domain = url.searchParams.get("domain");
        const iconModeParam = url.searchParams.get("iconMode") as 'lucide' | 'emoji' | 'none' | null;
        
        // Fallback to old form parameter for backward compatibility
        const oldFormId = url.searchParams.get("form") || url.searchParams.get("id");
        
        console.log("URL params:", { language, label, domain, oldFormId, iconModeParam });
        
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
          response = await apiRequest<{
            id: number;
            label: string;
            config: FormConfig;
            created_at: string;
            iconMode?: string;
          }>({
            url: `/api/forms/by-properties?language=${encodeURIComponent(language)}&label=${encodeURIComponent(label)}&domain=${encodeURIComponent(domain)}`,
          });
        } else if (oldFormId) {
          // Old URL structure (backward compatibility)
          response = await apiRequest<{
            id: number;
            label: string;
            config: FormConfig;
            created_at: string;
            iconMode?: string;
          }>({
            url: `/api/forms/${oldFormId}`,
          });
        }

        if (response && response.config) {
          console.log("📄 EMBED PAGE - Form loaded:", {
            id: response.id,
            label: response.label,
            iconMode: response.iconMode,
            hasConfig: !!response.config
          });
          
          setFormConfig(response.config); // Do not inject id
          setFormId(response.id); // Set formId state
          
          // Set icon mode from database if available
          if (response.iconMode && ['lucide', 'emoji', 'none'].includes(response.iconMode)) {
            console.log("🎨 EMBED PAGE - Setting icon mode from database:", response.iconMode);
            setIconMode(response.iconMode as 'lucide' | 'emoji' | 'none');
          } else {
            console.log("⚠️ EMBED PAGE - No valid icon mode in response, using default");
          }
        } else {
          console.log("❌ EMBED PAGE - Form not found");
          setError("Form not found");
        }
      } catch (err) {
        console.error("Error fetching form:", err);
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

      // Load saved custom theme (same as in main app)
      const savedPrimary = localStorage.getItem('custom-theme-primary') || "#3b82f6";
      const savedSecondary = localStorage.getItem('custom-theme-secondary') || "#a855f7";
      const savedAccent = localStorage.getItem('custom-theme-accent') || "#2dd4bf";
      const savedFont = localStorage.getItem('custom-theme-font') || "'Poppins', sans-serif";
      
      // Apply custom theme settings to match the main application
      document.documentElement.style.setProperty('--color-primary', savedPrimary);
      document.documentElement.style.setProperty('--color-primary-dark', getDarkerShade(savedPrimary));
      document.documentElement.style.setProperty('--color-secondary', savedSecondary);
      document.documentElement.style.setProperty('--color-accent', savedAccent);
      document.documentElement.style.setProperty('--color-background', '#ffffff'); // Always white
      document.documentElement.style.setProperty('--color-foreground', '#1e293b'); // Always dark slate
      document.documentElement.style.setProperty('--font-primary', savedFont);

      // Set primary color in the correct HSL format (for shadcn components)
      document.documentElement.style.setProperty("--primary", "141 73% 43%");

      // Apply other theme colors from form config
      if (colors.text) {
        document.documentElement.style.setProperty(
          "--text-dark",
          colors.text.dark,
        );
        document.documentElement.style.setProperty(
          "--text-light",
          colors.text.light,
        );
      }

      // Clean up when component unmounts
      return () => {
        document.documentElement.style.removeProperty("--color-primary");
        document.documentElement.style.removeProperty("--color-primary-dark");
        document.documentElement.style.removeProperty("--color-secondary");
        document.documentElement.style.removeProperty("--color-accent");
        document.documentElement.style.removeProperty("--color-background");
        document.documentElement.style.removeProperty("--color-foreground");
        document.documentElement.style.removeProperty("--font-primary");
        document.documentElement.style.removeProperty("--primary");
        document.documentElement.style.removeProperty("--text-dark");
        document.documentElement.style.removeProperty("--text-light");
      };
    }
  }, [formConfig]);

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

  return (
    <FormProviderWithIconMode iconMode={iconMode}>
      <div className="w-full">
        {formConfig && (
          <EmbedFormRenderer testMode={false} formConfig={formConfig} formId={formId} />
        )}
      </div>
      <Toaster />
    </FormProviderWithIconMode>
  );
}
