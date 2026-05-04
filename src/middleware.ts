import type {MiddlewareHandler} from 'astro';

// Token verification function (matches the one in auth.ts)
const verifySessionToken = (token: string): boolean => {
  try {
    const [tokenString, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = btoa(`${tokenString}-Peterhead2026!-secret-key`).substring(0, 16);
    if (signature !== expectedSignature) {
      return false;
    }
    
    // Parse token
    const tokenData = JSON.parse(atob(tokenString));
    
    // Check expiry
    const now = Date.now();
    if (now > tokenData.exp) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  const {request} = ctx;
  const url = new URL(request.url);

  // Check if this is an admin API endpoint (except auth endpoint)
  const isAdminApi = url.pathname.includes('/api/admin');
  const isAuthEndpoint = url.pathname.includes('/api/admin/auth');
  
  if (isAdminApi && !isAuthEndpoint) {
    // Get session token from Authorization header first, then cookie
    const authHeader = request.headers.get('authorization') || '';
    const headerSessionToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const cookies = request.headers.get('cookie') || '';
    const sessionMatch = cookies.match(/admin_session=([^;]+)/);
    const cookieSessionToken = sessionMatch ? sessionMatch[1] : null;
    
    const sessionToken = headerSessionToken || cookieSessionToken;

    // Verify the token
    if (!sessionToken || !verifySessionToken(sessionToken)) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Please log in again' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return next();
};










