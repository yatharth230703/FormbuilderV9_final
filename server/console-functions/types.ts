/**
 * Type definitions for console functions
 * These types ensure type safety when using console functions throughout the codebase
 */

import { FormConfig } from "@shared/types";

// Base interface for all console function options
export interface BaseConsoleFunctionOptions {
  formId: number;
  conditionResult: Record<string, any>;
}

// Auto-select first option types
export interface AutoSelectCondition {
  [optionId: string]: boolean;
}

export interface AutoSelectOptions extends BaseConsoleFunctionOptions {
  conditionResult: AutoSelectCondition;
  formConfig: FormConfig;
}

// Send brochure types
export interface SendBrochureCondition {
  [responseKey: string]: boolean;
}

export interface SendBrochureOptions extends BaseConsoleFunctionOptions {
  conditionResult: SendBrochureCondition;
  formResponse: Record<string, any>;
  brochureContent: string;
  recipientEmail: string;
  formLabel: string;
}

// Console function execution result
export interface ConsoleFunctionResult {
  success: boolean;
  message?: string;
  data?: any;
  functionName: string;
  formId: number;
  executionTime: number;
}

// Console function metadata
export interface ConsoleFunctionMetadata {
  name: string;
  description: string;
  type: 'form-config' | 'response-config' | 'document';
  enabled: boolean;
  category: 'submission' | 'response' | 'automation';
  triggers: string[];
}

// Console function registry
export interface ConsoleFunctionRegistry {
  [key: string]: {
    execute: (options: any) => Promise<ConsoleFunctionResult> | ConsoleFunctionResult;
    metadata: ConsoleFunctionMetadata;
  };
}

// IF-THEN condition structure
export interface ConsoleFunctionCondition {
  id: string;
  type: 'form-config' | 'response-config' | 'document';
  prompt: string;
  processedCondition: Record<string, any>;
  enabled: boolean;
  formId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Console function execution context
export interface ConsoleFunctionContext {
  formId: number;
  formConfig?: FormConfig;
  formResponse?: Record<string, any>;
  userEmail?: string;
  formLabel?: string;
  conditions: ConsoleFunctionCondition[];
  enabledFunctions: string[];
}