/*The code is modified to use form context within the MultiSelectStep component in the embed-form-steps directory, aligning its data handling with the regular form steps.
```

```replit_final_file
*/
import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { MultiSelectStep as MultiSelectStepType } from "@shared/types";
import { IconDisplay } from "@/components/ui/icon-display";

interface MultiSelectStepProps {
  step: MultiSelectStepType;
}

export default function MultiSelectStep({ step }: MultiSelectStepProps) {
  const { updateResponse, formResponses, currentStep, isMobile } = useFormContext();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Icons are now stored in the form configuration

  useEffect(() => {
    const saved = formResponses[step.title];
    setSelectedOptions(Array.isArray(saved) ? saved : []);
  }, [formResponses, step.title, currentStep]);

  const handleToggle = (id: string) => {
    const next = selectedOptions.includes(id)
      ? selectedOptions.filter((x) => x !== id)
      : [...selectedOptions, id];
    setSelectedOptions(next);
    updateResponse(step.title, next);
  };

  const getTileTextClass = (text: string, isMobile: boolean) => {
    if (isMobile) return "text-base";
    if (text.length > 40) return "text-sm";
    if (text.length > 30) return "text-base";
    if (text.length > 20) return "text-lg";
    return "text-xl";
  };

  const formatTileText = (text: string) => {
    return text
      .split(" ")
      .map((word) => {
        word = word.replace(/([a-z])([A-Z])/g, "$1\u00AD$2");
        word = word.replace(/([a-zA-Z])-([a-zA-Z])/g, "$1\u00AD$2");

        if (word.length > 5) {
          const patt = /[^aeiou][aeiou][^aeiou]/gi;
          let last = 0;
          let res = "";
          let m;
          while ((m = patt.exec(word)) !== null) {
            const end = m.index + 2;
            if (end > last) {
              res += word.substring(last, end) + "\u00AD";
              last = end;
            }
          }
          res += word.substring(last);
          word = res || word;
          if (!word.includes("\u00AD")) {
            word = word.replace(/(.{5})/g, "$1\u00AD");
          }
        }
        return word;
      })
      .join(" ");
  };

  return (
    <div className="flex-1 flex flex-col pt-6 sm:pt-10 pb-2 max-w-full no-scrollbar px-4">
      <h3 className="text-2xl font-bold mb-1 text-center">{step.title}</h3>
      <p className="text-gray-500 mb-1 text-center">{step.subtitle}</p>
      
      {/* Extra top margin so the option tiles sit a bit lower */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6 max-w-6xl mx-auto mt-6 w-full`}>
        {step.options.map((option, idx) => {
          const isActive = selectedOptions.includes(option.id);
          const iconName = option.icon || "Circle";

          return (
            <div
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className={`border ${
                isActive ? "border-primary bg-primary/5" : "border-gray-200"
              } rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-gray-50 transition-all`}
            >
              <div className="flex items-start">
                <div className="flex items-center justify-center rounded-full p-2 mr-3">
                  <IconDisplay 
                    iconName={iconName}
                    emoji={option.emoji}
                    size={32} 
                    className={isActive ? "text-primary" : "text-gray-400"} 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className={`font-medium hyphens-auto ${getTileTextClass(option.title, isMobile)}`}>{formatTileText(option.title)}</h4>
                  </div>
                  <p className="text-xs text-gray-500 hyphens-auto">{formatTileText(option.description || '')}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}