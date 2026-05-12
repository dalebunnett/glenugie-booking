import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  console.log('[debug-kv] Checking KV configuration...');
  
  const kv = locals?.runtime?.env?.booking_kv;
  
  const debug = {
    hasLocals: !!locals,
    hasRuntime: !!locals?.runtime,
    hasEnv: !!locals?.runtime?.env,
    hasKV: !!kv,
    kvType: kv ? typeof kv : 'undefined',
    envKeys: locals?.runtime?.env ? Object.keys(locals.runtime.env) : []
  };
  
  console.log('[debug-kv] Debug info:', debug);
  
  if (!kv) {
    return new Response(JSON.stringify({
      error: 'KV namespace not found',
      debug
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Try to read the booking rules
    const rulesRaw = await kv.get('booking-rules');
    const bookingsRaw = await kv.get('bookings');
    const ratesRaw = await kv.get('rates');
    
    console.log('[debug-kv] Rules raw:', rulesRaw ? 'exists' : 'null');
    console.log('[debug-kv] Bookings raw:', bookingsRaw ? 'exists' : 'null');
    console.log('[debug-kv] Rates raw:', ratesRaw ? 'exists' : 'null');
    
    return new Response(JSON.stringify({
      success: true,
      debug,
      data: {
        hasRules: !!rulesRaw,
        hasBookings: !!bookingsRaw,
        hasRates: !!ratesRaw,
        rulesPreview: rulesRaw ? rulesRaw.substring(0, 100) : null,
        bookingsPreview: bookingsRaw ? bookingsRaw.substring(0, 100) : null,
        ratesPreview: ratesRaw ? ratesRaw.substring(0, 100) : null
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[debug-kv] Error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      debug
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

