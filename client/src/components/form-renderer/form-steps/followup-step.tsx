import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { FollowupStep as FollowupStepType } from "@shared/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconDisplay } from "@/components/ui/icon-display";

interface FollowupStepProps {
  step: FollowupStepType;
}

export default function FollowupStep({ step }: FollowupStepProps) {
  const { updateResponse, formResponses } = useFormContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [followupValue, setFollowupValue] = useState<string>('');

  // Get the current response for this step if it exists
  useEffect(() => {
    const savedResponse = formResponses[step.title];
    if (savedResponse && typeof savedResponse === 'object') {
      if ('option' in savedResponse && 'followup' in savedResponse) {
        setSelectedOption(savedResponse.option);
        setFollowupValue(savedResponse.followup);
      }
    }
  }, [formResponses, step.title]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
    updateResponse(step.title, { 
      option: optionId, 
      followup: followupValue 
    });
  };

  const handleFollowupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFollowupValue(newValue);

    if (selectedOption) {
      updateResponse(step.title, {
        option: selectedOption,
        followup: newValue
      });
    }
  };

  // Get icon mode from context
  const { iconMode } = useFormContext();

  return (
    <div className="flex-1 flex flex-col pt-6 sm:pt-10 pb-2 max-h-[90vh] max-w-full overflow-y-auto overflow-x-hidden px-4 hide-scrollbar">
      <h3 className="text-2xl font-bold mb-2 text-center">{step.title}</h3>
      <p className="text-gray-500 mb-8 text-center">{step.subtitle}</p>

      <div className="grid grid-cols-2 gap-4 mb-6 mt-6">
        {step.options && step.options.length > 0 ? step.options.map((option) => (
          <div 
            key={option.id}
            className={`border ${selectedOption === option.id ? 'border-primary bg-primary/5' : 'border-gray-200'} rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-gray-50 transition-all flex flex-col items-center text-center gap-2`}
            onClick={() => handleSelectOption(option.id)}
          >
            <div className="bg-primary bg-opacity-10 rounded-full p-3 text-primary flex items-center justify-center">
              <IconDisplay 
                iconName={option.icon}
                emoji={option.emoji}
                size={20}
                className="text-primary"
              />
            </div>
            <h4 className="font-medium text-lg">{option.title}</h4>
            <p className="text-xs text-gray-500">{option.description}</p>
          </div>
        )) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No options available for this step.
          </div>
        )}
      </div>

      {selectedOption && (
        <div className="mt-4 mb-4">
          <Label htmlFor="followup-input" className="block mb-2">
            {step.followupInput.label}
          </Label>
          <Input
            id="followup-input"
            type={step.followupInput.type}
            placeholder={step.followupInput.placeholder}
            min={step.followupInput.type === 'number' ? step.followupInput.min : undefined}
            max={step.followupInput.type === 'number' ? step.followupInput.max : undefined}
            value={followupValue}
            onChange={handleFollowupChange}
            className="w-full p-3 border border-gray-200 rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
