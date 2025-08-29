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
  Palette,
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [currentColorTarget, setCurrentColorTarget] = useState<'primary' | 'secondary' | 'accent'>('primary');
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#a855f7");
  const [accentColor, setAccentColor] = useState("#2dd4bf");
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

  // Apply custom theme colors
  const applyCustomTheme = () => {
    // Generate darker shade
    const primaryDark = getDarkerShade(primaryColor);

    // Apply CSS variables
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--color-primary-dark', primaryDark);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    document.documentElement.style.setProperty('--color-accent', accentColor);
    document.documentElement.style.setProperty('--color-background', '#ffffff');
    document.documentElement.style.setProperty('--color-foreground', '#1e293b');
    
    // Also set Tailwind CSS variable --primary so utilities like bg-primary/10 use the chosen color
    try {
      const hsl = hexToHslString(primaryColor);
      document.documentElement.style.setProperty("--primary", hsl);
    } catch {}

    updateThemeColor('primary', primaryColor);
    updateThemeColor('secondary', secondaryColor);
    updateThemeColor('accent', accentColor);

    // Save to localStorage
    localStorage.setItem('custom-theme-primary', primaryColor);
    localStorage.setItem('custom-theme-secondary', secondaryColor);
    localStorage.setItem('custom-theme-accent', accentColor);

    // 🚀 Update the FormConfig
    if (formConfig) {
      setFormConfig({
        ...formConfig,
        theme: {
          ...formConfig.theme,
          colors: {
            ...formConfig.theme.colors,
            primary: primaryColor,
            text: {
              dark: "#1e293b", // slate-800
              light: "#ffffff",
              muted: "#9ca3af" // gray-400
            },
            background: {
              light: "#ffffff",
              white: "#ffffff"
            }
          }
        }
      });
    }

    toast({
      title: "Theme Updated",
      description: "Custom theme colors applied successfully",
    });
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


  // Handle color change from color picker
  const handleColorChange = (color: string) => {
    switch (currentColorTarget) {
      case 'primary':
        setPrimaryColor(color);
        break;
      case 'secondary':
        setSecondaryColor(color);
        break;
      case 'accent':
        setAccentColor(color);
        break;
    }
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

    // Load saved custom theme or set defaults
    const savedPrimary = localStorage.getItem('custom-theme-primary') || "#3b82f6";
    const savedSecondary = localStorage.getItem('custom-theme-secondary') || "#a855f7";
    const savedAccent = localStorage.getItem('custom-theme-accent') || "#2dd4bf";
    const savedFont = localStorage.getItem('custom-theme-font') || "'Poppins', sans-serif";
    
    setPrimaryColor(savedPrimary);
    setSecondaryColor(savedSecondary);
    setAccentColor(savedAccent);
    setSelectedFont(savedFont);
    
    // Apply saved theme
    document.documentElement.style.setProperty('--color-primary', savedPrimary);
    document.documentElement.style.setProperty('--color-primary-dark', getDarkerShade(savedPrimary));
    document.documentElement.style.setProperty('--color-secondary', savedSecondary);
    document.documentElement.style.setProperty('--color-accent', savedAccent);
    document.documentElement.style.setProperty('--color-background', '#ffffff');
    document.documentElement.style.setProperty('--color-foreground', '#1e293b');
    document.documentElement.style.setProperty('--font-primary', savedFont);
    
    // Also set Tailwind CSS variable --primary so utilities like bg-primary/10 use the chosen color
    try {
      const hsl = hexToHslString(savedPrimary);
      document.documentElement.style.setProperty("--primary", hsl);
    } catch {}
  }, []);

      // Add CSS variables for theming
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      :root {
        --color-primary: ${primaryColor};
        --color-primary-dark: ${getDarkerShade(primaryColor)};
        --color-secondary: ${secondaryColor};
        --color-background: #ffffff;
        --color-foreground: #1e293b;
        --color-accent: ${accentColor};
        --font-primary: ${selectedFont};
      }
      body, button, input, select, textarea { font-family: var(--font-primary); }
      .text-primary { color: var(--color-primary); }
      .bg-primary { background-color: var(--color-primary); }
      .hover\\:bg-primary-dark:hover { background-color: var(--color-primary-dark); }
    `;
    document.head.appendChild(styleEl);
    
    // Also set Tailwind CSS variable --primary so utilities like bg-primary/10 use the chosen color
    try {
      const hsl = hexToHslString(primaryColor);
      document.documentElement.style.setProperty("--primary", hsl);
    } catch {}
    
    // Return a cleanup function
    return function cleanup() {
      document.head.removeChild(styleEl);
    };
  }, [primaryColor, secondaryColor, accentColor, selectedFont]);

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
              title="Customize Colors"
              className="relative"
              onClick={() => setShowColorPicker(true)}
            >
              <Palette className="h-5 w-5" />
              <span className="sr-only">Customize Colors</span>
            </Button>
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
      
      {/* Color Picker Dialog */}
      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Theme Colors</DialogTitle>
            <DialogDescription>
              Select which color to change, then choose a new value.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex flex-col gap-4">
              <div>
                <Select 
                  value={currentColorTarget} 
                  onValueChange={(value) => setCurrentColorTarget(value as 'primary' | 'secondary' | 'accent')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select color to change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary Color</SelectItem>
                    <SelectItem value="secondary">Secondary Color</SelectItem>
                    <SelectItem value="accent">Accent Color</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Preview:</div>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ 
                      backgroundColor: currentColorTarget === 'primary' 
                        ? primaryColor 
                        : currentColorTarget === 'secondary'
                          ? secondaryColor
                          : accentColor
                    }}
                  ></div>
                  <div>
                    <div className="font-medium">
                      {currentColorTarget === 'primary' 
                        ? primaryColor 
                        : currentColorTarget === 'secondary'
                          ? secondaryColor
                          : accentColor
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="color-picker-container">
                <div className="bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 h-8 rounded-md cursor-pointer mb-2"
                     onClick={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const x = e.clientX - rect.left;
                       const width = rect.width;
                       const percentage = x / width;
                       
                       // Generate a color based on position in the gradient
                       let color;
                       if (percentage < 0.2) {
                         // Red to Yellow
                         color = `#${Math.floor(255).toString(16)}${Math.floor(percentage * 5 * 255).toString(16).padStart(2, '0')}00`;
                       } else if (percentage < 0.4) {
                         // Yellow to Green
                         color = `#${Math.floor(255 - (percentage - 0.2) * 5 * 255).toString(16).padStart(2, '0')}${Math.floor(255).toString(16)}00`;
                       } else if (percentage < 0.6) {
                         // Green to Blue
                         color = `#00${Math.floor(255 - (percentage - 0.4) * 5 * 255).toString(16).padStart(2, '0')}${Math.floor((percentage - 0.4) * 5 * 255).toString(16).padStart(2, '0')}`;
                       } else if (percentage < 0.8) {
                         // Blue to Purple
                         color = `#${Math.floor((percentage - 0.6) * 5 * 255).toString(16).padStart(2, '0')}00${Math.floor(255).toString(16)}`;
                       } else {
                         // Purple to Red
                         color = `#${Math.floor(255).toString(16)}00${Math.floor(255 - (percentage - 0.8) * 5 * 255).toString(16).padStart(2, '0')}`;
                       }
                       
                       handleColorChange(color);
                     }}
                ></div>
                
                <div className="grid grid-cols-5 gap-2">
                  {[
                    "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", 
                    "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
                    "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
                  ].map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded-md border cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    ></div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <input
                    type="text"
                    value={currentColorTarget === 'primary' 
                      ? primaryColor 
                      : currentColorTarget === 'secondary'
                        ? secondaryColor
                        : accentColor
                    }
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                    pattern="^#([A-Fa-f0-9]{6})$"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowColorPicker(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                applyCustomTheme();
                setShowColorPicker(false);
              }}
            >
              Apply Colors
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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