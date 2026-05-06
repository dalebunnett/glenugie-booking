import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../lib/admin-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  console.log('=== AUTH TEST ===');
  console.log('Request URL:', request.url);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  const { authorized, token } = requireAdminAuth(request, { locals } as any);
  
  const result = {
    authorized,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 30) + '...' : null,
    headers: {
      authorization: request.headers.get('authorization'),
      cookie: request.headers.get('cookie')
    },
    cookies: {} as Record<string, string>
  };
  
  // Parse cookies
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      result.cookies[name] = value;
    });
  }
  
  console.log('Test result:', result);
  
  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
