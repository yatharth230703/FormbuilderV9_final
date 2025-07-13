import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: number;
}

interface FormProperties {
  language: string;
  label: string;
  domain: string;
  url?: string;
}

export default function PublishModal({ open, onOpenChange, formId }: PublishModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formProperties, setFormProperties] = useState<FormProperties | null>(null);
  const embedCodeRef = useRef<HTMLDivElement>(null);
  
  // Get the full domain from window.location
  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Fetch form properties when modal opens
  useEffect(() => {
    if (open && formId) {
      fetchFormProperties();
    }
  }, [open, formId]);
  
  const fetchFormProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/forms/${formId}`);
      const data = await response.json();
      
      if (response.ok) {
        setFormProperties({
          language: data.language || 'en',
          label: data.label || '',
          domain: data.domain || '',
          url: data.url
        });
      }
    } catch (error) {
      console.error('Error fetching form properties:', error);
      toast({
        title: "Error",
        description: "Failed to load form properties",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Generate URLs based on form properties
  const directLink = formProperties
    ? `${domain}/embed?language=${formProperties.language}&label=${encodeURIComponent(formProperties.label)}&domain=${encodeURIComponent(formProperties.domain)}`
    : `${domain}/embed?form=${formId}`;
  
  // Iframe embed code
  const iframeEmbedCode = `<iframe
  src="${directLink}"
  width="100%"
  height="100%" 
  style="border:none;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"
  title="Embedded Form"
></iframe>`;
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(iframeEmbedCode);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Embed code has been copied to your clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(directLink);
    toast({
      title: "Copied to clipboard",
      description: "Direct link has been copied to your clipboard",
    });
  };
  
  const handleOpenPreview = () => {
    window.open(directLink, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Publish Form</DialogTitle>
          <DialogDescription>
            Your form is ready to be embedded on your website or shared directly.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="embed" className="mt-4">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="embed">Embed Code</TabsTrigger>
              <TabsTrigger value="link">Direct Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="embed" className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Code className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Embed Code</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCopyCode} className="h-8">
                    {copied ? (
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                
                <div 
                  ref={embedCodeRef}
                  className="text-xs font-mono bg-gray-800 text-gray-200 p-3 rounded overflow-auto max-h-[200px]"
                >
                  {iframeEmbedCode}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">How to use</h4>
                <ol className="text-sm text-gray-600 list-decimal pl-4 space-y-1">
                  <li>Copy the embed code above</li>
                  <li>Paste it into your website's HTML where you want the form to appear</li>
                  <li>The form will automatically adapt to the width of its container</li>
                </ol>
              </div>
            </TabsContent>
            
            <TabsContent value="link" className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Direct Form Link</span>
                  <Button variant="ghost" size="sm" onClick={handleCopyLink} className="h-8">
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                
                <div className="text-xs font-mono bg-gray-800 text-gray-200 p-3 rounded overflow-auto">
                  {directLink}
                </div>
              </div>
              
              {formProperties && (
                <div className="bg-blue-50 p-3 rounded-md text-sm">
                  <p className="font-medium text-blue-900 mb-1">Form Properties:</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>Language: <span className="font-mono">{formProperties.language}</span></li>
                    <li>Label: <span className="font-mono">{formProperties.label}</span></li>
                    <li>Domain: <span className="font-mono">{formProperties.domain}</span></li>
                  </ul>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={handleOpenPreview} className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Preview
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}