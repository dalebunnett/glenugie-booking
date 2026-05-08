import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const kv = locals?.runtime?.env?.BOOKINGS_KV;
    
    if (!kv) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'KV storage not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete the main bookings key
    await kv.delete('bookings');
    
    // Also delete old individual booking keys if they exist
    await kv.delete('booking:jan-booking-1');
    await kv.delete('booking:jan-booking-2');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Cleared all bookings from KV'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Clear error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};



