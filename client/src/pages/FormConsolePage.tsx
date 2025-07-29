import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserNav } from "@/components/auth/UserNav";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Database, 
  ArrowLeft,
  Save,
  Mail,
  MousePointer,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FormStep {
  type: string;
  title: string;
  subtitle?: string;
  options?: Array<{
    id: string;
    title: string;
    description?: string;
    icon?: string;
  }>;
}

interface FormConfig {
  id: number;
  label: string;
  config: {
    steps: FormStep[];
  };
}

interface ConsoleConfig {
  enable: boolean;
  formConfig: {
    enabled_actions: string[];
    trigger: {
      slide_no: number;
      option: string;
    };
    last_updated: string;
  };
  responseConfig: {
    enabled_actions: string[];
    trigger: {
      slide_no: number;
      option: string[];
    };
    brochure_text?: string;
    last_updated: string;
  };
}

export default function FormConsolePage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [consoleEnabled, setConsoleEnabled] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormConfig | null>(null);
  const [brochureText, setBrochureText] = useState("");
  
  // Form Config Actions
  const [autoSelectEnabled, setAutoSelectEnabled] = useState(false);
  const [selectedFirstOption, setSelectedFirstOption] = useState<string>("");
  
  // Response Config Actions
  const [sendBrochureEnabled, setSendBrochureEnabled] = useState(false);
  const [selectedResponseOptions, setSelectedResponseOptions] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's forms
  const { data: forms, isLoading: formsLoading } = useQuery({
    queryKey: ["/api/forms"],
    enabled: !!user,
  }) as { data: any[] | undefined, isLoading: boolean };

  // Fetch selected form details
  const { data: formDetails, isLoading: formDetailsLoading, error: formDetailsError } = useQuery({
    queryKey: [`/api/forms/${selectedFormId}`],
    enabled: !!selectedFormId,
  }) as { data: any | undefined, isLoading: boolean, error: any };
  
  // Log any errors
  React.useEffect(() => {
    if (formDetailsError) {
      console.error('[FormConsole] Error fetching form details:', formDetailsError);
    }
  }, [formDetailsError]);

  // Fetch console configuration for selected form
  const { data: consoleData, isLoading: consoleLoading } = useQuery({
    queryKey: ["/api/console", selectedFormId],
    enabled: !!selectedFormId,
  }) as { data: any | undefined, isLoading: boolean };

  // Update form details when data changes
  useEffect(() => {
    console.log('[FormConsole] Form details response:', formDetails);
    if (formDetails) {
      console.log('[FormConsole] Setting selected form with structure:', {
        id: formDetails.id,
        label: formDetails.label,
        hasConfig: !!formDetails.config,
        hasSteps: !!formDetails.config?.steps,
        stepsLength: formDetails.config?.steps?.length,
        firstStepType: formDetails.config?.steps?.[0]?.type,
        firstStepOptions: formDetails.config?.steps?.[0]?.options
      });
      setSelectedForm(formDetails);
    }
  }, [formDetails]);

  // Load console configuration when data is available
  useEffect(() => {
    if (consoleData && typeof consoleData === 'object') {
      const config = (consoleData as any).consoleConfig || {};
      setConsoleEnabled(config.enable || false);
      
      // Form Config
      const formConfig = config.formConfig || {};
      setAutoSelectEnabled(formConfig.enabled_actions?.includes('auto_select_first_option') || false);
      setSelectedFirstOption(formConfig.trigger?.option || "");
      
      // Response Config
      const responseConfig = config.responseConfig || {};
      setSendBrochureEnabled(responseConfig.enabled_actions?.includes('send_brochure') || false);
      setSelectedResponseOptions(responseConfig.trigger?.option || []);
      setBrochureText(responseConfig.brochure_text || "");
    }
  }, [consoleData]);

  // Update console configuration mutation
  const updateConsoleMutation = useMutation({
    mutationFn: (consoleConfig: ConsoleConfig) => 
      apiRequest(`/api/console/${selectedFormId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consoleConfig })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/console", selectedFormId] });
      toast({
        title: "Console Updated",
        description: "Console configuration has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update console configuration",
        variant: "destructive",
      });
    },
  });

  // Save console configuration
  const handleSaveConfiguration = () => {
    if (!selectedFormId) {
      toast({
        title: "Error",
        description: "Please select a form first",
        variant: "destructive",
      });
      return;
    }

    const consoleConfig: ConsoleConfig = {
      enable: consoleEnabled,
      formConfig: {
        enabled_actions: autoSelectEnabled ? ['auto_select_first_option'] : [],
        trigger: {
          slide_no: 0,
          option: selectedFirstOption,
        },
        last_updated: new Date().toISOString(),
      },
      responseConfig: {
        enabled_actions: sendBrochureEnabled ? ['send_brochure'] : [],
        trigger: {
          slide_no: 0, // Will be updated to handle multiple slides
          option: selectedResponseOptions,
        },
        brochure_text: brochureText,
        last_updated: new Date().toISOString(),
      },
    };

    updateConsoleMutation.mutate(consoleConfig);
  };

  const handleFirstOptionChange = (optionId: string) => {
    setSelectedFirstOption(optionId);
  };

  const handleResponseOptionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedResponseOptions(prev => [...prev, optionId]);
    } else {
      setSelectedResponseOptions(prev => prev.filter(id => id !== optionId));
    }
  };

  const getFirstStepOptions = () => {
    console.log('[FormConsole] getFirstStepOptions called with selectedForm:', selectedForm);
    
    if (!selectedForm) {
      console.log('[FormConsole] No selected form');
      return [];
    }
    
    if (!selectedForm.config) {
      console.log('[FormConsole] Selected form has no config:', selectedForm);
      return [];
    }
    
    if (!selectedForm.config.steps || selectedForm.config.steps.length === 0) {
      console.log('[FormConsole] Selected form has no steps or empty steps:', selectedForm.config);
      return [];
    }
    
    const firstStep = selectedForm.config.steps[0];
    console.log('[FormConsole] First step:', firstStep);
    
    if (firstStep.type === 'tiles' && firstStep.options) {
      console.log('[FormConsole] Returning options:', firstStep.options);
      return firstStep.options;
    }
    
    console.log('[FormConsole] First step is not tiles type or has no options');
    return [];
  };

  const getTileStepOptions = () => {
    if (!selectedForm || !selectedForm.config || !selectedForm.config.steps) {
      return [];
    }
    
    const allOptions: Array<{stepIndex: number, stepTitle: string, options: any[]}> = [];
    
    selectedForm.config.steps.forEach((step, index) => {
      if (step.type === 'tiles' && step.options) {
        allOptions.push({
          stepIndex: index,
          stepTitle: step.title,
          options: step.options
        });
      }
    });
    
    return allOptions;
  };

  // Calculate options when selectedForm changes
  const firstStepOptions = React.useMemo(() => {
    console.log('[FormConsole] Computing firstStepOptions, selectedForm:', selectedForm);
    return getFirstStepOptions();
  }, [selectedForm]);
  
  const tileStepOptions = React.useMemo(() => {
    console.log('[FormConsole] Computing tileStepOptions, selectedForm:', selectedForm);
    return getTileStepOptions();
  }, [selectedForm]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">Form Console</h1>
            </div>
            <div className="flex gap-3 items-center">
              <CreditsDisplay />
              <UserNav />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {/* Form Selection */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Select Form
                </CardTitle>
                <CardDescription>
                  Choose a form to configure console automation rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="form-select">Form</Label>
                    <Select value={selectedFormId} onValueChange={(value) => {
                      console.log('[FormConsole] Form selected:', value);
                      setSelectedFormId(value);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a form to configure" />
                      </SelectTrigger>
                      <SelectContent>
                        {formsLoading ? (
                          <SelectItem value="loading" disabled>Loading forms...</SelectItem>
                        ) : forms && forms.length > 0 ? (
                          forms.map((form: any) => (
                            <SelectItem key={form.id} value={form.id.toString()}>
                              {form.label || `Form ${form.id}`}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-forms" disabled>No forms available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="console-enabled"
                      checked={consoleEnabled}
                      onCheckedChange={setConsoleEnabled}
                    />
                    <Label htmlFor="console-enabled">Console Enabled</Label>
                  </div>

                  <Button 
                    onClick={handleSaveConfiguration}
                    disabled={!selectedFormId || updateConsoleMutation.isPending}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateConsoleMutation.isPending ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Console Configuration */}
          {selectedFormId && (
            <Tabs defaultValue="form-config" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="form-config" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Form Config
                </TabsTrigger>
                <TabsTrigger value="response-config" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Response Config
                </TabsTrigger>
              </TabsList>

              <TabsContent value="form-config" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Configuration Rules</CardTitle>
                    <CardDescription>
                      Define conditions based on form configuration content to trigger specific actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Auto Select First Option */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MousePointer className="h-4 w-4" />
                            <Label htmlFor="auto-select">Auto Select First Option</Label>
                          </div>
                          <Switch
                            id="auto-select"
                            checked={autoSelectEnabled}
                            onCheckedChange={setAutoSelectEnabled}
                          />
                        </div>
                        
                        {autoSelectEnabled && (
                          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            {firstStepOptions.length > 0 ? (
                              <div className="space-y-3">
                                <Label>Select option to auto-select on first step:</Label>
                                <div className="space-y-2">
                                  {firstStepOptions.map((option) => (
                                    <div key={option.id} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`first-${option.id}`}
                                        name="first-option"
                                        checked={selectedFirstOption === option.id}
                                        onChange={() => handleFirstOptionChange(option.id)}
                                        className="h-4 w-4"
                                      />
                                      <Label htmlFor={`first-${option.id}`} className="text-sm">
                                        {option.title}
                                        {option.description && (
                                          <span className="text-gray-500 ml-1">- {option.description}</span>
                                        )}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : formDetailsLoading ? (
                              <div className="flex items-center gap-2 text-gray-500">
                                <span className="text-sm">Loading form details...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-orange-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">
                                  {!selectedForm ? "No form data loaded" :
                                   !selectedForm.config ? "Form has no configuration" :
                                   !selectedForm.config.steps ? "Form has no steps" :
                                   selectedForm.config.steps.length === 0 ? "Form has empty steps array" :
                                   selectedForm.config.steps[0]?.type !== 'tiles' ? `Error: First step is type '${selectedForm.config.steps[0]?.type}', must be 'tiles'` :
                                   "No options available in first step"}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="response-config" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Response Configuration Rules</CardTitle>
                    <CardDescription>
                      Define conditions based on form response content to trigger specific actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Send Brochure */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <Label htmlFor="send-brochure">Send Brochure</Label>
                          </div>
                          <Switch
                            id="send-brochure"
                            checked={sendBrochureEnabled}
                            onCheckedChange={setSendBrochureEnabled}
                          />
                        </div>
                        
                        {sendBrochureEnabled && (
                          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <div className="space-y-2">
                              <Label htmlFor="brochure-text">Brochure Text</Label>
                              <Textarea
                                id="brochure-text"
                                placeholder="Enter the text you want to send to users via email..."
                                value={brochureText}
                                onChange={(e) => setBrochureText(e.target.value)}
                                rows={4}
                              />
                            </div>
                            
                            {tileStepOptions.length > 0 ? (
                              <div className="space-y-4">
                                <Label>Select options that trigger brochure sending:</Label>
                                {tileStepOptions.map((stepGroup) => (
                                  <div key={stepGroup.stepIndex} className="space-y-2">
                                    <h4 className="font-medium text-sm text-gray-700">
                                      Step {stepGroup.stepIndex + 1}: {stepGroup.stepTitle}
                                    </h4>
                                    <div className="space-y-2 ml-4">
                                      {stepGroup.options.map((option) => (
                                        <div key={option.id} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`response-${option.id}`}
                                            checked={selectedResponseOptions.includes(option.id)}
                                            onCheckedChange={(checked) => 
                                              handleResponseOptionChange(option.id, checked as boolean)
                                            }
                                          />
                                          <Label htmlFor={`response-${option.id}`} className="text-sm">
                                            {option.title}
                                            {option.description && (
                                              <span className="text-gray-500 ml-1">- {option.description}</span>
                                            )}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-orange-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">
                                  {selectedForm ? "No tile steps found in this form" : "Loading form details..."}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}