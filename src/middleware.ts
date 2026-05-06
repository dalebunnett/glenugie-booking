import type { MiddlewareHandler } from 'astro';
import { getTokenFromRequest, isValidAdminToken, getAdminSecret } from './lib/admin-auth';

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  const { request, locals } = ctx;
  const url = new URL(request.url);
  const pathname = url.pathname;

  console.log('[middleware v2] 🔍 Checking path:', pathname);
  
  // ONLY protect /api/admin/* routes (NOT /api/debug-cookies)
  if (pathname.includes('/api/admin')) {
    // Skip auth check for these specific endpoints
    if (pathname.includes('/api/admin/auth') || 
        pathname.includes('/api/admin/debug') || 
        pathname.includes('/api/admin/test-')) {
      console.log('[middleware v2] ⏭️ Skipping auth check for:', pathname);
      return next();
    }
    
    console.log('[middleware v2] 🔒 Requiring auth for:', pathname);
    
    const token = getTokenFromRequest(request);
    const secret = getAdminSecret({ locals } as any);
    const isValid = token && isValidAdminToken(token, secret);
    
    console.log('[middleware v2] Token found:', !!token);
    console.log('[middleware v2] Secret available:', !!secret);
    console.log('[middleware v2] Token valid:', isValid);
    
    if (!isValid) {
      console.log('[middleware v2] ❌ Auth failed');
      return new Response(JSON.stringify({ 
        error: 'Unauthorized - Please log in again',
        version: 'v2'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('[middleware v2] ✅ Auth passed');
  } else {
    console.log('[middleware v2] ⏭️ Not admin API, skipping auth');
  }

  return next();
};
