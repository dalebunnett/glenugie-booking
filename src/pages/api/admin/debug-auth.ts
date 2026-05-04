import type { APIRoute } from 'astro';
import { getTokenFromRequest, getAdminSecret, isValidAdminToken, generateAdminToken } from '../../../lib/admin-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const token = getTokenFromRequest(request);
    const secret = getAdminSecret({ locals } as any);
    
    // Generate a fresh token for comparison
    const freshToken = generateAdminToken(secret);
    
    // Debug token validation step by step
    let validationSteps: any = {};
    if (token) {
      const [timestamp, signature] = token.split('-');
      const sign = (data: string, secret: string): string => {
        let hash = 0;
        const combined = data + secret;
        for (let i = 0; i < combined.length; i++) {
          const char = combined.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
      };
      
      const expectedSig = sign(timestamp, secret);
      const tokenTime = parseInt(timestamp, 36);
      const now = Date.now();
      const age = now - tokenTime;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      
      validationSteps = {
        timestamp,
        signature: signature?.substring(0, 15) + '...',
        expectedSignature: expectedSig?.substring(0, 15) + '...',
        signaturesMatch: signature === expectedSig,
        tokenAge: age,
        tokenExpired: age >= sevenDays,
        tokenTime: new Date(tokenTime).toISOString(),
        now: new Date(now).toISOString()
      };
    }
    
    const debug = {
      hasToken: !!token,
      token: token ? token.substring(0, 30) + '...' : null,
      fullToken: token, // Include full token for debugging
      tokenValid: token ? isValidAdminToken(token, secret) : false,
      secret: secret.substring(0, 10) + '...',
      secretLength: secret.length,
      fullSecret: secret, // Include full secret for debugging
      freshToken: freshToken,
      cookies: request.headers.get('cookie'),
      authHeader: request.headers.get('authorization'),
      validationSteps
    };
    
    return new Response(JSON.stringify(debug, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

