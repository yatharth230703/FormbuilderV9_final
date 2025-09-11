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

export default function EmbedForm() {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formId, setFormId] = useState<number | null>(null);
  const [iconMode, setIconMode] = useState<'lucide' | 'emoji' | 'none'>('lucide');
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
          console.log("🔍 EMBED PAGE - Using old URL structure with form ID:", oldFormId);
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
            hasConfig: !!response.config,
            configSteps: response.config.steps?.length || 0,
            configTheme: !!response.config.theme
          });
          
          console.log("📄 EMBED PAGE - Full form config:", JSON.stringify(response.config, null, 2));
          
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

      // Use primary color from form config, fallback to localStorage if not available
      const primaryColor = colors.primary || localStorage.getItem('custom-theme-primary') || "#10b981";
      const savedSecondary = localStorage.getItem('custom-theme-secondary') || "#a855f7";
      const savedAccent = localStorage.getItem('custom-theme-accent') || "#2dd4bf";
      const savedFont = localStorage.getItem('custom-theme-font') || "'Poppins', sans-serif";
      
      // Apply custom theme settings to match the main application
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-primary-dark', getDarkerShade(primaryColor));
      document.documentElement.style.setProperty('--color-secondary', savedSecondary);
      document.documentElement.style.setProperty('--color-accent', savedAccent);
      document.documentElement.style.setProperty('--color-background', '#ffffff'); // Always white
      document.documentElement.style.setProperty('--color-foreground', '#1e293b'); // Always dark slate
      document.documentElement.style.setProperty('--font-primary', savedFont);

      // Set primary color in HSL so Tailwind "primary" tokens (e.g., bg-primary/10) match the chosen theme
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
      document.documentElement.style.setProperty("--primary", hexToHslString(primaryColor));

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
