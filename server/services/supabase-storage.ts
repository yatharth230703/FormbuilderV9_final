
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Create Supabase client with service role key for storage operations
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Upload a document to Supabase Storage
 * @param file File buffer
 * @param fileName Original file name
 * @param mimeType File MIME type
 * @returns Public URL of the uploaded document
 */
export async function uploadDocumentToStorage(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
    // Generate a unique file name to avoid conflicts
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;

    // Upload file to the documentscaile bucket
    const { data, error } = await supabase.storage
      .from('documentscaile')
      .upload(uniqueFileName, file, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('documentscaile')
      .getPublicUrl(uniqueFileName);

    if (!publicUrlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded document');
    }

    console.log('Document uploaded successfully:', {
      fileName: uniqueFileName,
      publicUrl: publicUrlData.publicUrl
    });

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading document to Supabase Storage:', error);
    throw error;
  }
}

/**
 * Delete a document from Supabase Storage
 * @param fileName File name to delete
 * @returns Success status
 */
export async function deleteDocumentFromStorage(fileName: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('documentscaile')
      .remove([fileName]);

    if (error) {
      console.error('Supabase Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting document from Supabase Storage:', error);
    return false;
  }
}
