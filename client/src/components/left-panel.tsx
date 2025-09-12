import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "@/contexts/form-context";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import {
  Thermometer,
  Copy,
  Download,
  ArrowUp,
  Send,
  Check,
  User,
  LogIn,
  AlertTriangle
} from "lucide-react";
import { FormConfig } from "@shared/types";
import { useLocation } from "wouter";
import userIcon from "./user-icon.png";
import chatbotIcon from "./chatbot-icon.png";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// Message type for chat history
type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
  jsonData?: FormConfig | null;
};

// 1️⃣ Accept an optional `initialPrompt` prop
interface LeftPanelProps {
    initialPrompt?: string;
  }
  
  export default function LeftPanel({ initialPrompt }: LeftPanelProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "system",
      content: "Welcome to Forms Engine! Enter a prompt to generate a form.",
      timestamp: new Date(),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("Ready");
  const [statusColor, setStatusColor] = useState("bg-green-500");
  
  // Theme customization state
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [selectedFont, setSelectedFont] = useState("'Poppins', sans-serif");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  //const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    setFormConfig, 
    formConfig, 
    resetForm, 
    updateThemeColor, 
    updateFontFamily,
    setFormId,
    setPromptHistory
  } = useFormContext();  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
    // ─────────────────────────────────────────────────────
    // 2️⃣ Seed the initial prompt exactly once on mount
  const seededRef = useRef(false);
    useEffect(() => {
        console.log("[LeftPanel] initialPrompt=", initialPrompt, "user=", user);
        // only run if we have a prompt, haven't seeded yet, and user is logged in
        if (initialPrompt && user && !seededRef.current) {
          seededRef.current = true;
          handleSendMessage(initialPrompt);
        }
      }, [initialPrompt, user]);
  // ─────────────────────────────────────────────────────
  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // ─────────────────────────────────────────────────────
  // Apply colors from formConfig when it loads - SCOPED TO FORM ONLY
  useEffect(() => {
    if (formConfig?.theme?.colors?.primary) {
      const rawColor = formConfig.theme.colors.primary;
      const primaryColor = normalizeColor(rawColor);
      
      console.log("🎨 LEFT PANEL - Applying form color:", rawColor, "->", primaryColor);
      
      // Generate darker shade
      const primaryDark = getDarkerShade(primaryColor);

      // Create scoped CSS variables for form components only
      const styleEl = document.createElement("style");
      styleEl.id = "form-theme-scoped";
      styleEl.textContent = `
        /* Target the main form container with multiple selectors */
        [data-testid="embed-form-container"],
        [data-testid="embed-form-container"] *,
        .embed-form-container,
        .embed-form-container *,
        .form-renderer-container,
        .form-renderer-container *,
        .form-step-container,
        .form-step-container * {
          --color-primary: ${primaryColor} !important;
          --color-primary-dark: ${primaryDark} !important;
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
        
        /* FALLBACK: Apply to ALL primary elements regardless of container */
        .border-primary {
          border-color: ${primaryColor} !important;
        }
        
        .bg-primary {
          background-color: ${primaryColor} !important;
        }
        
        .text-primary {
          color: ${primaryColor} !important;
        }
        
        .bg-primary\\/10 {
          background-color: ${primaryColor}1a !important;
        }
        
        .bg-primary\\/5 {
          background-color: ${primaryColor}0d !important;
        }
        
        .from-primary {
          --tw-gradient-from: ${primaryColor} !important;
        }
        
        .to-primary\\/80 {
          --tw-gradient-to: ${primaryColor}cc !important;
        }
        
        .to-primary\\/70 {
          --tw-gradient-to: ${primaryColor}b3 !important;
        }
      `;
      
      console.log("🎨 LEFT PANEL - CSS content:", styleEl.textContent);
      
      // Remove existing scoped styles
      const existingStyle = document.getElementById("form-theme-scoped");
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Add new scoped styles
      document.head.appendChild(styleEl);
      
      console.log("🎨 LEFT PANEL - Style element added to DOM");
      
      // Debug: Check if elements are being targeted with multiple attempts
      const checkAndApplyColors = () => {
        console.log("🎨 LEFT PANEL - Checking for form container...");
        
        // Check for various possible form containers
        const possibleContainers = [
          '[data-testid="embed-form-container"]',
          '.embed-form-container',
          '.form-renderer-container',
          '.form-step-container',
          '[class*="form"]',
          '[class*="embed"]'
        ];
        
        let formContainer = null;
        for (const selector of possibleContainers) {
          const found = document.querySelector(selector);
          if (found) {
            console.log(`🎨 LEFT PANEL - Found container with selector "${selector}":`, found);
            formContainer = found;
            break;
          }
        }
        
        // Also check for any elements with "primary" classes anywhere in the document
        const allPrimaryElements = document.querySelectorAll('[class*="primary"]');
        console.log("🎨 LEFT PANEL - ALL primary elements in document:", allPrimaryElements.length, allPrimaryElements);
        
        // Check for any elements with "form" classes anywhere in the document
        const allFormElements = document.querySelectorAll('[class*="form"]');
        console.log("🎨 LEFT PANEL - ALL form elements in document:", allFormElements.length, allFormElements);
        
        if (formContainer) {
          console.log("🎨 LEFT PANEL - Form container found:", formContainer);
          const primaryElements = formContainer.querySelectorAll('.bg-primary, .text-primary, .border-primary');
          console.log("🎨 LEFT PANEL - Primary elements found:", primaryElements.length, primaryElements);
          
          // Check for ALL possible primary-related classes
          const allPrimaryElements = formContainer.querySelectorAll('[class*="primary"]');
          console.log("🎨 LEFT PANEL - ALL primary-related elements:", allPrimaryElements.length, allPrimaryElements);
          
          // Check for gradient elements specifically
          const gradientElements = formContainer.querySelectorAll('[class*="gradient"], [class*="from-"], [class*="to-"]');
          console.log("🎨 LEFT PANEL - Gradient elements:", gradientElements.length, gradientElements);
          
          // Try direct style injection as fallback
          console.log("🎨 LEFT PANEL - Attempting direct style injection...");
          (formContainer as HTMLElement).style.setProperty('--color-primary', primaryColor);
          (formContainer as HTMLElement).style.setProperty('--primary', hexToHslString(primaryColor));
          
          // Force apply to any elements with primary classes
          primaryElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            if (el.classList.contains('bg-primary')) {
              htmlEl.style.backgroundColor = primaryColor;
              console.log("🎨 LEFT PANEL - Applied bg-primary to:", el);
            }
            if (el.classList.contains('text-primary')) {
              htmlEl.style.color = primaryColor;
              console.log("🎨 LEFT PANEL - Applied text-primary to:", el);
            }
            if (el.classList.contains('border-primary')) {
              htmlEl.style.borderColor = primaryColor;
              console.log("🎨 LEFT PANEL - Applied border-primary to:", el);
            }
          });
          
          // Also try to apply to gradient elements
          gradientElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            if (el.classList.contains('from-primary')) {
              htmlEl.style.setProperty('--tw-gradient-from', primaryColor);
              console.log("🎨 LEFT PANEL - Applied from-primary to:", el);
            }
            if (el.classList.contains('to-primary')) {
              htmlEl.style.setProperty('--tw-gradient-to', primaryColor);
              console.log("🎨 LEFT PANEL - Applied to-primary to:", el);
            }
          });
          
          // AGGRESSIVE APPROACH: Apply color to ALL elements that might need it
          console.log("🎨 LEFT PANEL - Applying AGGRESSIVE color injection...");
          const allElements = formContainer.querySelectorAll('*');
          allElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            const classes = Array.from(el.classList);
            
            // Check if element has any primary-related classes
            const hasPrimaryClass = classes.some(cls => 
              cls.includes('primary') || 
              cls.includes('gradient') || 
              cls.includes('from-') || 
              cls.includes('to-')
            );
            
            if (hasPrimaryClass) {
              console.log("🎨 LEFT PANEL - Found element with primary classes:", el, classes);
              
              // Apply all possible primary styles
              if (classes.includes('bg-primary')) {
                htmlEl.style.backgroundColor = primaryColor;
              }
              if (classes.includes('text-primary')) {
                htmlEl.style.color = primaryColor;
              }
              if (classes.includes('border-primary')) {
                htmlEl.style.borderColor = primaryColor;
              }
              if (classes.includes('from-primary')) {
                htmlEl.style.setProperty('--tw-gradient-from', primaryColor);
              }
              if (classes.includes('to-primary')) {
                htmlEl.style.setProperty('--tw-gradient-to', primaryColor);
              }
            }
          });
          
          return true; // Found and processed
        } else {
          console.log("🎨 LEFT PANEL - Form container NOT found!");
          return false; // Not found
        }
      };
      
      // Try immediately
      checkAndApplyColors();
      
      // Try again after delays
      setTimeout(checkAndApplyColors, 500);
      setTimeout(checkAndApplyColors, 1000);
      setTimeout(checkAndApplyColors, 2000);
      
      // Cleanup function
      return () => {
        const styleToRemove = document.getElementById("form-theme-scoped");
        if (styleToRemove) {
          styleToRemove.remove();
        }
      };
    }
  }, [formConfig]);

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

  // Helper: convert HEX -> HSL string "H S% L%" for Tailwind CSS variables
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

  // Apply font change
  const applyFont = (fontFamily: string) => {
    document.documentElement.style.setProperty('--font-primary', fontFamily);
    updateFontFamily(fontFamily);
    localStorage.setItem('custom-theme-font', fontFamily);
    

    // 🚀 Update the FormConfig
    if (formConfig) {
      setFormConfig({
        ...formConfig,
        theme: {
          ...formConfig.theme,
          // Note: Font configuration is handled separately via CSS variables
        }
      });
    }

    toast({
      title: "Font Changed",
      description: `Font updated to ${fontFamily.split(',')[0].replace(/['"]+/g, '')}`,
    });
  };

  // Load fonts and initialize theme
  useEffect(() => {
    // Load all supported fonts
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
    
    fontLinks.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
    
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

    // Load saved font
    const savedFont = localStorage.getItem('custom-theme-font') || "'Poppins', sans-serif";
    setSelectedFont(savedFont);
    
    // Apply saved font
    document.documentElement.style.setProperty('--font-primary', savedFont);
  }, []);


  // Handle sending a message in chat
  const handleSendMessage = async (userText: string) => {
    if (!user){
      return setLocation("/auth");
    }
    if (!userText.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: userText,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMessage]);

    // Clear input
    setPrompt("");

    // Start loading state
    setIsGenerating(true);

    // Add temporary assistant message with loading state
    const tempAssistantMsg: ChatMessage = {
      role: "assistant",
      content: "Generating...",
      timestamp: new Date(),
      isGenerating: true,
    };
    setChatHistory((prev) => [...prev, tempAssistantMsg]);

    // Determine if this is initial form generation or JSON editing
    const isInitialGeneration = !formConfig;

    try {
      if (isInitialGeneration) {
        // Generate initial form
        await handleInitialFormGeneration(userText);
      } else {
        // Edit existing JSON
        await handleJsonEdit(userText);
      }
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
      // Remove loading message
      setChatHistory((prev) => prev.filter((msg) => !msg.isGenerating));
      // Add error message
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Something went wrong"}`,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMsg]);

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle initial form generation
  const handleInitialFormGeneration = async (promptText: string) => {
    setStatusText("Generating form...");
    setStatusColor("bg-yellow-500");

    const data = await apiRequest<{ id: number; config: FormConfig }>({
      url: "/api/prompt",
      method: "POST",
      body: JSON.stringify({ prompt: promptText }),
      headers: { "Content-Type": "application/json" },
    });

    if (!data.config) {
      throw new Error("Invalid response from server");
    }

    // Update form config
    setFormConfig(data.config);
    setFormId(data.id);
    setPromptHistory([promptText]);
    setStatusText("Form generated successfully");
    setStatusColor("bg-green-500");

    // Remove loading message
    setChatHistory((prev) => prev.filter((msg) => !msg.isGenerating));

    // Add success message with JSON
    const successMsg: ChatMessage = {
      role: "assistant",
      content:
        "✅ Form generated successfully! Here's the JSON. You can now ask me to modify specific parts of the form.",
      timestamp: new Date(),
      jsonData: data.config,
    };
    setChatHistory((prev) => [...prev, successMsg]);

    toast({
      title: "Success",
      description: "Form configuration generated successfully",
    });
  };

  // Handle JSON editing
  const handleJsonEdit = async (instruction: string) => {
    if (!formConfig) {
      throw new Error("No form configuration to edit");
    }

    // Call the API to edit the JSON
    const res = await apiRequest<{ config: FormConfig }>({
      url: "/api/edit-form",
      method: "POST",
      body: JSON.stringify({
        currentConfig: formConfig,
        instruction: instruction,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.config) {
      throw new Error("Invalid response from server");
    }

    // Update form config
    setFormConfig(res.config);

    // Remove loading message
    setChatHistory((prev) => prev.filter((msg) => !msg.isGenerating));

    // Add success message with updated JSON
    const successMsg: ChatMessage = {
      role: "assistant",
      content:
        "✅ Form updated successfully! Here's the updated JSON. You can continue making changes or test the form.",
      timestamp: new Date(),
      jsonData: res.config,
    };
    setChatHistory((prev) => [...prev, successMsg]);

    toast({
      title: "Success",
      description: "Form configuration updated successfully",
    });
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(prompt);
    }
  };

  // Handle copy JSON
  const handleCopyJson = () => {
    if (!formConfig) return;
    navigator.clipboard
      .writeText(JSON.stringify(formConfig, null, 2))
      .then(() =>
        toast({
          title: "JSON copied",
          description: "Form configuration copied to clipboard",
        }),
      )
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        }),
      );
  };

  // Handle download JSON
  const handleDownloadJson = () => {
    if (!formConfig) return;
    const jsonString = JSON.stringify(formConfig, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "JSON downloaded",
      description: "Form configuration downloaded as JSON file",
    });
  };

  return (
    <div className="w-full md:w-[25%] h-full flex flex-col border-r border-gray-200 bg-white p-4 overflow-hidden">
      {/* Header */}
      <div className="py-4 mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <Thermometer className="h-7 w-7 mr-2" />
          Forms Engine
        </h1>
        <div className="flex items-center gap-4">
          {user ? (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setLocation("/dashboard")}
            >
              My Dashboard
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setLocation("/auth")}
            >
              <LogIn className="h-4 w-4 mr-1" />
              Sign In
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              title="Change Font"
              className="relative"
              onClick={() => setShowFontPicker(true)}
            >
              <span className="text-xs font-bold">Aa</span>
              <span className="sr-only">Change Font</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Font Picker Dialog */}
      <Dialog open={showFontPicker} onOpenChange={setShowFontPicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Font</DialogTitle>
            <DialogDescription>
              Select a font for your form.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex flex-col gap-4">
              <Select
                value={selectedFont}
                onValueChange={(value) => setSelectedFont(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="'Arial', sans-serif">Arial</SelectItem>
                  <SelectItem value="'Helvetica', sans-serif">Helvetica</SelectItem>
                  <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                  <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                  <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                  <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                  <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                  <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
                  <SelectItem value="'Noto Sans', sans-serif">Noto Sans</SelectItem>
                  <SelectItem value="'Segoe UI', sans-serif">Segoe UI</SelectItem>
                  <SelectItem value="'Ubuntu', sans-serif">Ubuntu</SelectItem>
                  <SelectItem value="'Fira Sans', sans-serif">Fira Sans</SelectItem>
                  <SelectItem value="'Source Sans Pro', sans-serif">Source Sans Pro</SelectItem>
                  <SelectItem value="'PT Sans', sans-serif">PT Sans</SelectItem>
                  <SelectItem value="'Verdana', sans-serif">Verdana</SelectItem>
                  <SelectItem value="'Tahoma', sans-serif">Tahoma</SelectItem>
                  <SelectItem value="'Georgia', serif">Georgia</SelectItem>
                  <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                  <SelectItem value="'Merriweather', serif">Merriweather</SelectItem>
                  <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="bg-white border rounded-md p-4">
                <div className="font-medium mb-2">Preview:</div>
                <p style={{ fontFamily: selectedFont }}>
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFontPicker(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                applyFont(selectedFont);
                setShowFontPicker(false);
              }}
            >
              Apply Font
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden hide-scrollbar border rounded-lg p-4 mb-4 bg-gray-50"
      >
        {chatHistory.map((message, index) => {
          // Determine icon based on role
          let iconSrc = null;
          if (message.role === "user") {
            iconSrc = userIcon;
          } else if (message.role === "assistant" || message.role === "system") {
            iconSrc = chatbotIcon;
          }

          // Add spacing between system and user messages
          const prevMsg = chatHistory[index - 1];
          const isSystemAfterUser =
            message.role === "system" && prevMsg && prevMsg.role === "user";

          return (
            <div
              key={index}
              className={`mb-4 flex items-start ${
                isSystemAfterUser ? "mt-6" : ""
              }`}
            >
              {/* Icon */}
              {iconSrc && (
                <img
                  src={iconSrc}
                  alt={message.role === "user" ? "User" : "Bot"}
                  className="w-8 h-8 rounded-full object-cover mr-3 mt-1 border border-gray-300 bg-white"
                />
              )}
              <div className="flex-1">
                {/* System message style */}
                {message.role === "system" ? (
                  <div className="text-sm text-gray-500 inline-block">
                    {message.content}
                  </div>
                ) : (
                  <div
                    className={`py-2 w-full max-w-full text-base text-gray-900 break-words whitespace-pre-line ${
                      message.role === "assistant" &&
                      !(
                        message.content.startsWith("✅ Form generated successfully!") ||
                        message.content.startsWith("✅ Form updated successfully!")
                      )
                        ? "bg-gray-200 rounded-2xl px-3"
                        : ""
                    }`}
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    {message.isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse">Generating</div>
                        <div className="flex space-x-1">
                          <div
                            className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                )}

                {/* JSON Preview (only for assistant messages with JSON data) */}
                {message.role === "assistant" && message.jsonData && (
                  <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg text-xs font-mono">
                    <div className="mb-2 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700">
                        Generated JSON
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          title="Copy JSON"
                          onClick={handleCopyJson}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          title="Download JSON"
                          onClick={handleDownloadJson}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <pre className="whitespace-pre-wrap break-words text-[10px] leading-tight">
                        {JSON.stringify(message.jsonData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <Textarea
          ref={inputRef}
          placeholder={
            formConfig
              ? "Describe how you want to modify the form..."
              : "Describe the form you want to create..."
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          // redirect to login 
          onFocus={()=>{
            if(!user){
              setLocation("/auth")
            }
          }}
          onKeyDown={handleKeyDown}
          className="min-h-20 flex-1 resize-none"
          disabled={isGenerating}
        />
        <Button
          className="h-10 px-3"
          onClick={() => handleSendMessage(prompt)}
          disabled={isGenerating || !prompt.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Status indicator */}
      <div className="mt-2 flex text-xs text-gray-500 items-center">
        <span className={`w-2 h-2 rounded-full ${statusColor} mr-2`}></span>
        <span>{statusText}</span>
      </div>
    </div>
  );
}