/**
 * Admin API Service
 * Handles communication with the backend admin API
 */

import { apiRequest } from '@/lib/queryClient';
import { AdminLoginRequest } from '@shared/types';

/**
 * Login as admin
 * @param email The admin email
 * @returns Login result
 */
export async function loginAsAdmin(email: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>({
    url: '/api/admin/login',
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Logout admin
 * @returns Logout result
 */
export async function logoutAdmin(): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>({
    url: '/api/admin/logout',
    method: 'POST',
  });
}

/**
 * Check admin authentication status
 * @returns Authentication status
 */
export async function checkAdminStatus(): Promise<{ 
  success: boolean; 
  isAuthenticated: boolean;
  user?: { 
    email: string; 
    isAdmin: boolean;
  }
}> {
  return apiRequest<{
    success: boolean;
    isAuthenticated: boolean;
    user?: {
      email: string;
      isAdmin: boolean;
    }
  }>({
    url: '/api/admin/status',
    method: 'GET',
  });
}

/**
 * Get all form responses
 * @returns List of form responses
 */
export async function getFormResponses(): Promise<{ 
  success: boolean; 
  data: Array<{
    id: number;
    label: string;
    submittedAt: string;
    responses: Record<string, any>;
  }> 
}> {
  return apiRequest<{
    success: boolean;
    data: Array<{
      id: number;
      label: string;
      submittedAt: string;
      responses: Record<string, any>;
    }>
  }>({
    url: '/api/admin/responses',
    method: 'GET',
  });
}

/**
 * Get responses for a specific form by label
 * @param label Form label
 * @returns Form responses
 */
export async function getFormResponsesByLabel(label: string): Promise<{ 
  success: boolean; 
  formLabel: string;
  data: Array<{
    id: number;
    label: string;
    submittedAt: string;
    responses: Record<string, any>;
  }> 
}> {
  return apiRequest<{
    success: boolean;
    formLabel: string;
    data: Array<{
      id: number;
      label: string;
      submittedAt: string;
      responses: Record<string, any>;
    }>
  }>({
    url: `/api/admin/responses/${encodeURIComponent(label)}`,
    method: 'GET',
  });
}

/**
 * Get all form configurations
 * @returns List of form configurations
 */
export async function getAdminForms(): Promise<{ 
  success: boolean; 
  data: Array<{
    id: number;
    label: string;
    createdAt: string;
    config: any;
  }> 
}> {
  return apiRequest<{
    success: boolean;
    data: Array<{
      id: number;
      label: string;
      createdAt: string;
      config: any;
    }>
  }>({
    url: '/api/admin/forms',
    method: 'GET',
  });
}