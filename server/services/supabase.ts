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
  userId: string | null = null,
  iconMode: string = 'lucide'
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
        user_uuid: userId,
        icon_mode: iconMode  // Already correct snake_case
      }
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Supabase error creating form config:', error);
    throw new Error(`Failed to create form config in Supabase: ${error.message}`);
  }

  const formId = data.id;
  
  // Use the provided label directly
  const finalLabel = label;
  
  console.log("💾 SUPABASE - createFormConfig received:", {
    label: label,
    finalLabel: finalLabel,
    language: language,
    domain: finalDomain,
    iconMode: iconMode,
    formId: formId
  });
  
  // Generate the unique URL with fallback
  const baseUrl = process.env.APP_URL || 
                  (process.env.NODE_ENV === 'production' ? 'https://formbuilder-v-9-final-2-partnerscaile.replit.app' : 'http://localhost:5000');
  const uniqueUrl = `${baseUrl}/embed?language=${language}&label=${encodeURIComponent(finalLabel)}&domain=${encodeURIComponent(finalDomain)}`;
  
  console.log("💾 SUPABASE - Generated URL:", uniqueUrl);
  
  // Update the label and URL
  await supabase
    .from('form_config')
    .update({ 
      label: finalLabel,
      url: uniqueUrl
    })
    .eq('id', formId);
    
  console.log("💾 SUPABASE - Updated form with label:", finalLabel);

  return formId;
}

/**
 * Fetches a form configuration by ID
 * @param id The form configuration ID
 * @returns The form configuration or null if not found
 */
export async function getFormConfig(id: number): Promise<{ id: number; label: string; config: FormConfig; created_at: string; user_uuid: string | null; form_console?: any; language: string; domain: string; url?: string; iconMode?: string } | null> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  console.log("🗄️ SUPABASE - getFormConfig called for ID:", id);
  
  const { data, error } = await supabase
    .from('form_config')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.log("❌ SUPABASE - Form config not found for ID:", id);
      return null; // Not found
    }
    console.error('❌ SUPABASE - Error fetching form config:', error);
    throw new Error(`Failed to fetch form config from Supabase: ${error.message}`);
  }

  // Map snake_case database fields to camelCase for frontend
  const mappedData = {
    ...data,
    iconMode: (data as any)?.icon_mode || 'lucide' // Map icon_mode to iconMode
  };

  console.log("✅ SUPABASE - Form config retrieved:", {
    id: mappedData?.id,
    label: mappedData?.label,
    iconMode: mappedData?.iconMode,
    hasConfig: !!mappedData?.config
  });

  return mappedData;
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
): Promise<{ id: number; label: string; config: FormConfig; created_at: string; user_uuid: string | null; form_console?: any; language: string; domain: string; url?: string; iconMode?: string } | null> {
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

  // Map snake_case database fields to camelCase for frontend
  const mappedData = {
    ...data,
    iconMode: (data as any)?.icon_mode || 'lucide' // Map icon_mode to iconMode
  };

  return mappedData;
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
 * Gets the next session number for a form
 * @param formId The form config ID
 * @returns The next session number to use
 */
export async function getNextSessionNumber(formId: number): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  const { data, error } = await supabase
    .from('form_responses')
    .select('session_no')
    .eq('form_config_id', formId)
    .order('session_no', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Supabase error getting next session number:', error);
    throw new Error(`Failed to get next session number: ${error.message}`);
  }

  // Return next session number (starting from 1 if no sessions exist)
  const maxSession = data?.[0]?.session_no || 0;
  return maxSession + 1;
}

/**
 * Creates a new session entry in form_responses for temporary response tracking
 * @param formId The form config ID  
 * @param sessionNo The session number
 * @param formData The form metadata (label, language, domain, etc.)
 * @returns The ID of the newly created session entry
 */
export async function createFormSession(
  formId: number,
  sessionNo: number,
  formData: {
    label: string;
    language?: string;
    domain?: string | null;
    userUuid?: string | null;
  }
): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  const { data, error } = await supabase
    .from('form_responses')
    .insert([
      {
        label: formData.label,
        language: formData.language || 'en',
        domain: formData.domain,
        form_config_id: formId,
        user_uuid: formData.userUuid,
        session_no: sessionNo,
        temp_response: {}, // Start with empty temp response
        response: null // Main response stays null until form is submitted
      }
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Supabase error creating form session:', error);
    throw new Error(`Failed to create form session: ${error.message}`);
  }

  console.log(`[Session] Created new session ${sessionNo} for form ${formId} with ID ${data.id}`);
  return data.id;
}

/**
 * Updates the temporary response for a session
 * @param sessionId The session entry ID
 * @param tempResponse The updated temporary response object
 */
