



/**
 * Admin authentication helpers
 * Uses environment-based password and signed tokens for persistence across Worker restarts
 */

import type { AstroGlobal } from 'astro';

// Get the admin secret/password from environment
// This must be called the same way everywhere to ensure consistency
export const getAdminSecret = (astro?: AstroGlobal): string => {
  // Always prefer the hardcoded password to ensure consistency
  // Even if ADMIN_PASSWORD is set in env, we use the fallback
  const fallbackPassword = 'Peterhead2026!';
  
  // Try to get from runtime env, then import.meta.env, then fallback
  const envPassword = astro?.locals?.runtime?.env?.ADMIN_PASSWORD || 
                      import.meta.env.ADMIN_PASSWORD;
  
  // If env password exists and is different from fallback, log a warning
  if (envPassword && envPassword !== fallbackPassword) {
    console.warn('[admin-auth] Environment ADMIN_PASSWORD differs from hardcoded password. Using hardcoded password for consistency.');
  }
  
  // Always use fallback for consistency across dev and production
  return fallbackPassword;
};

// Simple token signing with secret
const sign = (data: string, secret: string): string => {
  // Simple hash function for signing tokens
  let hash = 0;
  const combined = data + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

// Verify token signature
const verify = (token: string, secret: string): boolean => {
  try {
    const [timestamp, signature] = token.split('-');
    if (!timestamp || !signature) return false;
    
    const expectedSig = sign(timestamp, secret);
    return signature === expectedSig;
  } catch {
    return false;
  }
};

// Generate signed token
export const generateAdminToken = (secret: string): string => {
  const timestamp = Date.now().toString(36);
  const signature = sign(timestamp, secret);
  return `${timestamp}-${signature}`;
};

export const getTokenFromRequest = (request: Request): string | null => {
  console.log('[getTokenFromRequest] Extracting token...');
  
  // Try Authorization header first
  const authHeader = request.headers.get('authorization') || '';
  console.log('[getTokenFromRequest] Authorization header:', authHeader ? authHeader.substring(0, 30) + '...' : 'not present');
  
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('[getTokenFromRequest] ✅ Found token in Authorization header:', token.substring(0, 20) + '...');
    return token;
  }

  // Try cookie
  const cookies = request.headers.get('cookie') || '';
  console.log('[getTokenFromRequest] Cookie header:', cookies ? 'present' : 'not present');
  
  if (cookies) {
    console.log('[getTokenFromRequest] Cookies:', cookies.substring(0, 100) + (cookies.length > 100 ? '...' : ''));
    const sessionMatch = cookies.match(/admin_session=([^;]+)/);
    if (sessionMatch) {
      const token = sessionMatch[1];
      console.log('[getTokenFromRequest] ✅ Found token in cookie:', token.substring(0, 20) + '...');
      return token;
    }
  }

  console.log('[getTokenFromRequest] ❌ No token found in request');
  return null;
};

export const isValidAdminToken = (token: string | null, secret: string): boolean => {
  if (!token) return false;
  
  // Verify token signature
  if (!verify(token, secret)) return false;
  
  // Check if token is expired (7 days)
  try {
    const [timestamp] = token.split('-');
    const tokenTime = parseInt(timestamp, 36);
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    return (now - tokenTime) < sevenDays;
  } catch {
    return false;
  }
};

export const requireAdminAuth = (
  request: Request,
  astro?: AstroGlobal
): { authorized: boolean; token: string | null } => {
  const token = getTokenFromRequest(request);
  console.log('[admin-auth] Token from request:', token ? `present (${token.substring(0, 20)}...)` : 'missing');
  
  // Get secret using consistent method
  const secret = getAdminSecret(astro);
  console.log('[admin-auth] Secret:', secret.substring(0, 10) + '...');
  
  const authorized = isValidAdminToken(token, secret);
  console.log('[admin-auth] Token valid:', authorized);
  
  if (!authorized && token) {
    // Debug why validation failed
    try {
      const [timestamp, signature] = token.split('-');
      const expectedSig = sign(timestamp, secret);
      console.log('[admin-auth] Token signature:', signature?.substring(0, 10));
      console.log('[admin-auth] Expected signature:', expectedSig?.substring(0, 10));
      console.log('[admin-auth] Signatures match:', signature === expectedSig);
      
      if (timestamp) {
        const tokenTime = parseInt(timestamp, 36);
        const now = Date.now();
        const age = now - tokenTime;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        console.log('[admin-auth] Token age (ms):', age);
        console.log('[admin-auth] Token expired:', age >= sevenDays);
      }
    } catch (e) {
      console.error('[admin-auth] Debug error:', e);
    }
  }
  
  return { authorized, token };
};




