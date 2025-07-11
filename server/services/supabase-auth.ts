/**
 * This module handles authentication with Supabase ONLY
 * All database operations use Supabase - NO local database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Create Supabase client with anon key (for regular operations)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create admin Supabase client with service role key (for admin operations)
const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Register a new user with Supabase Auth and store user data in Supabase users table
 * @param email User's email
 * @param password User's password
 * @param username User's username
 * @param isAdmin Whether user has admin role (default: false)
 */
export async function registerUser(email: string, password: string, username: string, isAdmin: boolean = false) {
  // First create the user with Supabase Auth
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username
    }
  });

  if (authError) {
    console.error('Error registering user with Supabase Auth:', authError);
    throw new Error(`Failed to register user: ${authError.message}`);
  }

  // Store user data in Supabase users table
  try {
    const { data: userData, error: dbError } = await adminSupabase
      .from('users')
      .insert([
        {
          username,
          email,
          password: '[SUPABASE_AUTH]',
          is_admin: isAdmin,
          uuid: authData.user?.id,
          credits: 5
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Error storing user in Supabase users table:', dbError);
      // Clean up auth user if database insert fails
      await adminSupabase.auth.admin.deleteUser(authData.user?.id || '');
      throw new Error(`Failed to store user data: ${dbError.message}`);
    }

    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      isAdmin: userData.is_admin,
      uuid: userData.uuid
    };
  } catch (error) {
    // Clean up auth user if database operations fail
    if (authData.user?.id) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
    }
    throw error;
  }
}

/**
 * Login a user with Supabase Auth and get user data from Supabase users table
 */
export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error logging in user with Supabase Auth:', error);
    throw new Error(`Failed to login: ${error.message}`);
  }

  // Get user data from Supabase users table
  try {
    const { data: userData, error: dbError } = await adminSupabase
      .from('users')
      .select('*')
      .eq('uuid', data.user.id)
      .single();
    
    if (dbError || !userData) {
      console.log('User not found in Supabase users table, creating record for existing auth user');
      
      // Create a user record for this existing Supabase Auth user
      const userEmail = data.user.email || '';
      const username = data.user.user_metadata?.username || userEmail.split('@')[0] || 'user';
      
      if (!userEmail) {
        throw new Error('User email is required but not provided by Supabase Auth');
      }
      
      try {
        const { data: newUserData, error: insertError } = await adminSupabase
          .from('users')
          .insert([
            {
              username,
              email: userEmail,
              password: '[SUPABASE_AUTH]',
              is_admin: false,
              uuid: data.user.id,
              credits: 5
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user record in Supabase:', insertError);
          
          // If user already exists (duplicate key error), try to find and update existing user
          if (insertError.code === '23505') {
            console.log('User already exists, attempting to find and update existing user record');
            
            // Try to find existing user by email
            const { data: existingUser, error: findError } = await adminSupabase
              .from('users')
              .select('*')
              .eq('email', userEmail)
              .single();
            
            if (findError || !existingUser) {
              throw new Error(`Failed to find existing user: ${findError?.message || 'User not found'}`);
            }
            
            // Update existing user record with Supabase Auth UUID
            const { data: updatedUser, error: updateError } = await adminSupabase
              .from('users')
              .update({ uuid: data.user.id })
              .eq('id', existingUser.id)
              .select()
              .single();
            
            if (updateError) {
              throw new Error(`Failed to update existing user: ${updateError.message}`);
            }
            
            return {
              token: data.session.access_token,
              user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                isAdmin: updatedUser.is_admin,
                uuid: updatedUser.uuid
              }
            };
          }
          
          throw new Error(`Failed to create user record: ${insertError.message}`);
        }
        
        return {
          token: data.session.access_token,
          user: {
            id: newUserData.id,
            username: newUserData.username,
            email: newUserData.email,
            isAdmin: newUserData.is_admin,
            uuid: newUserData.uuid
          }
        };
      } catch (error: any) {
        console.error('Error creating user record:', error);
        throw new Error(`Failed to create user record: ${error.message}`);
      }
    }
    
    return {
      token: data.session.access_token,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        isAdmin: userData.is_admin,
        uuid: userData.uuid
      }
    };
  } catch (dbError: any) {
    console.error('Error fetching user data from Supabase users table:', dbError);
    throw new Error(`Failed to fetch user data: ${dbError.message || JSON.stringify(dbError)}`);
  }
}

