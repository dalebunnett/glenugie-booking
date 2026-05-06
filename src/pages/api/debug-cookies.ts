import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  // Get all cookies
  const cookies = request.headers.get('cookie') || 'No cookies found';
  const authHeader = request.headers.get('authorization') || 'No Authorization header';
  
  return new Response(JSON.stringify({
    message: 'Debug endpoint - NOT protected by middleware',
    cookies: cookies,
    authorization: authHeader,
    allHeaders: Object.fromEntries(request.headers.entries()),
  }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
