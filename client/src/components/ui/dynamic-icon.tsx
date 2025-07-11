import { lazy, Suspense } from "react";
import { LucideProps } from "lucide-react";
import { Circle } from "lucide-react";

// Cache for loaded icons to prevent re-importing
const iconCache = new Map<string, React.ComponentType<LucideProps>>();

interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: string;
}

// Helper to dynamically import Lucide icons
const loadIcon = async (name: string): Promise<React.ComponentType<LucideProps>> => {
  try {
    // Check cache first
    if (iconCache.has(name)) {
      return iconCache.get(name)!;
    }

    // Dynamic import from lucide-react
    const iconModule = await import('lucide-react');
    const IconComponent = iconModule[name as keyof typeof iconModule] as React.ComponentType<LucideProps>;
    
    if (IconComponent) {
      iconCache.set(name, IconComponent);
      return IconComponent;
    } else {
      console.warn(`Icon "${name}" not found in lucide-react, using fallback`);
      return Circle;
    }
  } catch (error) {
    console.error(`Failed to load icon "${name}":`, error);
    return Circle;
  }
};

// Create a lazy component for the icon
const createLazyIcon = (name: string) => lazy(async () => {
  const IconComponent = await loadIcon(name);
  return { default: IconComponent };
});

export function DynamicIcon({ name, fallback = "Circle", className, ...props }: DynamicIconProps) {
  // Create the lazy icon component
  const LazyIcon = createLazyIcon(name);
  
  return (
    <Suspense fallback={<Circle className={className} {...props} />}>
      <LazyIcon className={className} {...props} />
    </Suspense>
  );
}