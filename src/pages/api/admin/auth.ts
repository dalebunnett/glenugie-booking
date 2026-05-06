import type { APIRoute } from 'astro';
import { generateAdminToken, getTokenFromRequest, isValidAdminToken, getAdminSecret } from '../../../lib/admin-auth';
import { baseUrl } from '../../../lib/base-url';

// CORS headers for preview environments
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Password',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle preflight requests
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { password } = await request.json();

    // Get password using consistent method
    const correctPassword = getAdminSecret({ locals } as any);

    console.log('[Auth] Login attempt');
    
    if (password !== correctPassword) {
      console.log('[Auth] Invalid password');
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Generate signed token using the same secret
    const secret = correctPassword;
    const token = generateAdminToken(secret);
    
    console.log('[Auth] Login successful, token generated:', token.substring(0, 20) + '...');
    console.log('[Auth] Request URL:', request.url);
    console.log('[Auth] Setting cookies with Secure:', request.url.startsWith('https://'));

    // Set session cookie that lasts 7 days
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    
    // Determine if we should use Secure flag (only on HTTPS)
    const isSecure = request.url.startsWith('https://');
    const securePart = isSecure ? '; Secure' : '';
    
    // Set multiple cookies to ensure it works:
    // 1. Cookie at root path
    // 2. Cookie at /app path (for backwards compatibility)
    const cookieOptions = `Max-Age=${maxAge}; HttpOnly; SameSite=Lax${securePart}`;
    const cookies = [
      `admin_session=${token}; Path=/; ${cookieOptions}`,
      `admin_session=${token}; Path=/app; ${cookieOptions}`,
    ];

    return new Response(JSON.stringify({ 
      token,
      success: true,
      message: 'Login successful'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookies.join(', '),
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('[Auth] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};

// Verify token endpoint
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const token = getTokenFromRequest(request);
    const secret = getAdminSecret({ locals } as any);

    if (!isValidAdminToken(token, secret)) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    return new Response(JSON.stringify({ valid: true, token }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('[Auth] Verification error:', error);
    return new Response(JSON.stringify({ valid: false }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};

// Logout endpoint
export const DELETE: APIRoute = async ({ request }) => {
  try {
    // Determine if we should use Secure flag (only on HTTPS)
    const isSecure = request.url.startsWith('https://');
    const securePart = isSecure ? '; Secure' : '';
    
    // Always use root path '/' for cookies
    const cookiePath = '/';

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `admin_session=; Path=${cookiePath}; Max-Age=0; HttpOnly; SameSite=Lax${securePart}`,
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};









