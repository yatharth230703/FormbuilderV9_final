import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Copy, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FormPropertiesDropdownProps {
  formId: number;
  currentLabel: string;
  currentLanguage?: string;
  currentDomain?: string;
  onUpdate?: () => void;
}

export function FormPropertiesDropdown({
  formId,
  currentLabel,
  currentLanguage = "en",
  currentDomain = "",
  onUpdate,
}: FormPropertiesDropdownProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [language, setLanguage] = useState(currentLanguage);
  const [label, setLabel] = useState(currentLabel);
  const [domain, setDomain] = useState(currentDomain);
  const [embedUrl, setEmbedUrl] = useState("");

  // Generate embed URL
  useEffect(() => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/embed?language=${language}&label=${encodeURIComponent(label)}&domain=${encodeURIComponent(domain)}`;
    setEmbedUrl(url);
  }, [language, label, domain]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/forms/${formId}/properties`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          label,
          domain,
          url: embedUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update form properties");
      }

      toast({
        title: "Success",
        description: "Form properties updated successfully",
      });

      setIsEditDialogOpen(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyEmbedUrl = () => {
    navigator.clipboard.writeText(embedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Embed URL copied to clipboard",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Form Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            Edit Properties
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyEmbedUrl}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Embed URL
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Form Properties</DialogTitle>
            <DialogDescription>
              Configure language, label, and domain for your form. The combination must be unique.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="de">DE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter form label"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain identifier"
              />
            </div>
            <div className="grid gap-2">
              <Label>Embed URL</Label>
              <div className="flex gap-2">
                <Input
                  value={embedUrl}
                  readOnly
                  className="flex-1 bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyEmbedUrl}
                >
                  {isCopied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 