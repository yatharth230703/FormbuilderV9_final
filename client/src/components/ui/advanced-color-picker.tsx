// ABOUTME: Advanced color picker component with gradient selector and sliders
// ABOUTME: Provides a rich interface for selecting colors with HSL controls

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Share } from "lucide-react";

interface AdvancedColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

// Convert hex to HSL
const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

// Convert HSL to hex
const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export function AdvancedColorPicker({ value, onChange, className, disabled }: AdvancedColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [hsl, setHsl] = useState(hexToHSL(value));
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const saturationRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Update input value and HSL when prop value changes
  useEffect(() => {
    setInputValue(value);
    setHsl(hexToHSL(value));
  }, [value]);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate and apply color if it's a valid hex
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newValue)) {
      onChange(newValue);
      setHsl(hexToHSL(newValue));
    }
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value);
    const newHsl = { ...hsl, h: newHue };
    setHsl(newHsl);
    const newHex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setInputValue(newHex);
    onChange(newHex);
  };

  const handleSaturationLightnessChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!saturationRef.current) return;
    
    const rect = saturationRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    const newS = Math.round(x * 100);
    const newL = Math.round((1 - y) * 100);
    
    const newHsl = { ...hsl, s: newS, l: newL };
    setHsl(newHsl);
    
    const newHex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setInputValue(newHex);
    onChange(newHex);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    handleSaturationLightnessChange(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
        handleSaturationLightnessChange(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
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
        <PopoverContent className="w-80 p-3" align="start">
          <div className="space-y-4" ref={colorPickerRef}>
            <div className="text-sm font-medium pb-1 flex items-center justify-between">
              <span>Color picker</span>
              <Share className="h-4 w-4 text-gray-400" />
            </div>
            
            {/* Color gradient picker */}
            <div 
              ref={saturationRef}
              className="w-full h-40 rounded-md relative cursor-crosshair"
              style={{
                backgroundColor: `hsl(${hsl.h}, 100%, 50%)`,
                backgroundImage: 'linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)'
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Color selection indicator */}
              <div 
                className="absolute w-4 h-4 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${hsl.s}%`, 
                  top: `${100 - hsl.l}%`,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.3)'
                }}
              />
            </div>
            
            {/* Hue slider */}
            <div className="space-y-1">
              <input 
                type="range"
                min="0"
                max="360"
                value={hsl.h}
                onChange={handleHueChange}
                className="w-full h-4 appearance-none rounded-md cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
                  WebkitAppearance: 'none'
                }}
              />
            </div>
            
            {/* Color values display */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="space-y-1">
                <div className="text-gray-500">HEX</div>
                <Input
                  value={inputValue}
                  onChange={handleHexInputChange}
                  className="h-6 text-xs font-mono"
                  maxLength={7}
                />
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">HSL</div>
                <div className="text-xs">
                  {hsl.h}°, {hsl.s}%, {hsl.l}%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">RGB</div>
                <div className="text-xs">
                  {parseInt(inputValue.substring(1, 3), 16)}, {parseInt(inputValue.substring(3, 5), 16)}, {parseInt(inputValue.substring(5, 7), 16)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">CMYK</div>
                <div className="text-xs">
                  {/* Simplified CMYK calculation */}
                  {Math.round((1 - parseInt(inputValue.substring(1, 3), 16) / 255) * 100)}%, 
                  {Math.round((1 - parseInt(inputValue.substring(3, 5), 16) / 255) * 100)}%, 
                  {Math.round((1 - parseInt(inputValue.substring(5, 7), 16) / 255) * 100)}%
                </div>
              </div>
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

