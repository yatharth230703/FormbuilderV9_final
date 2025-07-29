import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FormConfig, FormStep } from "@shared/types";
import { Edit, Plus, Trash2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManualModePanelProps {
  formConfig: FormConfig | null;
  onConfigUpdate: (config: FormConfig) => void;
}

export default function ManualModePanel({ formConfig, onConfigUpdate }: ManualModePanelProps) {
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = useState<FormConfig | null>(formConfig);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLocalConfig(formConfig);
  }, [formConfig]);

  const updateConfig = (newConfig: FormConfig) => {
    setLocalConfig(newConfig);
    onConfigUpdate(newConfig);
  };

  const updateStep = (stepIndex: number, updatedStep: FormStep) => {
    if (!localConfig) return;
    
    const newSteps = [...localConfig.steps];
    newSteps[stepIndex] = updatedStep;
    
    const newConfig = {
      ...localConfig,
      steps: newSteps
    };
    
    updateConfig(newConfig);
  };

  const updateStepField = (stepIndex: number, field: string, value: any) => {
    if (!localConfig) return;
    
    const step = localConfig.steps[stepIndex];
    const updatedStep = {
      ...step,
      [field]: value
    };
    
    updateStep(stepIndex, updatedStep);
  };

  const updateOption = (stepIndex: number, optionIndex: number, field: string, value: any) => {
    if (!localConfig) return;
    
    const step = localConfig.steps[stepIndex];
    if (!step.options) return;
    
    const newOptions = [...step.options];
    newOptions[optionIndex] = {
      ...newOptions[optionIndex],
      [field]: value
    };
    
    const updatedStep = {
      ...step,
      options: newOptions
    };
    
    updateStep(stepIndex, updatedStep);
  };

  const addOption = (stepIndex: number) => {
    if (!localConfig) return;
    
    const step = localConfig.steps[stepIndex];
    if (!step.options) return;
    
    const newOption = {
      id: `option_${Date.now()}`,
      title: "New Option",
      description: "Option description",
      icon: "📄"
    };
    
    const newOptions = [...step.options, newOption];
    const updatedStep = {
      ...step,
      options: newOptions
    };
    
    updateStep(stepIndex, updatedStep);
  };

  const removeOption = (stepIndex: number, optionIndex: number) => {
    if (!localConfig) return;
    
    const step = localConfig.steps[stepIndex];
    if (!step.options) return;
    
    const newOptions = step.options.filter((_, index) => index !== optionIndex);
    const updatedStep = {
      ...step,
      options: newOptions
    };
    
    updateStep(stepIndex, updatedStep);
  };

  const copyStep = (stepIndex: number) => {
    if (!localConfig) return;
    
    const stepToCopy = localConfig.steps[stepIndex];
    const newStep = {
      ...stepToCopy,
      title: `${stepToCopy.title} (Copy)`,
      options: stepToCopy.options ? [...stepToCopy.options] : undefined
    };
    
    const newSteps = [...localConfig.steps];
    newSteps.splice(stepIndex + 1, 0, newStep);
    
    const newConfig = {
      ...localConfig,
      steps: newSteps
    };
    
    updateConfig(newConfig);
    toast({
      title: "Step Copied",
      description: "Step has been copied and inserted after the original.",
    });
  };

  const removeStep = (stepIndex: number) => {
    if (!localConfig || localConfig.steps.length <= 1) return;
    
    const newSteps = localConfig.steps.filter((_, index) => index !== stepIndex);
    const newConfig = {
      ...localConfig,
      steps: newSteps
    };
    
    updateConfig(newConfig);
    toast({
      title: "Step Removed",
      description: "Step has been removed from the form.",
    });
  };



  if (!localConfig) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <p>No form configuration available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Manual Edit Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Theme Configuration */}
        <Accordion type="single" collapsible defaultValue="theme">
          <AccordionItem value="theme">
            <AccordionTrigger>Theme Configuration</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <Input
                  type="color"
                  value={localConfig.theme.colors.primary}
                  onChange={(e) => {
                    const newConfig = {
                      ...localConfig,
                      theme: {
                        ...localConfig.theme,
                        colors: {
                          ...localConfig.theme.colors,
                          primary: e.target.value
                        }
                      }
                    };
                    updateConfig(newConfig);
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Steps Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Form Steps</h3>
            <span className="text-sm text-gray-500">{localConfig.steps.length} steps</span>
          </div>
          
          <Accordion type="single" collapsible>
            {localConfig.steps.map((step, stepIndex) => (
              <AccordionItem key={stepIndex} value={stepIndex.toString()}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Step {stepIndex + 1}</span>
                      <span className="text-xs text-gray-500">({step.type})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyStep(stepIndex);
                        }}
                        title="Copy step"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {localConfig.steps.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStep(stepIndex);
                          }}
                          title="Remove step"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Step Type */}
                  <div className="space-y-2">
                    <Label>Step Type</Label>
                    <Select
                      value={step.type}
                      onValueChange={(value) => updateStepField(stepIndex, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tiles">Tiles</SelectItem>
                        <SelectItem value="multiSelect">Multi Select</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="slider">Slider</SelectItem>
                        <SelectItem value="followup">Followup</SelectItem>
                        <SelectItem value="textbox">Textbox</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="documentUpload">Document Upload</SelectItem>
                        <SelectItem value="documentInfo">Document Info</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Step Title */}
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStepField(stepIndex, 'title', e.target.value)}
                      placeholder="Step title"
                    />
                  </div>

                  {/* Step Subtitle */}
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Textarea
                      value={step.subtitle}
                      onChange={(e) => updateStepField(stepIndex, 'subtitle', e.target.value)}
                      placeholder="Step subtitle"
                      rows={2}
                    />
                  </div>

                  {/* Options for steps that have them */}
                  {(step.type === 'tiles' || step.type === 'multiSelect' || step.type === 'dropdown' || step.type === 'followup') && step.options && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(stepIndex)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {step.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="border rounded-lg p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Option {optionIndex + 1}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(stepIndex, optionIndex)}
                                title="Remove option"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input
                                value={option.title}
                                onChange={(e) => updateOption(stepIndex, optionIndex, 'title', e.target.value)}
                                placeholder="Option title"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input
                                value={option.description || ''}
                                onChange={(e) => updateOption(stepIndex, optionIndex, 'description', e.target.value)}
                                placeholder="Option description"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Icon</Label>
                              <Input
                                value={option.icon || ''}
                                onChange={(e) => updateOption(stepIndex, optionIndex, 'icon', e.target.value)}
                                placeholder="Icon (emoji or text)"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Slider specific fields */}
                  {step.type === 'slider' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Minimum Value</Label>
                          <Input
                            type="number"
                            value={(step as any).min || 0}
                            onChange={(e) => updateStepField(stepIndex, 'min', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Maximum Value</Label>
                          <Input
                            type="number"
                            value={(step as any).max || 100}
                            onChange={(e) => updateStepField(stepIndex, 'max', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Default Value</Label>
                        <Input
                          type="number"
                          value={(step as any).defaultValue || 50}
                          onChange={(e) => updateStepField(stepIndex, 'defaultValue', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Textbox specific fields */}
                  {step.type === 'textbox' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Placeholder</Label>
                        <Input
                          value={(step as any).placeholder || ''}
                          onChange={(e) => updateStepField(stepIndex, 'placeholder', e.target.value)}
                          placeholder="Input placeholder"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rows</Label>
                        <Input
                          type="number"
                          value={(step as any).rows || 3}
                          onChange={(e) => updateStepField(stepIndex, 'rows', parseInt(e.target.value))}
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
} 