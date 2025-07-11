import { FormConfig as FormConfigType } from "@shared/types";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Database integration service
 * For storing form configurations and responses using Supabase
 */

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Save a form configuration to Supabase
 */
export async function saveFormConfig(
  label: string,
  config: FormConfigType,
  language = 'en',
  portal: string | null = null
): Promise<{ id: number }> {
  // Still using the API endpoint for form generation, as it involves Gemini API
  const response = await fetch('/api/prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: label,
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to save form config: ${JSON.stringify(error)}`);
  }
  
  const data = await response.json();
  return { id: data.id };
}

/**
 * Save a form response directly to Supabase
 */
export async function saveFormResponse(
  label: string,
  response: Record<string, any>,
  language = 'en',
  portal: string | null = null,
  form_config_id: number | null = null
): Promise<{ id: number }> {
  try {
    // First try using Supabase directly
    const { data, error } = await supabase
      .from('form_responses')
      .insert([
        { 
          label,
          language,
          response_data: response,
          portal,
          form_config_id
        }
      ])
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    return { id: data.id };
  } catch (supabaseError) {
    console.error('Supabase direct insert failed, falling back to API:', supabaseError);
    
    // Fall back to API endpoint if direct Supabase insert fails
    const apiResponse = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        label,
        language,
        response,
        portal,
        form_config_id
      })
    });
    
    if (!apiResponse.ok) {
      const error = await apiResponse.json();
      throw new Error(`Failed to save form response: ${JSON.stringify(error)}`);
    }
    
    const data = await apiResponse.json();
    return { id: data.id };
  }
}

/**
 * Get a form configuration by ID from Supabase
 */
export async function getFormConfig(id: number): Promise<FormConfigType> {
  try {
    // First try using Supabase directly
    const { data, error } = await supabase
      .from('form_config')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data || !data.config) {
      throw new Error('Form configuration not found');
    }
    
    return data.config as FormConfigType;
  } catch (supabaseError) {
    console.error('Supabase direct query failed, falling back to API:', supabaseError);
    
    // Fall back to API endpoint if direct Supabase query fails
    const response = await fetch(`/api/forms/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get form config: ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    if (!data || !data.config) {
      throw new Error('Form configuration not found');
    }
    
    return data.config as FormConfigType;
  }
}

/**
 * Get all form configurations from Supabase
 */
export async function getAllFormConfigs(): Promise<{ id: number; label: string; config: FormConfigType }[]> {
  try {
    const { data, error } = await supabase
      .from('form_config')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (err: any) {
    console.error('Failed to get form configs from Supabase:', err);
    throw new Error(`Failed to get form configs: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Get all form responses from Supabase
 */
export async function getAllFormResponses(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (err: any) {
    console.error('Failed to get form responses from Supabase:', err);
    throw new Error(`Failed to get form responses: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Get form responses by label from Supabase
 */
export async function getFormResponsesByLabel(label: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('label', label)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (err: any) {
    console.error(`Failed to get form responses for label ${label} from Supabase:`, err);
    throw new Error(`Failed to get form responses: ${err.message || 'Unknown error'}`);
  }
}
