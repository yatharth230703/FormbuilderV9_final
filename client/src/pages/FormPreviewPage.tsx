import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserNav } from '@/components/auth/UserNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface FormConfig {
  theme: {
    colors: {
      text: {
        dark: string;
        light: string;
        muted?: string;
      };
      primary: string;
      background?: {
        light: string;
        white: string;
      };
    };
  };
  steps?: Array<{
    type: string;
    title: string;
    subtitle: string;
    [key: string]: any;
  }>;
  // Support for double-wrapped config structure
  config?: FormConfig;
  [key: string]: any;
}

export function FormPreviewPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const params = useParams();
  const formId = params.id;
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<{
    id: number;
    label: string;
    config: FormConfig;
    created_at: string;
    domain: string | null;
    user_uuid: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Create embed URL with proper form ID parameter
  const previewUrl = formData ? 
    `${window.location.origin}/embed?form=${formData.id}` : '';

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        
        if (!formId) {
          setError('No form ID provided');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`/api/forms/${formId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch form: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data || data.error) {
          throw new Error(data.error || 'Form not found');
        }
        
        setFormData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching form:', err);
        setError(err instanceof Error ? err.message : 'Failed to load form. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user && formId) {
      fetchForm();
    } else if (user && !formId) {
      setLoading(false);
      setError('No form ID provided');
    }
  }, [user, formId]);
  
  // Handle iframe height messages
  useEffect(() => {
    // Function to handle messages from the iframe
    const handleIframeMessage = (event: MessageEvent) => {
      // Check if it's a height update message
      if (event.data && (event.data.type === 'form-resize' || event.data.type === 'heightUpdate')) {
        const iframe = document.getElementById('formPreviewIframe') as HTMLIFrameElement;
        if (iframe) {
          // Add a small buffer (10px) to prevent scrollbars
          const height = Math.max(600, event.data.height + 10);
          console.log('Resizing preview iframe to height:', height);
          iframe.style.height = `${height}px`;
        }
      }
    };
    
    // Add event listener
    window.addEventListener('message', handleIframeMessage);
    
    // Clean up
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewUrl)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link copied",
          description: "Form link copied to clipboard",
        });
        
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: "Copy failed",
          description: "Failed to copy link to clipboard",
          variant: "destructive",
        });
      });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/dashboard')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold">Form Preview</h1>
            </div>
            <UserNav />
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : !formData ? (
            <Card>
              <CardHeader>
                <CardTitle>Form Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  The form you're looking for could not be found.
                </p>
                <Button onClick={() => setLocation('/dashboard')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Form Link</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="preview-url">Share this link to allow users to fill out your form</Label>
                      <div className="flex">
                        <Input 
                          id="preview-url" 
                          value={previewUrl} 
                          readOnly 
                          className="flex-1 rounded-r-none"
                        />
                        <Button 
                          onClick={copyToClipboard} 
                          className="rounded-l-none"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(previewUrl, '_blank')}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Form Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="font-semibold">Form Title</Label>
                      <p>{formData.label}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Created</Label>
                      <p>{new Date(formData.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Number of Steps</Label>
                      <p>{formData.config.config ? (formData.config.config.steps?.length || 0) : (formData.config.steps?.length || 0)}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Form ID</Label>
                      <p>{formData.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
        
        {/* Preview iframe */}
        {formData && (
          <div className="container mx-auto px-4 py-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  src={previewUrl}
                  className="w-full border-0"
                  style={{ height: '600px', transition: 'height 0.3s ease' }}
                  title={`Preview of ${formData.label}`}
                  sandbox="allow-scripts allow-forms allow-same-origin"
                  id="formPreviewIframe"
                  onLoad={() => {
                    // Request height update when iframe loads
                    const iframe = document.getElementById('formPreviewIframe') as HTMLIFrameElement;
                    if (iframe && iframe.contentWindow) {
                      setTimeout(() => {
                        iframe.contentWindow?.postMessage({ type: 'requestHeight' }, '*');
                      }, 500); // Small delay to ensure content is rendered
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}