/**
 * Admin API fetch utility
 * Automatically includes authentication token in all admin API requests
 */

import { baseUrl } from './base-url';

export interface AdminFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Get authentication headers for admin API requests
 */
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('admin_session');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

/**
 * Fetch wrapper for admin API calls that automatically includes auth token
 */
export async function adminFetch(
  endpoint: string,
  options: AdminFetchOptions = {}
): Promise<Response> {
  const { skipAuth, ...fetchOptions } = options;
  
  // Build full URL
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  
  // Merge headers
  const headers = skipAuth
    ? (fetchOptions.headers || {})
    : {
        ...getAuthHeaders(),
        ...(fetchOptions.headers || {})
      };
  
  // Make request with auth headers and credentials
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });
  
  // Handle auth failures
  if (response.status === 403 || response.status === 401) {
    console.error('[adminFetch] Authentication failed');
    
    // Clear auth data
    localStorage.removeItem('admin_session');
    sessionStorage.removeItem('admin_authenticated');
    
    // Redirect to login
    window.location.href = `${baseUrl}/admin`;
  }
  
  return response;
}

/**
 * Convenient wrapper for GET requests
 */
export async function adminGet(endpoint: string): Promise<Response> {
  return adminFetch(endpoint, { method: 'GET' });
}

/**
 * Convenient wrapper for POST requests
 */
export async function adminPost(
  endpoint: string,
  body?: any
): Promise<Response> {
  return adminFetch(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenient wrapper for PUT requests
 */
export async function adminPut(
  endpoint: string,
  body?: any
): Promise<Response> {
  return adminFetch(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenient wrapper for DELETE requests
 */
export async function adminDelete(endpoint: string): Promise<Response> {
  return adminFetch(endpoint, { method: 'DELETE' });
}
