import React from "react";
import { Button } from "./button";
import { useFormContext } from "@/contexts/form-context";
import { Smile, Image, EyeOff } from "lucide-react";

export function IconModeToggle() {
  const { iconMode, setIconMode } = useFormContext();

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

  const handleModeChange = (newMode: typeof iconMode) => {
    setIconMode(newMode);
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