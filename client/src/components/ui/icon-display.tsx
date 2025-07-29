import React, { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { DynamicIcon } from "./dynamic-icon";
import { LucideProps } from "lucide-react";

interface IconDisplayProps {
  iconName: string;
  emoji?: string;
  size?: number;
  className?: string;
}

export function IconDisplay({ 
  iconName, 
  emoji, 
  size = 24, 
  className = "" 
}: IconDisplayProps) {
  const { iconMode } = useFormContext();
  const [fallbackEmoji, setFallbackEmoji] = useState<string | null>(null);

  // Generate fallback emoji if none is provided and we're in emoji mode
  useEffect(() => {
    if (iconMode === 'emoji' && !emoji && !fallbackEmoji) {
      // Simple fallback emoji mapping based on icon name
      const emojiMap: Record<string, string> = {
        'Home': '🏠',
        'User': '👤',
        'Mail': '📧',
        'Phone': '📞',
        'MapPin': '📍',
        'Calendar': '📅',
        'Clock': '⏰',
        'Heart': '❤️',
        'Star': '⭐',
        'ThumbsUp': '👍',
        'MessageSquare': '💬',
        'CheckCircle': '✅',
        'XCircle': '❌',
        'AlertTriangle': '⚠️',
        'Info': 'ℹ️',
        'Settings': '⚙️',
        'Search': '🔍',
        'Filter': '🔧',
        'Plus': '➕',
        'Minus': '➖',
        'Edit': '✏️',
        'Trash2': '🗑️',
        'Download': '⬇️',
        'Upload': '⬆️',
        'Share': '📤',
        'Copy': '📋',
        'Link': '🔗',
        'External-link': '🔗',
        'ArrowRight': '➡️',
        'ArrowLeft': '⬅️',
        'ChevronDown': '⬇️',
        'ChevronUp': '⬆️',
        'Menu': '☰',
        'X': '✖️',
        'Eye': '👁️',
        'EyeOff': '🙈',
        'Lock': '🔒',
        'Unlock': '🔓',
        'Shield': '🛡️',
        'Key': '🔑',
        'CreditCard': '💳',
        'DollarSign': '💰',
        'ShoppingCart': '🛒',
        'ShoppingBag': '🛍️',
        'Gift': '🎁',
        'Package': '📦',
        'Truck': '🚚',
        'Plane': '✈️',
        'Car': '🚗',
        'Bike': '🚲',
        'Train': '🚆',
        'Globe': '🌍',
        'Wifi': '📶',
        'Bluetooth': '📡',
        'Battery': '🔋',
        'Volume2': '🔊',
        'VolumeX': '🔇',
        'Camera': '📷',
        'Image': '🖼️',
        'Video': '🎥',
        'Music': '🎵',
        'Headphones': '🎧',
        'Mic': '🎤',
        'Speaker': '🔊',
        'Monitor': '🖥️',
        'Smartphone': '📱',
        'Tablet': '📱',
        'Laptop': '💻',
        'Printer': '🖨️',
        'HardDrive': '💾',
        'Folder': '📁',
        'File': '📄',
        'FileText': '📝',
        'Book': '📚',
        'Bookmark': '🔖',
        'Library': '📚',
        'GraduationCap': '🎓',
        'Users': '👥',
        'UserPlus': '👤➕',
        'Crown': '👑',
        'Award': '🏆',
        'Medal': '🥇',
        'Trophy': '🏆',
        'Target': '🎯',
        'Flag': '🏁',
        'Zap': '⚡',
        'Sun': '☀️',
        'Moon': '🌙',
        'Cloud': '☁️',
        'CloudRain': '🌧️',
        'Snowflake': '❄️',
        'Thermometer': '🌡️',
        'Droplets': '💧',
        'Wind': '💨',
        'Mountain': '⛰️',
        'Tree': '🌳',
        'Flower': '🌸',
        'Leaf': '🍃',
        'Apple': '🍎',
        'Coffee': '☕',
        'Pizza': '🍕',
        'Utensils': '🍴',
        'ChefHat': '👨‍🍳',
        'Wine': '🍷',
        'Beer': '🍺',
        'IceCream': '🍦',
        'Candy': '🍬',
        'Cake': '🎂',
        'Restaurant': '🍽️',
        'Store': '🏪',
        'Building': '🏢',
        'Factory': '🏭',
        'Hospital': '🏥',
        'School': '🏫',
        'Church': '⛪',
        'Bank': '🏦',
        'Hotel': '🏨',
        'Gamepad2': '🎮',
        'Dices': '🎲',
        'Puzzle': '🧩',
        'Paintbrush': '🖌️',
        'Palette': '🎨',
        'Brush': '🖌️',
        'Scissors': '✂️',
        'Ruler': '📏',
        'Calculator': '🧮',
        'Briefcase': '💼',
        'Hammer': '🔨',
        'Wrench': '🔧',
        'Screwdriver': '🪛',
        'Drill': '🔧',
        'Saw': '🪚',
        'HardHat': '⛑️',
        'Stethoscope': '🩺',
        'Pill': '💊',
        'Syringe': '💉',
        'Bandage': '🩹',
        'FirstAid': '🏥',
        'Accessibility': '♿',
        'Baby': '👶',
        'Dog': '🐕',
        'Cat': '🐱',
        'Fish': '🐟',
        'Bird': '🐦',
        'Bug': '🐛',
        'Butterfly': '🦋',
        'Rabbit': '🐰',
        'Turtle': '🐢',
        'Circle': '⭕',
        'Square': '⬜',
        'Triangle': '🔺',
        'CheckCircle': '✅',
        'HelpCircle': '❓',
        'Laptop': '💻',
        'Smartphone': '📱',
        'Palette': '🎨',
        'TrendingUp': '📈',
        'Globe': '🌍',
        'HelpCircle': '❓',
        'LifeBuoy': '🛟',
        'ShoppingCart': '🛒',
        'FileText': '📝',
        'BarChart': '📊'
      };

      const fallback = emojiMap[iconName] || '❓';
      setFallbackEmoji(fallback);
    }
  }, [iconMode, emoji, fallbackEmoji, iconName]);

  switch (iconMode) {
    case 'lucide':
      return (
        <DynamicIcon 
          name={iconName} 
          size={size} 
          className={className} 
        />
      );
    case 'emoji':
      const emojiToShow = emoji || fallbackEmoji;
      return emojiToShow ? (
        <span 
          className={className}
          style={{ fontSize: `${size}px` }}
        >
          {emojiToShow}
        </span>
      ) : null;
    case 'none':
      return null;
    default:
      return (
        <DynamicIcon 
          name={iconName} 
          size={size} 
          className={className} 
        />
      );
  }
} 