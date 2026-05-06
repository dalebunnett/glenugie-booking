import type { APIRoute } from 'astro';
import { getTokenFromRequest, isValidAdminToken, getAdminSecret } from '../../../lib/admin-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  const token = getTokenFromRequest(request);
  const secret = getAdminSecret({ locals } as any);
  const isValid = token && isValidAdminToken(token, secret);
  
  // Get all cookies
  const cookies = request.headers.get('cookie') || '';
  
  return new Response(JSON.stringify({
    message: 'Middleware test endpoint',
    tokenFound: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : null,
    secretAvailable: !!secret,
    tokenValid: isValid,
    cookies: cookies,
    allHeaders: Object.fromEntries(request.headers.entries()),
  }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
