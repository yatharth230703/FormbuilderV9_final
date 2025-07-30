"use client"

/**
 * SearchableSelect Component
 * 
 * A searchable dropdown component that extends the base Select component with search functionality.
 * Users can type to filter options, making it easier to find specific items in large lists.
 * 
 * Usage:
 * ```tsx
 * <SearchableSelect value={value} onValueChange={setValue}>
 *   <SearchableSelectTrigger>
 *     <SearchableSelectValue />
 *   </SearchableSelectTrigger>
 *   <SearchableSelectContent
 *     searchPlaceholder="Search options..."
 *     onSearchChange={setSearchTerm}
 *     searchValue={searchTerm}
 *   >
 *     {filteredOptions.map(option => (
 *       <SearchableSelectItem key={option.value} value={option.value}>
 *         {option.label}
 *       </SearchableSelectItem>
 *     ))}
 *   </SearchableSelectContent>
 * </SearchableSelect>
 * ```
 */

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

const SearchableSelect = SelectPrimitive.Root

const SearchableSelectGroup = SelectPrimitive.Group

const SearchableSelectValue = SelectPrimitive.Value

const SearchableSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SearchableSelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SearchableSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SearchableSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SearchableSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SearchableSelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

interface SearchableSelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

const SearchableSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SearchableSelectContentProps
>(({ className, children, position = "popper", searchPlaceholder = "Search...", onSearchChange, searchValue = "", ...props }, ref) => {
  const [searchInput, setSearchInput] = React.useState(searchValue);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    onSearchChange?.(value);
  };

  React.useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SearchableSelectScrollUpButton />
        
        {/* Search Input */}
        <div className="p-2 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="pl-8 h-8 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <SelectPrimitive.Viewport
          className={cn(
            "p-1 max-h-[200px] overflow-y-auto",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SearchableSelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SearchableSelectContent.displayName = SelectPrimitive.Content.displayName

const SearchableSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SearchableSelectLabel.displayName = SelectPrimitive.Label.displayName

const SearchableSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SearchableSelectItem.displayName = SelectPrimitive.Item.displayName

const SearchableSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SearchableSelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  SearchableSelect,
  SearchableSelectGroup,
  SearchableSelectValue,
  SearchableSelectTrigger,
  SearchableSelectContent,
  SearchableSelectLabel,
  SearchableSelectItem,
  SearchableSelectSeparator,
  SearchableSelectScrollUpButton,
  SearchableSelectScrollDownButton,
} 