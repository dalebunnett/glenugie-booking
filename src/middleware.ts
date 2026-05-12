import type { MiddlewareHandler } from 'astro';
import { getTokenFromRequest, isValidAdminToken, getAdminSecret } from './lib/admin-auth';

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  const { request, locals } = ctx;
  const url = new URL(request.url);
  const pathname = url.pathname;

  console.log('[middleware] 🔍 Checking path:', pathname);
  
  // Add no-cache headers for admin pages
  if (pathname.includes('/admin')) {
    console.log('[middleware] 🚫 Adding no-cache headers for admin page');
    const response = await next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
  
  // Allow init-staging endpoint without auth (for staging setup)
  if (pathname.includes('/api/admin/init-staging')) {
    console.log('[middleware] ⏭️ Skipping auth for init-staging');
    return next();
  }
  
  // ONLY protect /api/admin/* routes (NOT /api/debug-cookies)
  if (pathname.includes('/api/admin')) {
    // Skip auth check for these specific endpoints
    if (pathname.includes('/api/admin/auth') || 
        pathname.includes('/api/admin/debug') || 
        pathname.includes('/api/admin/test-')) {
      console.log('[middleware] ⏭️ Skipping auth check for:', pathname);
      return next();
    }
    
    console.log('[middleware] 🔒 Requiring auth for:', pathname);
    
    const token = getTokenFromRequest(request);
    const secret = getAdminSecret({ locals } as any);
    const isValid = token && isValidAdminToken(token, secret);
    
    console.log('[middleware] Token found:', !!token);
    console.log('[middleware] Token value:', token ? `${token.substring(0, 20)}...` : 'none');
    console.log('[middleware] Secret available:', !!secret);
    console.log('[middleware] Token valid:', isValid);
    
    if (!isValid) {
      console.log('[middleware] ❌ Auth failed - returning 401');
      return new Response(JSON.stringify({ 
        error: 'Unauthorized - Invalid or missing token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('[middleware] ✅ Auth passed');
  } else {
    console.log('[middleware] ⏭️ Not admin API, skipping auth');
  }

  return next();
};






