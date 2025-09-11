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
    } else if (step.options.length > 0) {
      // Pre-enable the topmost option
      const firstOption = step.options[0].id;
      setSelectedOption(firstOption);
      updateResponse(step.title, firstOption);
    }
  }, [formResponses, step.title, currentStep, step.options, updateResponse]);

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    updateResponse(step.title, value);
  };

  // Handle empty options gracefully
  if (!step.options || step.options.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
        <h3 className="text-2xl font-bold mb-2 text-center">{step.title}</h3>
        <p className="text-gray-500 mb-4 text-center text-sm">{step.subtitle}</p>
        <div className="text-center text-gray-500">
          <p>This step has no options configured.</p>
          <p className="text-sm mt-2">Please contact the form administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-2 text-center">{step.title}</h3>
      <p className="text-gray-500 mb-6 text-center">{step.subtitle}</p>

      <div className="w-full max-w-md mx-auto">
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