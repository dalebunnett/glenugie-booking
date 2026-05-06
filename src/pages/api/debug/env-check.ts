import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const env = locals?.runtime?.env;
  
  return new Response(JSON.stringify({
    hasEnv: !!env,
    hasResendKey: !!env?.RESEND_API_KEY,
    resendKeyLength: env?.RESEND_API_KEY?.length || 0,
    resendKeyPrefix: env?.RESEND_API_KEY?.substring(0, 10) || 'not found',
    allEnvKeys: env ? Object.keys(env) : [],
    importMetaEnv: {
      hasResendKey: !!import.meta.env.RESEND_API_KEY,
      resendKeyLength: import.meta.env.RESEND_API_KEY?.length || 0
    }
  }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
