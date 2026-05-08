import type { APIRoute } from 'astro';
import bookingsData from '../../../../data/bookings.json';

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

    // Store all bookings as a single array under 'bookings' key
    await kv.put('bookings', JSON.stringify(bookingsData));

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Loaded ${bookingsData.length} bookings into KV storage`,
      count: bookingsData.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Init error:', error);
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
  // Allow GET for easy browser access
  return POST({ locals } as any);
};


