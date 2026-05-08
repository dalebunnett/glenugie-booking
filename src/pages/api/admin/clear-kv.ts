import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals }) => {
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

    // Delete the old individual booking keys
    await kv.delete('booking:jan-booking-1');
    await kv.delete('booking:jan-booking-2');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Cleared old booking keys'
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

export const GET: APIRoute = async ({ locals }) => {
  return POST({ locals } as any);
};
