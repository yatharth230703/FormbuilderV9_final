// ABOUTME: Color picker component for form theme customization
// ABOUTME: Provides a simple interface for selecting hex colors with preview

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#64748b", // slate
  "#6b7280", // gray
  "#71717a", // zinc
];

export function ColorPicker({ value, onChange, className, disabled }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setInputValue(color);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate and apply color if it's a valid hex
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    // If input is invalid, revert to the current value
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputValue)) {
      setInputValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue(value);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Color Preview Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="h-8 w-8 p-0 border-2 border-gray-300 hover:border-gray-400"
          >
            <div
              className="h-full w-full rounded-sm"
              style={{ backgroundColor: value }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Preset Colors Grid */}
            <div className="grid grid-cols-10 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={cn(
                    "h-6 w-6 rounded-sm border-2 hover:scale-110 transition-transform",
                    value === color ? "border-gray-800" : "border-gray-300"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            
            {/* Custom Color Input */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Custom:</span>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                placeholder="#000000"
                className="h-8 text-xs font-mono"
                maxLength={7}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Color Value Display */}
      <span className="text-xs font-mono text-gray-600 min-w-[60px]">
        {value.toUpperCase()}
      </span>
    </div>
  );
}
