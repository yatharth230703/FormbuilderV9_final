import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { DropdownStep as DropdownStepType } from "@shared/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DropdownStepProps {
  step: DropdownStepType;
}

export default function DropdownStep({ step }: DropdownStepProps) {
  const { updateResponse, formResponses, currentStep } = useFormContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const saved = formResponses[step.title];
    if (saved) {
      setSelectedOption(saved);
    }
  }, [formResponses, step.title, currentStep]);

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    updateResponse(step.title, value);
  };

  return (
    <div className="h-full flex flex-col items-center justify-start pt-6 sm:pt-10 w-full px-4">
      <h3 className="text-2xl font-bold mb-2 text-center">{step.title}</h3>
      <p className="text-gray-500 mb-4 text-center text-sm">{step.subtitle}</p>

      <div className="w-full max-w-md mx-auto mt-6">
        <Select value={selectedOption || ""} onValueChange={handleSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={step.placeholder || "Select"} />
          </SelectTrigger>
          <SelectContent>
            {step.options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 