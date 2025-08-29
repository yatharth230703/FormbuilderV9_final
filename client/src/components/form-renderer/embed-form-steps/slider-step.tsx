import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { SliderStep as SliderStepType } from "@shared/types";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Pencil, X, Check } from "lucide-react";

interface SliderStepProps {
  step: SliderStepType;
}

export default function SliderStep({ step }: SliderStepProps) {
  const { updateResponse, formResponses, currentStep } = useFormContext();
  const [value, setValue] = useState<number>(step.defaultValue);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>("");

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

  const handleEditClick = () => {
    setIsEditing(true);
    setEditValue(""); // Start with blank input instead of current value
  };

  const handleEditSubmit = () => {
    const numValue = Number(editValue);
    if (editValue === '') {
      // If empty, revert to current value
      setIsEditing(false);
      setEditValue("");
      return;
    }
    if (!isNaN(numValue) && numValue >= step.min && numValue <= step.max) {
      setValue(numValue);
      updateResponse(step.title, numValue);
      setIsEditing(false);
    } else {
      // Invalid input - revert to current value
      setEditValue(value.toString());
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSubmit();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  // Calculate percentage for visual indicator
  const percentage = ((value - step.min) / (step.max - step.min)) * 100;

  return (
    <div className="flex-1 flex flex-col pt-4 sm:pt-8 pb-2 max-h-[90vh] max-w-full overflow-y-auto overflow-x-hidden px-4 hide-scrollbar">
      <h3 className="text-2xl font-bold mb-2 text-center dark:text-white">{step.title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">{step.subtitle}</p>

      <div className="w-full py-8 px-4">
        {/* Large value display with gradient text and edit icon */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 text-center relative min-h-[80px] sm:min-h-[100px] py-2 sm:py-4 flex items-center justify-center overflow-visible"
        >
          {isEditing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow empty string, numbers, and decimal points
                    if (val === '' || /^[\d.]*$/.test(val)) {
                      // Prevent multiple decimal points
                      const decimalCount = (val.match(/\./g) || []).length;
                      if (decimalCount <= 1) {
                        setEditValue(val);
                      }
                    }
                  }}
                  onKeyDown={handleKeyPress}
                  className="text-5xl font-bold text-primary text-center w-32 border-none outline-none bg-transparent caret-primary"
                  autoFocus
                  placeholder=""
                />
              </div>
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                onClick={handleEditSubmit}
                className="p-1 text-green-500 hover:text-green-600 transition-colors"
                title="Confirm"
              >
                <Check size={16} />
              </motion.button>
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                onClick={handleEditCancel}
                className="p-1 text-red-500 hover:text-red-600 transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <motion.span 
                className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight min-h-[60px] flex items-center"
                key={value}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                style={{ WebkitTextFillColor: 'transparent' }}
              >
                {step.prefix || ''}{value}
              </motion.span>
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                onClick={handleEditClick}
                className="p-1.5 text-gray-400 hover:text-primary transition-colors opacity-60 hover:opacity-100"
                title="Edit value"
              >
                <Pencil size={14} />
              </motion.button>
            </div>
          )}
        </motion.div>

        <div className="relative">
          <div className="flex justify-between mb-2 text-lg text-gray-500 dark:text-gray-400">
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