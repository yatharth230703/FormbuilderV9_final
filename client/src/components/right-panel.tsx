import { useState } from "react";
import { useFormContext } from "@/contexts/form-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FormRenderer from "@/components/form-renderer";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCcw, Save, CheckCircle, Send } from "lucide-react";
import PublishModal from "@/components/publish-modal";
import { FormConfig } from "@shared/types";

export default function RightPanel() {
  const [testMode, setTestMode] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const { toast } = useToast();

  // pull in formId (null = never saved), plus setter
  const {
    formConfig,
    formId,
    setFormId,
    promptHistory,
    setPromptHistory,
    resetServerConfig,
    resetResponses,
    currentStep,
    totalSteps,
  } = useFormContext();

  const handleSaveForm = async () => {
    if (!formConfig) {
      toast({ title: "Error", description: "No form to save", variant: "destructive" });
      return;
    }

    // safe fallback label
    const safeLabel = formConfig.steps?.[0]?.title?.trim() || "Untitled Form";

    const payload = {
      originalFormId: formId,     // null on first save
      label: safeLabel,           // must be a string
      config: formConfig,         // object
      language: "en",
      promptHistory,              // carry your edit history
    };

    try {
      const resp = await apiRequest<{ id: number }>({
        url: "/api/publish",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (resp.id) {
        setFormId(resp.id);       // now we have an ID, next save becomes an update
        toast({ title: "Saved!", description: "Your edits have been persisted." });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Save failed",
        description: "See console for details.",
        variant: "destructive",
      });
    }
  };

  const handleTestForm = async () => {
    if (!formConfig) {
      toast({ title: "Error", description: "No form to test", variant: "destructive" });
      return;
    }

    setTestMode(!testMode);
    if (formId) {
      await resetServerConfig();  // reload last-saved version
    }
    resetResponses();
    toast({ title: "Reverted", description: "Back to the last-saved form state" });
  };

  const handlePublishForm = async () => {
    if (!formConfig) {
      toast({ title: "Error", description: "No form to publish", variant: "destructive" });
      return;
    }

    try {
      const safeLabel = formConfig.steps?.[0]?.title?.trim() || "Form";
      const currentTheme = localStorage.getItem("theme-preset") || "modern";
      const configWithTheme = { ...formConfig, themePreset: currentTheme };

      const payload: Record<string, any> = {
        originalFormId: formId,    // null first time, ID thereafter
        label: safeLabel,
        config: configWithTheme,
        language: "en",
        promptHistory,
      };

      const res = await apiRequest<{ id: number }>({
        url: "/api/publish",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res?.id) {
        setFormId(res.id);         // ensure future calls update
        setPublishModalOpen(true);
        toast({
          title: "Form Published",
          description: "Your form is now live and can be embedded!",
        });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Publish failed", variant: "destructive" });
    }
  };

  return (
    <div className="w-full md:flex-1 h-full flex flex-col bg-gray-100 p-2 md:p-4">
      {/* 16:9 preview */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-7xl aspect-[16/9] bg-white rounded-xl shadow-lg overflow-hidden relative">
          <FormRenderer testMode={testMode} />
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-7xl mx-auto mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 px-3 py-1 rounded"
            onClick={() => { resetResponses(); toast({ title: "Reset", description: "Cleared your answers" }); }}
          >
            <RefreshCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>

          <Button
            variant="ghost"
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 px-3 py-1 rounded"
            onClick={handleSaveForm}
            disabled={!formConfig}
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
        </div>

        <div className="flex space-x-2">

          <Button
            variant="outline"
            className="flex items-center text-sm text-primary hover:text-primary-dark px-3 py-1 rounded border border-primary"
            onClick={handlePublishForm}
            disabled={!formConfig}
          >
            <Send className="mr-1 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Publish Modal */}
      {publishModalOpen && formId != null && (
        <PublishModal
          open={publishModalOpen}
          onOpenChange={setPublishModalOpen}
          formId={formId}
        />
      )}
    </div>
  );
}
