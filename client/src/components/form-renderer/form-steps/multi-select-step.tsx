import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { MultiSelectStep as MultiSelectStepType } from "@shared/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useIcons } from "@/hooks/use-icons";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

interface MultiSelectStepProps {
  step: MultiSelectStepType;
}

export default function MultiSelectStep({ step }: MultiSelectStepProps) {
  const { updateResponse, formResponses, currentStep } = useFormContext();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // fetch one icon per option title
  const icons = useIcons(step.options.map((o) => o.title));

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

  return (
    <div className="flex-1 flex flex-col py-2 sm:py-2 max-h-[90vh] max-w-full overflow-y-auto overflow-x-hidden px-4 hide-scrollbar">
      <h3 className="text-2xl font-bold mb-1 text-center">{step.title}</h3>
      <p className="text-gray-500 mb-1 text-center">{step.subtitle}</p>
      <p className="text-sm text-gray-400 mb-3">Select all that apply</p>

      <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
        {step.options.map((option, idx) => {
          const isActive = selectedOptions.includes(option.id);
          const iconName = option.icon ?? icons[idx] ?? "Circle";

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
                  <DynamicIcon 
                    name={iconName} 
                    size={32} 
                    className={`${isActive ? "text-primary" : "text-gray-600"} transition-colors`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-lg">{option.title}</h4>
                    <Checkbox
                      checked={isActive}
                      onCheckedChange={() => handleToggle(option.id)}
                      className="h-5 w-5 border-gray-300"
                    />
                  </div>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
