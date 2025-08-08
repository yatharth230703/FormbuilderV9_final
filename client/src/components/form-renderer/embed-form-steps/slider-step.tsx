import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { SliderStep as SliderStepType } from "@shared/types";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

interface SliderStepProps {
  step: SliderStepType;
}

export default function SliderStep({ step }: SliderStepProps) {
  const { updateResponse, formResponses, currentStep } = useFormContext();
  const [value, setValue] = useState<number>(step.defaultValue);

  // Get the current response for this step if it exists
  useEffect(() => {
    const savedResponse = formResponses[step.title];
    if (savedResponse !== undefined) {
      setValue(Number(savedResponse));
    } else {
      // Reset to default value if no saved response exists
      setValue(step.defaultValue);
    }
  }, [formResponses, step.title, currentStep, step.defaultValue]);

  const handleSliderChange = (newValue: number[]) => {
    const sliderValue = newValue[0];
    setValue(sliderValue);
    updateResponse(step.title, sliderValue);
  };

  // Calculate percentage for visual indicator
  const percentage = ((value - step.min) / (step.max - step.min)) * 100;

  return (
    <div className="flex-1 flex flex-col pt-6 sm:pt-10 pb-2 max-h-[90vh] max-w-full overflow-y-auto overflow-x-hidden px-4 hide-scrollbar">
      <h3 className="text-2xl font-bold mb-2 text-center dark:text-white">{step.title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">{step.subtitle}</p>

      <div className="w-full py-8 px-4">
        {/* Large value display with gradient text - important for both light and dark mode */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <motion.span 
            className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            key={value}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            style={{ WebkitTextFillColor: 'transparent' }} // Ensure this works in all browsers
          >
            {step.prefix || ''}{value}
          </motion.span>
        </motion.div>

        <div className="relative">
          <div className="flex justify-between mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{step.prefix || ''}{step.min}</span>
            <span>{step.prefix || ''}{step.max}</span>
          </div>

          <Slider
            min={step.min}
            max={step.max}
            step={step.step}
            value={[value]}
            onValueChange={handleSliderChange}
            className="w-full"
          />

          
        </div>
      </div>
    </div>
  );
}