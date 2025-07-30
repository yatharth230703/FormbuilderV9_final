import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserNav } from "@/components/auth/UserNav";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FormConfig } from "@shared/types";
import ManualModePanel from "../components/edit/ManualModePanel";
import AIModePanel from "../components/edit/AIModePanel";
import { IconModeToggle } from "@/components/ui/icon-mode-toggle";
import { useFormContext } from "@/contexts/form-context";

interface FormData {
  id: number;
  label: string;
  config: FormConfig;
  created_at: string;
  language: string;
  domain: string;
  user_uuid: string | null;
  promptHistory?: string[];
  iconMode?: string;
}

type EditMode = 'manual' | 'ai' | null;

export default function EditPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const params = useParams();
  const formId = params.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { iconMode, setIconMode } = useFormContext();
  
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentConfig, setCurrentConfig] = useState<FormConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // For forcing iframe refresh
  const [iframeHeight, setIframeHeight] = useState('600px'); // Default height

  // Force iframe refresh when icon mode changes
  useEffect(() => {
    setIframeKey(prev => prev + 1);
  }, [iconMode]);

  // Fetch form data
  const { data: formDetails, isLoading: formLoading, error: formError } = useQuery({
    queryKey: [`/api/forms/${formId}`],
    enabled: !!formId && !!user,
  }) as { data: any | undefined, isLoading: boolean, error: any };

  // Update form data when fetched
  useEffect(() => {
    if (formDetails && typeof formDetails === 'object') {
      console.log("📄 EDIT PAGE - Form details loaded:", {
        id: formDetails.id,
        label: formDetails.label,
        iconMode: formDetails.iconMode,
        hasConfig: !!formDetails.config
      });
      
      setFormData(formDetails as FormData);
      setCurrentConfig(formDetails.config);
      
      // Set the icon mode from the database
      if (formDetails.iconMode) {
        console.log("🎨 EDIT PAGE - Setting icon mode from database:", formDetails.iconMode);
        setIconMode(formDetails.iconMode);
      } else {
        console.log("⚠️ EDIT PAGE - No icon mode in form details, using default");
      }
    }
  }, [formDetails, setIconMode]);

  // Listen for height messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // IMPORTANT: In a real production app, you should validate event.origin
      // to ensure messages are coming from a trusted source.
      if (event.data && event.data.type === 'form-resize') {
        // Add a small buffer (e.g., 15px) to prevent scrollbars from appearing
        // due to sub-pixel rendering or other minor layout shifts.
        const newHeight = event.data.height + 15;
        setIframeHeight(`${newHeight}px`);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []); // Empty dependency array ensures this runs only once

  // Save form configuration mutation
  const saveFormMutation = useMutation({
    mutationFn: (config: FormConfig) => {
      const requestBody = {
        originalFormId: formData?.id,
        label: formData?.label || 'Untitled Form',
        config: config,
        language: formData?.language || 'en',
        promptHistory: formData?.promptHistory || [],
        iconMode: iconMode
      };
      
      console.log("💾 EDIT PAGE - Saving form configuration:", {
        formId: formData?.id,
        iconMode: iconMode,
        requestBody
      });
      
      return apiRequest('/api/publish', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forms/${formId}`] });
      setIframeKey(prev => prev + 1); // Force iframe refresh
      toast({
        title: "Success",
        description: "Form configuration saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save form configuration",
        variant: "destructive",
      });
    },
  });

  const handleSaveAndView = async () => {
    if (!currentConfig) {
      toast({
        title: "Error",
        description: "No configuration to save",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await saveFormMutation.mutateAsync(currentConfig);
    } finally {
      setSaving(false);
    }
  };

  const handleConfigUpdate = (newConfig: FormConfig) => {
    setCurrentConfig(newConfig);
  };

  if (formLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading form...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (formError || !formData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load form</p>
            <Button onClick={() => setLocation("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">Edit Form</h1>
            </div>
            <div className="flex gap-3 items-center">
              <CreditsDisplay />
              <UserNav />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {/* Mode Selection Buttons */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex gap-4">
              <Button
                variant={editMode === 'manual' ? 'default' : 'outline'}
                onClick={() => setEditMode('manual')}
                className="flex-1"
              >
                MANUAL MODE
              </Button>
              <Button
                variant={editMode === 'ai' ? 'default' : 'outline'}
                onClick={() => setEditMode('ai')}
                className="flex-1"
              >
                AI MODE
              </Button>
            </div>
            
            {/* Icon Mode Toggle */}
            <div className="flex justify-center">
              <IconModeToggle />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel */}
            <div className="lg:col-span-1">
              {editMode === null ? (
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-medium">Please select an edit mode</p>
                    </div>
                  </CardContent>
                </Card>
              ) : editMode === 'manual' ? (
                <ManualModePanel 
                  formConfig={currentConfig}
                  onConfigUpdate={handleConfigUpdate}
                />
              ) : (
                <AIModePanel 
                  formConfig={currentConfig}
                  onConfigUpdate={handleConfigUpdate}
                />
              )}
            </div>

            {/* Right Panel - Form Preview */}
            <div className="lg:col-span-2">
              <Card className="p-0 overflow-hidden">
                <iframe
                  src={`/embed?form=${formData.id}&iconMode=${iconMode}`}
                  className="w-full border-0"
                  title="Form Preview"
                  key={`${formData.id}-${iframeKey}-${iconMode}`}
                  style={{
                    height: iframeHeight,
                    transition: 'height 0.2s ease-out'
                  }}
                />
              </Card>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <Button
              onClick={handleSaveAndView}
              disabled={saving || !currentConfig}
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "SAVE AND VIEW CHANGES"}
            </Button>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 