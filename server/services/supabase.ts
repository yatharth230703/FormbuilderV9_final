/**
 * This module handles interactions with the Supabase API
 * for database operations
 */

import { createClient } from '@supabase/supabase-js';
import { FormConfig, FormResponse } from '@shared/types';

import dotenv from 'dotenv';
dotenv.config();

// Check if Supabase credentials are available
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

// Custom implementation to prevent initialization error
function createSupabaseClient() {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
      if (process.env.NODE_ENV === 'production') {
        console.error('Application cannot start without Supabase credentials in production.');
        process.exit(1);
      }
      return null;
    }
    
    // Validate URL format
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      console.error('Invalid SUPABASE_URL format. Expected: https://your-project.supabase.co');
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      return null;
    }
    
    return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
}

// Initialize Supabase client
const supabase = createSupabaseClient();

/**
 * Creates a new form configuration in Supabase
 * @param label The form label (prompt)
 * @param config The form configuration object
 * @param language The form language
 * @param domain Optional domain identifier
 * @param userId Optional user ID to associate with this form
 * @returns The ID of the newly created form configuration
 */
export async function createFormConfig(
  label: string,
  config: FormConfig,
  language = 'en',
  domain: string | null = null,
  userId: string | null = null
): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  // Generate a random domain if not provided
  const finalDomain = domain || `domain_${Math.random().toString(36).substring(2, 8)}`;
  
  // Insert with a temporary label, then update with the correct label after getting the id
  const tempLabel = 'pending_label';
  const { data, error } = await supabase
    .from('form_config')
    .insert([
      { 
        label: tempLabel, 
        config,
        language,
        domain: finalDomain,
        user_uuid: userId
      }
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Supabase error creating form config:', error);
    throw new Error(`Failed to create form config in Supabase: ${error.message}`);
  }

  const formId = data.id;
  // Get the first step's title
  let firstTitle = 'untitled';
  if (config && Array.isArray(config.steps) && config.steps.length > 0 && config.steps[0].title) {
    firstTitle = String(config.steps[0].title).replace(/\s+/g, '_').toLowerCase();
  }
  const newLabel = `${firstTitle}_${formId}`;
  
  // Generate the unique URL with fallback
  const baseUrl = process.env.APP_URL || 
                  (process.env.NODE_ENV === 'production' ? 'https://your-app.replit.app' : 'http://localhost:5000');
  const uniqueUrl = `${baseUrl}/embed?language=${language}&label=${encodeURIComponent(newLabel)}&domain=${encodeURIComponent(finalDomain)}`;
  
  // Update the label and URL
  await supabase
    .from('form_config')
    .update({ 
      label: newLabel,
      url: uniqueUrl
    })
    .eq('id', formId);

  return formId;
}

/**
 * Fetches a form configuration by ID
 * @param id The form configuration ID
 * @returns The form configuration or null if not found
 */
export async function getFormConfig(id: number): Promise<FormConfig | null> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { data, error } = await supabase
    .from('form_config')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Supabase error fetching form config:', error);
    throw new Error(`Failed to fetch form config from Supabase: ${error.message}`);
  }

  return data;
}

/**
 * Gets a form configuration by language, label, and domain from Supabase
 * @param language The language code
 * @param label The form label
 * @param domain The domain identifier
 * @returns The form configuration
 */
export async function getFormByProperties(
  language: string,
  label: string,
  domain: string
): Promise<{ id: number; label: string; config: FormConfig; created_at: string; user_uuid: string | null; form_console?: any; language: string; domain: string; url?: string } | null> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { data, error } = await supabase
    .from('form_config')
    .select('*')
    .eq('language', language)
    .eq('label', label)
    .eq('domain', domain)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    console.error(`Supabase error getting form by properties:`, error);
    throw new Error(`Failed to get form by properties from Supabase: ${error.message}`);
  }

  // Ensure created_at exists
  if (data && !data.created_at) {
    data.created_at = new Date().toISOString();
  }

  return data;
}

/**
 * Gets all form configurations from Supabase
 * @returns Array of form configurations
 */
