import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const debug = {
    hasLocals: !!locals,
    hasRuntime: !!locals?.runtime,
    hasRuntimeEnv: !!locals?.runtime?.env,
    runtimeEnvKeys: locals?.runtime?.env ? Object.keys(locals.runtime.env) : [],
    hasBookingsKV: !!locals?.runtime?.env?.BOOKINGS_KV,
    bookingsKVType: locals?.runtime?.env?.BOOKINGS_KV ? typeof locals.runtime.env.BOOKINGS_KV : 'undefined',
    
    // Check if it's a KV namespace
    isKVNamespace: locals?.runtime?.env?.BOOKINGS_KV ? 
      typeof locals.runtime.env.BOOKINGS_KV.get === 'function' : false,
    
    // Environment variables (non-sensitive)
    hasAdminPassword: !!locals?.runtime?.env?.ADMIN_PASSWORD,
    hasAdminEmail: !!locals?.runtime?.env?.ADMIN_EMAIL,
  };

  return new Response(JSON.stringify(debug, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
