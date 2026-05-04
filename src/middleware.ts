import type { MiddlewareHandler } from 'astro';
import { getTokenFromRequest, isValidAdminToken, getAdminSecret } from './lib/admin-auth';

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  const { request, locals } = ctx;
  const url = new URL(request.url);

  // Check if this is an admin API endpoint (except auth and debug endpoints)
  const isAdminApi = url.pathname.includes('/api/admin');
  const isAuthEndpoint = url.pathname.includes('/api/admin/auth');
  const isDebugEndpoint = url.pathname.includes('/api/admin/debug-auth');
  
  if (isAdminApi && !isAuthEndpoint && !isDebugEndpoint) {
    // Get token from request (checks Authorization header and cookie)
    const token = getTokenFromRequest(request);
    
    // Get secret consistently
    const secret = getAdminSecret({ locals } as any);
    
    // Verify the token
    if (!token || !isValidAdminToken(token, secret)) {
      console.log('[middleware] Token validation failed for:', url.pathname);
      console.log('[middleware] Token:', token ? token.substring(0, 20) + '...' : 'missing');
      
      return new Response(JSON.stringify({ error: 'Unauthorized - Please log in again' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('[middleware] Token validated successfully for:', url.pathname);
  }

  return next();
};