export async function getAllFormConfigs(): Promise<{ id: number; label: string; config: FormConfig; created_at: string; user_uuid: string | null }[]> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { data, error } = await supabase
    .from('form_config')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error getting form configs:', error);
    throw new Error(`Failed to get form configs from Supabase: ${error.message}`);
  }

  // Ensure all items have created_at
  const formattedData = (data || []).map(item => {
    if (!item.created_at) {
      item.created_at = new Date().toISOString();
    }
    return item;
  });

  return formattedData;
}

/**
 * Gets form configurations for a specific user from Supabase
 * @param userId The user ID to filter forms by
 * @returns Array of form configurations owned by the user
 */
export async function getUserFormConfigs(userId: string): Promise<{ id: number; label: string; config: FormConfig; created_at: string; user_uuid: string | null }[]> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  console.log(`Fetching form configs for user ID: ${userId}`);
  
  const { data, error } = await supabase
    .from('form_config')
    .select('*')
    .eq('user_uuid', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Supabase error getting form configs for user ${userId}:`, error);
    throw new Error(`Failed to get user form configs from Supabase: ${error.message}`);
  }

  // Ensure all items have created_at
  const formattedData = (data || []).map(item => {
    if (!item.created_at) {
      item.created_at = new Date().toISOString();
    }
    return item;
  });

  console.log(`Found ${formattedData.length} forms for user ${userId}`);
  return formattedData;
}

/**
 * Creates a new form response in Supabase
 * @param label The form label
 * @param responses The form responses object
 * @param language The form language
 * @param domain Optional domain identifier
 * @param formId Optional form ID to associate with this response
 * @param userUuid Optional user UUID
 * @returns The ID of the newly created form response
 */
export async function createFormResponse(
  label: string,
  responses: Record<string, any>,
  language = 'en',
  domain: string | null = null,
  formId: number | null = null,
  userUuid: string | null = null
): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { data, error } = await supabase
    .from('form_responses')
    .insert([
      { 
        label, 
        response: responses,
        language,
        domain,
        form_config_id: formId,
        user_uuid: userUuid
      }
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Supabase error creating form response:', error);
    throw new Error(`Failed to create form response in Supabase: ${error.message}`);
  }

  return data.id;
}

/**
 * Fetches all form responses from Supabase
 * @returns Array of form responses
 */
export async function getAllFormResponses(): Promise<any[]> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error getting all form responses:', error);
    throw new Error(`Failed to get form responses from Supabase: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetches form responses by label
 * @param label The form label
 * @returns Array of form responses
 */
export async function getFormResponsesByLabel(label: string): Promise<FormResponse[]> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('label', label)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error fetching form responses:', error);
    throw new Error(`Failed to fetch form responses from Supabase: ${error.message}`);
  }

  return data || [];
}

/**
 * Deletes a form configuration by ID
 * @param id The form configuration ID
 * @returns True if deleted successfully, false otherwise
 */
export async function deleteFormConfig(id: number): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { error } = await supabase
    .from('form_config')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase error deleting form config:', error);
    return false;
  }

  return true;
}

/**
 * Updates a form configuration
 * @param id The form configuration ID
 * @param updates The fields to update
 * @returns True if updated successfully, false otherwise
 */
export async function updateFormConfig(
  id: number, 
  updates: Partial<{ config: FormConfig; label: string; }>
): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { error } = await supabase
    .from('form_config')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Supabase error updating form config:', error);
    return false;
  }

  return true;
}

/**
 * Gets form responses by form config ID from Supabase
 * @param formId The form configuration ID
 * @returns Array of form responses
 */
export async function getFormResponsesByFormId(formId: number): Promise<any[]> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { data, error } = await supabase!.from('form_responses').select('*').eq('form_config_id', formId).order('created_at', { ascending: false });

  if (error) {
    console.error(`Supabase error getting form responses for form ID ${formId}:`, error);
    throw new Error(`Failed to get form responses from Supabase: ${error.message}`);
  }

  return data || [];
}

/**
 * Deletes all form responses for a given form_config_id from Supabase
 * @param formConfigId The form configuration ID whose responses should be deleted
 * @returns true if successful, false otherwise
 */
