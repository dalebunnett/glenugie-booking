



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
  // Get token from localStorage (fallback for when cookie isn't set yet)
  const token = localStorage.getItem('admin_session');
  
  if (token) {
    console.log('💾 Using token from localStorage for Authorization header');
  } else {
    console.log('ℹ️ No token in localStorage, relying on cookie (sent automatically)');
  }
  
  return {
    'Content-Type': 'application/json',
    // Add Authorization header as fallback (cookie is sent automatically)
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
  
  console.log(`[adminFetch] ${fetchOptions.method || 'GET'} ${url}`);
  
  // Make request with auth headers and credentials
  // credentials: 'include' ensures cookies are sent automatically
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });
  
  console.log(`[adminFetch] Response: ${response.status}`);
  
  // Handle auth failures - just log, don't redirect
  // Let the calling component decide what to do
  if (response.status === 403 || response.status === 401) {
    console.warn('[adminFetch] ⚠️ Authentication failed - token may be invalid');
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




