import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { TilesStep as TilesStepType } from "@shared/types";
import { useIcons } from "@/hooks/use-icons";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

interface TilesStepProps {
  step: TilesStepType;
}

// Helper: compute text class based on length + mobile
const getTileTextClass = (text: string, isMobile: boolean) => {
  if (isMobile) return "text-base";
  if (text.length > 40) return "text-sm";
  if (text.length > 30) return "text-base";
  if (text.length > 20) return "text-lg";
  return "text-xl";
};

// Helper: insert soft-hyphens for better wrapping
const formatTileText = (text: string) => {
  return text
    .split(" ")
    .map((word) => {
      // camelCase → camel­Case
      word = word.replace(/([a-z])([A-Z])/g, "$1\u00AD$2");
      // hyphenated words → break at hyphen
      word = word.replace(/([a-zA-Z])-([a-zA-Z])/g, "$1\u00AD$2");

      // Long word syllable-ish breaks
      if (word.length > 5) {
        const syllablePattern = /[^aeiou][aeiou][^aeiou]/gi;
        let lastIndex = 0;
        let result = "";
        let match;
        while ((match = syllablePattern.exec(word)) !== null) {
          const end = match.index + 2;
          if (end > lastIndex) {
            result += word.substring(lastIndex, end) + "\u00AD";
            lastIndex = end;
          }
        }
        result += word.substring(lastIndex);
        word = result || word;

        // Fallback: break every 5 chars if still no soft hyphen
        if (!word.includes("\u00AD")) {
          word = word.replace(/(.{5})/g, "$1\u00AD");
        }
      }
      return word;
    })
    .join(" ");
};

export default function TilesStep({ step }: TilesStepProps) {
  const { updateResponse, formResponses, currentStep, nextStep, isMobile } = useFormContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // fetch one icon per option title
  const icons = useIcons(step.options.map((o) => o.title));
  

  useEffect(() => {
    const saved = formResponses[step.title];
    if (saved) {
      setSelectedOption(saved);
    } else {
      // If no saved response, use preselected/selected from backend
      const preselected = step.options.find(opt => opt.preselected || opt.selected);
      setSelectedOption(preselected ? preselected.id : null);
      if (preselected) {
        updateResponse(step.title, preselected.id);
      }
    }
  }, [formResponses, step.title, currentStep, step.options, updateResponse]);

  const handleSelect = (id: string) => {
    setSelectedOption(id);
    updateResponse(step.title, id);
  };

  // Force exactly 4 options - responsive grid: 2x2 on mobile, 1x4 on larger screens
  const gridClasses = "grid-cols-2 md:grid-cols-4";

  const iconSize = isMobile ? 32 : 48;

  return (
    <div className="h-full flex flex-col items-center justify-start pt-6 sm:pt-10 w-full px-4">
      <h3 className="text-2xl font-bold mb-2 text-center">{step.title}</h3>
      <p className="text-gray-500 mb-4 text-center text-sm">{step.subtitle}</p>

      <div className={`grid ${gridClasses} gap-6 max-w-7xl mx-auto mt-6 w-full px-2`}>
        {step.options.slice(0, 4).map((option, idx) => {
          const iconName = option.icon ?? icons[idx] ?? "Circle";
          const isActive = selectedOption === option.id;

          return (
            <div
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`border rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center gap-y-2 cursor-pointer transition-all duration-200 ease-in-out h-64 w-full min-w-0 ${
                isActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
              }`}
            >
              <div>
                <DynamicIcon 
                  name={iconName} 
                  size={iconSize} 
                  className={`${isActive ? "text-primary" : "text-gray-600"} transition-colors`} 
                />
              </div>
              <div className={`font-semibold hyphens-auto ${getTileTextClass(option.title, isMobile)} leading-tight`}>                
                {formatTileText(option.title)}
              </div>
              <div className="text-sm text-muted-foreground hyphens-auto leading-snug">
                {formatTileText(option.description || "")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
