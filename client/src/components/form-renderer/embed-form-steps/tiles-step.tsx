import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { TilesStep as TilesStepType } from "@shared/types";
import { useIcons } from "@/hooks/use-icons";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

interface TilesStepProps {
  step: TilesStepType;
}

export default function TilesStep({ step }: TilesStepProps) {
  const { updateResponse, formResponses, currentStep, nextStep } = useFormContext();
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
    setTimeout(() => nextStep(), 300);
  };

  // New grid logic for 4 and 6 options
  let gridClasses = "";
  if (step.options.length === 4) {
    gridClasses = "grid-cols-2 grid-rows-2";
  } else if (step.options.length === 6) {
    gridClasses = "grid-cols-3 grid-rows-2";
  } else if (step.options.length === 2) {
    gridClasses = "grid-cols-2 grid-rows-1";
  } else if (step.options.length === 3) {
    gridClasses = "grid-cols-3 grid-rows-1";
  } else {
    gridClasses = "grid-cols-2"; // fallback
  }

  return (
    <div className="flex-1 flex flex-col py-2 sm:py-2 max-h-[90vh] max-w-full overflow-y-auto overflow-x-hidden px-4 hide-scrollbar">
      <h3 className="text-xl font-bold mb-2 text-center">{step.title}</h3>
      <p className="text-gray-500 mb-4 text-center text-sm">{step.subtitle}</p>

      <div className={`grid ${gridClasses} gap-4 max-w-5xl mx-auto`}>
        {step.options.map((option, idx) => {
          const iconName = option.icon || icons[idx] || "Circle";
          const isActive = selectedOption === option.id;

          return (
            <div
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`border rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ease-in-out h-40 w-full ${
                isActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
              }`}
            >
              <div className="mb-4">
                <DynamicIcon 
                  name={iconName} 
                  size={48} 
                  className={isActive ? "text-primary" : "text-gray-400"} 
                />
              </div>
              <div className="text-base font-semibold">{option.title}</div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}