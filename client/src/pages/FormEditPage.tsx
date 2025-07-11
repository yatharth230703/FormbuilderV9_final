import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserNav } from '@/components/auth/UserNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, Eye } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      secondary?: string; // new
      accent?: string;    // new
    };
    font: {
      family: string; // eg: "Roboto", "Open Sans"
      size: string;   // eg: "medium", "large" if you want to support sizes
      weight?: string; // optional (eg: "400", "700")
    };
  };
  steps: Array<{
    type: string;
    title: string;
    subtitle: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}


interface FormData {
  id: number;
  originalId?: number;
  label: string;
  config: FormConfig;
  created_at: string;
  portal: string | null;
  user_uuid: string | null;
  promptHistory?: string[];
}

export function FormEditPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const params = useParams();
  const formId = params.id;
  const { toast } = useToast();
  
  const [originalFormId, setOriginalFormId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [formLabel, setFormLabel] = useState('');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`);
        if (!response.ok) throw new Error('Failed to fetch form');
        const data = await response.json();
  
        setFormData({
          ...data,
        originalId:data.id
        });
        setFormConfig(data.config);
        setFormLabel(data.label || '');
        setPromptHistory(data.promptHistory || []);
        setOriginalFormId(data.id); // ✅ Set here
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Failed to load form. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    if (user && formId) {
      fetchForm();
    }
  }, [user, formId]);

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to modify the form",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      if (!formData) {
        throw new Error("Form data is not available");
      }
      
      // Send the edit request to the server
      const response = await fetch('/api/edit-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: formData.config,
          instruction: prompt,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update form: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Create a copy of the current form data with type safety
      const updatedFormData: FormData = {
        ...formData,
        config: result.config,
        label: formLabel,
        promptHistory: [
          ...(formData.promptHistory || []),
          prompt
        ]
      };
      console.log('[client] About to POST /api/publish with:', {
        originalFormId,
        label: updatedFormData.label,
        promptHistory: updatedFormData.promptHistory,
        config: updatedFormData.config.steps.length + ' steps'
      });
      // Save the updated form configuration
      if (originalFormId == null) {
        console.warn('[client] originalFormId is missing, cannot publish properly!');
        return;
      }
      console.log('[DEBUG] Publishing with originalFormId:', originalFormId, typeof originalFormId);
      console.log('[client] Submitting with originalFormId =', formData.originalId);
      const saveResponse = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: updatedFormData.label,
          config: updatedFormData.config,
          language: 'en',
          promptHistory: updatedFormData.promptHistory,
          originalFormId: formData.originalId // Pass the original form ID to delete it
        }),
      });
      
      if (!saveResponse.ok) {
        throw new Error(`Failed to save form: ${saveResponse.statusText}`);
      }
      
      const saveResult = await saveResponse.json();
      
      // Update the form data with the saved version
      setFormData({
        ...updatedFormData,
        id: saveResult.id,
      });
      
      toast({
        title: "Form updated",
        description: "Your form has been successfully updated",
      });
      
      // Clear the prompt
      setPrompt('');
    } catch (err) {
      console.error('Error updating form:', err);
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Failed to update form",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
              <h1 className="text-xl font-bold">Edit Form</h1>
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
            <div className="grid grid-cols-1 gap-6">
              {/* Form Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="form-title">Form Title</Label>
                      <Input 
                        id="form-title" 
                        value={formLabel} 
                        onChange={(e) => setFormLabel(e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label className="font-semibold">Created</Label>
                      <p>{new Date(formData.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="font-semibold">Number of Steps</Label>
                      <p>{formData.config.steps.length}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(`/preview/${formData.id}`, '_blank')}
                        className="flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Form
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Form Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Edit with AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-prompt">
                        Describe the changes you want to make to your form
                      </Label>
                      <Textarea 
                        id="edit-prompt" 
                        placeholder="e.g., Add a multiple choice question about user satisfaction, Change the form theme color to blue"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={6}
                        className="resize-y"
                      />
                    </div>
                    <Button 
                      onClick={handlePromptSubmit} 
                      disabled={saving || !prompt.trim()}
                      className="w-full"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating Form...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Form
                        </>
                      )}
                    </Button>
                    
                    {formData.promptHistory && formData.promptHistory.length > 0 && (
                      <div className="mt-6">
                        <Label className="font-semibold">Previous Prompts</Label>
                        <div className="mt-2 space-y-2">
                          {formData.promptHistory.map((prevPrompt, index) => (
                            <div 
                              key={index} 
                              className="text-sm p-2 bg-gray-100 rounded border cursor-pointer hover:bg-gray-200"
                              onClick={() => setPrompt(prevPrompt)}
                            >
                              {prevPrompt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}