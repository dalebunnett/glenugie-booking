/**
 * Admin authentication helpers
 * Uses environment-based password and signed tokens for persistence across Worker restarts
 */

import type { AstroGlobal } from 'astro';

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
  // Try Authorization header first
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const cookies = request.headers.get('cookie') || '';
  const sessionMatch = cookies.match(/admin_session=([^;]+)/);
  if (sessionMatch) {
    return sessionMatch[1];
  }

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
  
  // Get secret from environment
  const secret = astro?.locals?.runtime?.env?.ADMIN_PASSWORD || 
                 import.meta.env.ADMIN_PASSWORD || 
                 'Peterhead2026!';
  
  const authorized = isValidAdminToken(token, secret);
  
  return { authorized, token };
};
