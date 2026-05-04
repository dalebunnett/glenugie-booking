import type { APIRoute } from 'astro';
import { generateAdminToken, getTokenFromRequest, isValidAdminToken, getAdminSecret } from '../../../lib/admin-auth';

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
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate signed token using the same secret
    const secret = correctPassword;
    const token = generateAdminToken(secret);
    
    console.log('[Auth] Login successful, token generated');

    // Set session cookie that lasts 7 days
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds

    return new Response(JSON.stringify({ 
      token,
      success: true,
      message: 'Login successful'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `admin_session=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax; Secure`
      }
    });
  } catch (error) {
    console.error('[Auth] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
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
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ valid: true, token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Auth] Verification error:', error);
    return new Response(JSON.stringify({ valid: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Logout endpoint
export const DELETE: APIRoute = async ({ request }) => {
  try {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure'
      }
    });
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

