import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const kv = locals?.runtime?.env?.BOOKINGS_KV;
    
    if (!kv) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'KV not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Try to read the 'bookings' key directly
    const bookingsRaw = await kv.get('bookings');
    const bookingsJson = await kv.get('bookings', 'json');
    
    // List all keys in KV
    const list = await kv.list();
    
    return new Response(JSON.stringify({
      success: true,
      bookingsRaw: bookingsRaw ? bookingsRaw.substring(0, 200) : null,
      bookingsJson: bookingsJson,
      allKeys: list.keys.map(k => k.name),
      totalKeys: list.keys.length
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
