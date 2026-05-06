import type { APIRoute } from 'astro';
import { getTokenFromRequest, isValidAdminToken, getAdminSecret } from '../../../lib/admin-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    headers: {},
    token: {
      found: false,
      location: null,
      value: null,
      valid: false,
      details: {}
    },
    environment: {
      hasLocals: !!locals,
      hasRuntime: !!locals?.runtime,
      hasEnv: !!locals?.runtime?.env,
      adminPasswordSet: !!(locals?.runtime?.env?.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD)
    }
  };

  // Check headers
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');
  
  diagnostics.headers.authorization = authHeader ? `present (${authHeader.substring(0, 30)}...)` : 'missing';
  diagnostics.headers.cookie = cookieHeader ? `present (${cookieHeader.substring(0, 50)}...)` : 'missing';

  // Try to get token
  const token = getTokenFromRequest(request);
  
  if (token) {
    diagnostics.token.found = true;
    diagnostics.token.value = `${token.substring(0, 20)}...`;
    
    // Determine location
    if (authHeader?.includes(token)) {
      diagnostics.token.location = 'Authorization header';
    } else if (cookieHeader?.includes(token)) {
      diagnostics.token.location = 'Cookie';
    }
    
    // Validate token
    const secret = getAdminSecret({ locals } as any);
    const valid = isValidAdminToken(token, secret);
    
    diagnostics.token.valid = valid;
    
    // Parse token details
    try {
      const [timestamp, signature] = token.split('-');
      if (timestamp && signature) {
        const tokenTime = parseInt(timestamp, 36);
        const now = Date.now();
        const age = now - tokenTime;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        
        diagnostics.token.details = {
          timestamp: new Date(tokenTime).toISOString(),
          ageHours: Math.round(age / (1000 * 60 * 60)),
          expired: age >= sevenDays,
          signature: signature.substring(0, 10) + '...'
        };
      }
    } catch (e) {
      diagnostics.token.details.error = 'Failed to parse token';
    }
  }

  return new Response(JSON.stringify(diagnostics, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
