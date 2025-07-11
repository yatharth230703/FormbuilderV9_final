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
      console.warn('Supabase credentials missing. Supabase functionality will be unavailable.');
      return null;
    }
    return createClient(supabaseUrl,  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
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
 * @param portal Optional portal identifier
 * @param userId Optional user ID to associate with this form
 * @returns The ID of the newly created form configuration
 */
export async function createFormConfig(
  label: string,
  config: FormConfig,
  language = 'en',
  portal: string | null = null,
  userId: string | null = null
): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  // Insert with a temporary label, then update with the correct label after getting the id
  const tempLabel = 'pending_label';
  const { data, error } = await supabase
    .from('form_config')
    .insert([
      { 
        label: tempLabel, 
        config,
        language,
        portal,
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
  // Update the label
  await supabase
    .from('form_config')
    .update({ label: newLabel })
    .eq('id', formId);

  return formId;
}

/**
 * Gets a form configuration by ID from Supabase
 * @param id The form configuration ID
 * @returns The form configuration
 */
export async function getFormConfig(id: number): Promise<{ id: number; label: string; config: FormConfig; created_at: string; user_uuid: string | null; form_console?: any }> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { data, error } = await supabase
    .from('form_config')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Supabase error getting form config with ID ${id}:`, error);
    throw new Error(`Failed to get form config from Supabase: ${error.message}`);
  }

  // Ensure created_at exists
  if (!data.created_at) {
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
 * @param responseData The form response data
 * @param language The form language
 * @param portal Optional portal identifier
 * @param formConfigId Optional form configuration ID
 * @returns The ID of the newly created form response
 */
export async function createFormResponse(
  label: string,
  responseData: Record<string, any>,
  language = 'en',
  portal: string | null = null,
  formConfigId: number | null = null,
  userUuid: string | null = null
): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  try {
    // Try using a different approach to bypass schema cache issues
    
    // First, create a simple data object for the response
    const responseObj = {
      label,
      language: language || 'en',
      portal: portal || null,
      form_config_id: formConfigId,
      user_uuid: userUuid
    };
    
    // We're having issues with the response column, so try explicitly adding it
    const insertObj = {
      ...responseObj,
      // Try several different ways to represent the response data
      response: responseData
    };
    
    console.log('Attempting to save form response with data:');
    
    // First attempt using the standard API approach
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .insert([insertObj])
        .select('id')
        .single();

      if (error) {
        throw error;
      }
      
      return data.id;
    } catch (insertError) {
      console.error('Standard insert failed. Trying alternative approach:', insertError);
      
      // Try alternative approach with upsert
      try {
        const { data: upsertData, error: upsertError } = await supabase
          .from('form_responses')
          .upsert([
            {
              id: Math.floor(Math.random() * 1000000) + 1000, // Generate a random ID
              label, 
              language: language || 'en',
              portal: portal || null,
              form_config_id: formConfigId,
              user_uuid: userUuid,
              // Use a plain string for the response as a last resort
              response: JSON.stringify(responseData)
            }
          ])
          .select('id');
        
        if (upsertError) {
          throw upsertError;
        }
        
        return upsertData?.[0]?.id || 0;
      } catch (upsertError: any) {
        console.error('Upsert approach also failed:', upsertError);
        const errorMessage = upsertError?.message || 'Unknown error';
        throw new Error(`Failed to create form response: ${errorMessage}`);
      }
    }
  } catch (error: any) {
    console.error('Supabase error creating form response:', error);
    const errorMessage = error?.message || 'Unknown error';
    throw new Error(`Failed to create form response in Supabase: ${errorMessage}`);
  }
}

/**
 * Gets all form responses from Supabase
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
 * Gets form responses by label from Supabase
 * @param label The form label
 * @returns Array of form responses
 */
export async function getFormResponsesByLabel(label: string): Promise<any[]> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('label', label)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Supabase error getting form responses for label ${label}:`, error);
    throw new Error(`Failed to get form responses from Supabase: ${error.message}`);
  }

  return data || [];
}

/**
 * Deletes a form configuration from Supabase
 * @param id The form configuration ID to delete
 * @returns true if successful, false otherwise
 */
export async function deleteFormConfig(id: number): Promise<boolean> {
  console.log('↪ supabaseService.deleteFormConfig called with', id);
  try {
    const { error } = await supabase!.from('form_config').delete().eq('id', id);
    if (error) {
      console.error('❌ deleteFormConfig error', error);
      throw error;
    }
    console.log('✅ deleteFormConfig succeeded');
    return true;
  } catch (err) {
    console.error('💥 deleteFormConfig threw', err);
    return false;
  }
}

// server/services/supabase.ts
// …at the bottom of the file, after deleteFormConfig

/**
 * Updates an existing form configuration in Supabase
 */
/**
 * Updates an existing form configuration in Supabase
 */
export async function updateFormConfig(
  id: number,
  { config, label, promptHistory }: { config: FormConfig; label?: string; promptHistory?: string[] }
): Promise<void> {
  const toUpdate: any = { config };
  if (label) toUpdate.label = label;
  if (promptHistory) toUpdate.prompt_history = promptHistory;
  const { error } = await supabase!.from("form_config").update(toUpdate).eq("id", id);
  if (error) throw error;
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
 * Gets user information by ID from Supabase
 * @param userId The user's ID
 * @returns User data including credits
 */
export async function getUserById(userId: string): Promise<any> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('uuid, email, credits, created_at')
      .eq('uuid', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error in getUserById:', err);
    return null;
  }
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
 * Deduct credits from a user's account
 * @param userId The user's UUID
 * @param credits Number of credits to deduct
 */
export async function deductUserCredits(userId: string, credits: number): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  // Get current user credits
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const currentCredits = parseInt(user.credits || '0', 10);
  if (currentCredits < credits) {
    throw new Error('Insufficient credits');
  }

  const newCredits = currentCredits - credits;

  // Update user credits in Supabase
  const { error } = await supabase
    .from('users')
    .update({ credits: newCredits })
    .eq('uuid', userId);

  if (error) {
    console.error('Supabase error deducting credits:', error);
    throw new Error(`Failed to deduct credits: ${error.message}`);
  }

  console.log(`Deducted ${credits} credits from user ${userId}. New total: ${newCredits}`);
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