export async function updateTempResponse(
  sessionId: number,
  tempResponse: Record<string, any>
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  const { error } = await supabase
    .from('form_responses')
    .update({ temp_response: tempResponse })
    .eq('id', sessionId);

  if (error) {
    console.error('Supabase error updating temp response:', error);
    throw new Error(`Failed to update temp response: ${error.message}`);
  }

  console.log(`[Session] Updated temp response for session ID ${sessionId}`);
}

/**
 * Gets existing session for a form (checks if there's an active session with null response)
 * Note: This function is now deprecated - we always create new sessions for each form interaction
 * @param formId The form config ID
 * @returns Session data if exists, null otherwise
 */
export async function getActiveSession(formId: number): Promise<{ id: number; session_no: number; temp_response: Record<string, any> } | null> {
  // Always return null to force creation of new sessions
  // This ensures each form interaction gets a fresh session
  return null;
}

/**
 * Completes a form session by updating the response field and clearing temp_response
 * @param sessionId The session entry ID
 * @param finalResponse The final form response data
 * @returns True if successful, false otherwise
 */
export async function completeFormSession(
  sessionId: number,
  finalResponse: Record<string, any>
): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  try {
    const { error } = await supabase
      .from('form_responses')
      .update({ 
        response: finalResponse,
        temp_response: null // Clear temp response since we now have the final response
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Supabase error completing form session:', error);
      return false;
    }

    console.log(`[Session] Completed session ${sessionId} - moved temp response to final response`);
    return true;
  } catch (error) {
    console.error('Error in completeFormSession:', error);
    return false;
  }
}

/**
 * Gets a session by ID
 * @param sessionId The session ID
 * @returns The session object or null if not found
 */
export async function getSessionById(sessionId: number): Promise<any> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  try {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Supabase error getting session by ID:', error);
      throw new Error(`Failed to get session: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getSessionById:', error);
    return null;
  }
}

/**
 * Gets the current session ID for a user's form interaction
 * @param formId The form config ID
 * @param sessionNo The session number
 * @returns The session ID if found, null otherwise
 */
export async function getSessionId(formId: number, sessionNo: number): Promise<number | null> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }

  try {
    const { data, error } = await supabase
      .from('form_responses')
      .select('id')
      .eq('form_config_id', formId)
      .eq('session_no', sessionNo)
      .is('response', null) // Only get sessions that haven't been completed yet
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Supabase error getting session ID:', error);
      throw new Error(`Failed to get session ID: ${error.message}`);
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in getSessionId:', error);
    return null;
  }
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
  updates: Partial<{ config: FormConfig; label: string; iconMode: string; }>
): Promise<boolean> {
  // Convert camelCase to snake_case for database columns
  const dbUpdates: any = {};
  if (updates.config) dbUpdates.config = updates.config;
  if (updates.label) dbUpdates.label = updates.label;
  if (updates.iconMode) dbUpdates.icon_mode = updates.iconMode; // Convert to snake_case
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  console.log("🗄️ SUPABASE - updateFormConfig called:", { id, updates, dbUpdates });
  
  const { error } = await supabase
    .from('form_config')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('❌ SUPABASE - Error updating form config:', error);
    return false;
  }

  console.log("✅ SUPABASE - Form config updated successfully");
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
 * Updates user webhook URL in Supabase
 * @param userId The user's ID
 * @param webhookUrl The webhook URL to save
 * @returns Success status
 */
export async function updateUserWebhook(userId: string, webhookUrl: string): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  try {
    console.log(`[Webhook] Attempting to update webhook for user ${userId} with URL: ${webhookUrl}`);
    const { error } = await supabase
      .from('users')
      .update({ "CRM_webhook": webhookUrl })
      .eq('uuid', userId);
      
    if (error) {
      console.error('Error updating user webhook:', error);
      return false;
    }
    
    console.log(`[Webhook] Successfully updated webhook for user ${userId}`);
    return true;
  } catch (err) {
    console.error('Error in updateUserWebhook:', err);
    return false;
  }
}

/**
 * Updates user privacy policy link in Supabase
 * @param userId The user's ID
 * @param privacyPolicyLink The privacy policy link to save
 * @returns Success status
 */
export async function updateUserPrivacyPolicy(userId: string, privacyPolicyLink: string): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  
  try {
    console.log(`[Privacy Policy] Attempting to update privacy policy for user ${userId} with URL: ${privacyPolicyLink}`);
    console.log(`[Privacy Policy] Supabase client initialized:`, !!supabase);
    
    const { data, error } = await supabase
      .from('users')
      .update({ "privacy_policy": privacyPolicyLink })
      .eq('uuid', userId)
      .select();
      
    console.log(`[Privacy Policy] Supabase response data:`, data);
    console.log(`[Privacy Policy] Supabase response error:`, error);
      
    if (error) {
      console.error('Error updating user privacy policy:', error);
      return false;
    }
    
    console.log(`[Privacy Policy] Successfully updated privacy policy for user ${userId}`);
    return true;
  } catch (err) {
    console.error('Error in updateUserPrivacyPolicy:', err);
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