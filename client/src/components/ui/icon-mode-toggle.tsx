import React from "react";
import { Button } from "./button";
import { useFormContext } from "@/contexts/form-context";
import { Smile, Image, EyeOff } from "lucide-react";
import { useParams } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export function IconModeToggle() {
  const { iconMode, setIconMode } = useFormContext();
  const params = useParams();
  const formId = params.id;

  const modes = [
    {
      value: 'lucide' as const,
      label: 'Lucide Icons',
      icon: Image,
      description: 'Use Lucide React icons'
    },
    {
      value: 'emoji' as const,
      label: 'Emojis',
      icon: Smile,
      description: 'Use emoji icons'
    },
    {
      value: 'none' as const,
      label: 'No Icons',
      icon: EyeOff,
      description: 'Hide all icons'
    }
  ];

  const handleModeChange = async (newMode: typeof iconMode) => {
    console.log("🎨 ICON TOGGLE - Mode changed:", { from: iconMode, to: newMode, formId });
    setIconMode(newMode);
    
    // Save the icon mode to the database immediately
    if (formId) {
      try {
        console.log("🔄 ICON TOGGLE - Saving to database...");
        const response = await apiRequest('/api/forms/icon-mode', {
          method: 'PUT',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formId: parseInt(formId),
            iconMode: newMode
          })
        });
        console.log("✅ ICON TOGGLE - Save response:", response);
      } catch (error) {
        console.error('❌ ICON TOGGLE - Failed to save icon mode:', error);
      }
    } else {
      console.log("⚠️ ICON TOGGLE - No formId available");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Icon Mode</label>
      <div className="flex gap-2">
        {modes.map((mode) => {
          const IconComponent = mode.icon;
          const isActive = iconMode === mode.value;
          
          return (
            <Button
              key={mode.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange(mode.value)}
              className="flex items-center gap-2"
              title={mode.description}
            >
              <IconComponent className="h-4 w-4" />
              <span className="hidden sm:inline">{mode.label}</span>
            </Button>
          );
        })}

      </div>
    </div>
  );
} 