export async function deleteFormResponsesByFormConfigId(formConfigId: number): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  try {
    const { error } = await supabase
      .from('form_responses')
      .delete()
      .eq('form_config_id', formConfigId);
    if (error) {
      console.error('❌ deleteFormResponsesByFormConfigId error', error);
      throw error;
    }
    console.log('✅ deleteFormResponsesByFormConfigId succeeded');
    return true;
  } catch (err) {
    console.error('💥 deleteFormResponsesByFormConfigId threw', err);
    return false;
  }
}

/**
 * Gets a user by ID
 * @param id The user ID
 * @returns The user object or null if not found
 */
export async function getUserById(id: string): Promise<any> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('uuid', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Supabase error fetching user:', error);
    throw new Error(`Failed to fetch user from Supabase: ${error.message}`);
  }

  return data;
}

/**
 * Updates user credits in Supabase
 * @param userId The user's ID
 * @param credits New credit amount
 * @returns Success status
 */
export async function updateUserCredits(userId: string, credits: number): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ credits })
      .eq('uuid', userId);
      
    if (error) {
      console.error('Error updating user credits:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in updateUserCredits:', err);
    return false;
  }
}

/**
 * Deducts credits from a user
 * @param userId The user ID
 * @param credits The number of credits to deduct
 */
export async function deductUserCredits(userId: string, credits: number): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  // Get current user credits first
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const currentCredits = parseInt(user.credits || '0', 10);
  if (currentCredits < credits) {
    throw new Error('Insufficient credits');
  }

  const newCredits = currentCredits - credits;

  const { error } = await supabase
    .from('users')
    .update({ credits: newCredits })
    .eq('uuid', userId);

  if (error) {
    console.error('Supabase error deducting user credits:', error);
    throw new Error(`Failed to deduct user credits: ${error.message}`);
  }
}

/**
 * Updates the form console configuration for a specific form
 * @param formId The form ID
 * @param consoleConfig The console configuration object
 */
export async function updateFormConsole(formId: number, consoleConfig: any): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  try {
    const { error } = await supabase
      .from('form_config')
      .update({ form_console: consoleConfig })
      .eq('id', formId);

    if (error) {
      console.error('Error updating form console configuration:', error);
      throw new Error(`Failed to update form console: ${error.message}`);
    }

    console.log(`Updated form console configuration for form ${formId}`);
  } catch (err) {
    console.error('Error in updateFormConsole:', err);
    throw err;
  }
}

/**
 * Checks if a combination of language, label, and domain is unique
 * @param language The language code
 * @param label The form label
 * @param domain The domain identifier
 * @param excludeFormId Optional form ID to exclude from the check (for updates)
 * @returns true if the combination is unique, false otherwise
 */
export async function checkUniqueFormProperties(
  language: string,
  label: string,
  domain: string,
  excludeFormId?: number
): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  try {
    let query = supabase
      .from('form_config')
      .select('id')
      .eq('language', language)
      .eq('label', label)
      .eq('domain', domain);

    if (excludeFormId) {
      query = query.neq('id', excludeFormId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking unique form properties:', error);
      throw new Error(`Failed to check unique form properties: ${error.message}`);
    }

    // If no data is returned, the combination is unique
    return !data || data.length === 0;
  } catch (err) {
    console.error('Error in checkUniqueFormProperties:', err);
    throw err;
  }
}

/**
 * Updates form properties (language, label, domain, url)
 * @param formId The form ID
 * @param properties Object containing language, label, domain, and url
 */
export async function updateFormProperties(
  formId: number,
  properties: {
    language: string;
    label: string;
    domain: string;
    url: string;
  }
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  try {
    const { error } = await supabase
      .from('form_config')
      .update({
        language: properties.language,
        label: properties.label,
        domain: properties.domain,
        url: properties.url,
      })
      .eq('id', formId);

    if (error) {
      console.error('Error updating form properties:', error);
      throw new Error(`Failed to update form properties: ${error.message}`);
    }

    console.log(`Updated form properties for form ${formId}`);
  } catch (err) {
    console.error('Error in updateFormProperties:', err);
    throw err;
  }
}