/**
 * Get the current logged-in user from Supabase
 * @param supabaseUserId Optional supabase user ID from session
 */
export async function getCurrentUser(supabaseUserId?: string) {
  // If we have a supabaseUserId from the session, use that directly
  if (supabaseUserId) {
    try {
      console.log(`Looking up user by session supabaseUserId: ${supabaseUserId}`);
      
      const { data: userData, error: dbError } = await adminSupabase
        .from('users')
        .select('*')
        .eq('uuid', supabaseUserId)
        .single();
      
      if (!dbError && userData) {
        return {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          isAdmin: userData.is_admin,
          uuid: userData.uuid
        };
      }
      
      console.log(`No user found with uuid: ${supabaseUserId}`);
    } catch (dbError: any) {
      console.error('Error fetching user by session ID from Supabase users table:', dbError);
    }
  }
  
  // Fallback: try to get the user from Supabase auth
  try {
    console.log('Trying to get user from Supabase auth');
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.log('No authenticated user found in Supabase');
      return null;
    }

    // Get user data from Supabase users table
    try {
      const { data: userData, error: dbError } = await adminSupabase
        .from('users')
        .select('*')
        .eq('uuid', user.id)
        .single();
      
      if (dbError || !userData) {
        console.log('User authenticated in Supabase but not found in users table, creating record');
        
        // Create a user record for this existing Supabase Auth user
        const userEmail = user.email || '';
        const username = user.user_metadata?.username || userEmail.split('@')[0] || 'user';
        
        if (!userEmail) {
          console.error('User email is required but not provided by Supabase Auth');
          return null;
        }
        
        try {
          const { data: newUserData, error: insertError } = await adminSupabase
            .from('users')
            .insert([
              {
                username,
                email: userEmail,
                password: '[SUPABASE_AUTH]',
                is_admin: false,
                uuid: user.id,
                credits: 5
              }
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user record in Supabase:', insertError);
            
            // If username already exists, try with a unique suffix
            if (insertError.code === '23505') {
              const uniqueUsername = `${username}_${user.id.substring(0, 8)}`;
              const { data: retryUserData, error: retryError } = await adminSupabase
                .from('users')
                .insert([
                  {
                    username: uniqueUsername,
                    email: userEmail,
                    password: '[SUPABASE_AUTH]',
                    is_admin: false,
                    uuid: user.id,
                    credits: 5
                  }
                ])
                .select()
                .single();
              
              if (!retryError && retryUserData) {
                return {
                  id: retryUserData.id,
                  username: retryUserData.username,
                  email: retryUserData.email,
                  isAdmin: retryUserData.is_admin,
                  uuid: retryUserData.uuid
                };
              }
            }
            
            console.error('Failed to create user record in getCurrentUser');
            return null;
          }
          
          return {
            id: newUserData.id,
            username: newUserData.username,
            email: newUserData.email,
            isAdmin: newUserData.is_admin,
            uuid: newUserData.uuid
          };
        } catch (error: any) {
          console.error('Error creating user record in getCurrentUser:', error);
          return null;
        }
      }
      
      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        isAdmin: userData.is_admin,
        uuid: userData.uuid
      };
    } catch (dbError: any) {
      console.error('Error fetching user data from Supabase users table:', dbError);
      return null;
    }
  } catch (error) {
    console.error('Error getting user from Supabase auth:', error);
    return null;
  }
}

/**
 * Logout the current user
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out user:', error);
    throw new Error(`Failed to logout: ${error.message}`);
  }
  return true;
}

/**
 * Update user's role in Supabase
 */
export async function updateUserRole(userId: string, isAdmin: boolean) {
  try {
    const { data: userData, error: updateError } = await adminSupabase
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Failed to update user role: ${updateError.message}`);
    }
    
    if (!userData) {
      throw new Error('User not found');
    }
    
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      isAdmin: userData.is_admin,
      uuid: userData.uuid
    };
  } catch (dbError: any) {
    console.error('Error updating user role:', dbError);
    throw new Error(`Failed to update user role: ${dbError.message || JSON.stringify(dbError)}`);
  }
}