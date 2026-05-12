import type { APIRoute } from 'astro';
import { requireAdminAuth } from '../../../lib/admin-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  // Check authentication
  const authResult = requireAdminAuth(request, { locals } as any);
  if (!authResult.authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const kv = locals?.runtime?.env?.booking_kv;
    
    if (!kv) {
      return new Response(JSON.stringify({ 
        error: 'KV storage not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Read directly from KV
    const bookingsRaw = await kv.get('bookings');
    const bookings = bookingsRaw ? JSON.parse(bookingsRaw) : null;

    return new Response(JSON.stringify({ 
      success: true,
      bookingsCount: bookings ? bookings.length : 0,
      bookings: bookings,
      rawValue: bookingsRaw ? bookingsRaw.substring(0, 200) + '...' : null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
