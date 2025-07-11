
import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import LeftPanel from "@/components/left-panel";
import RightPanel from "@/components/right-panel";
import { FormProvider } from "@/contexts/form-context";
import { getFormConfig } from "@/services/api";

export default function Home() {
    // Pull directly from the browser URL
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const formId = params.get("formId") ?? undefined;
    const initialPrompt = params.get("prompt") ?? undefined;

  useEffect(() => {
    if (formId) {
      // Load the form config when formId is present
      const loadForm = async () => {
        try {
          const formData = await getFormConfig(parseInt(formId));
          // We'll handle this in the form context
          window._initialFormConfig = formData.config;
        } catch (err) {
          console.error("Error loading form:", err);
        }
      };
      loadForm();
    }
  }, [formId]);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">
      <FormProvider>
      <LeftPanel initialPrompt={initialPrompt} />
        <RightPanel />
      </FormProvider>
    </div>
  );
}
