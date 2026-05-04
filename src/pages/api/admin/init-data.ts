import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { requireAdminAuth } from '../../../lib/admin-auth';

// Import the bookings data
import bookingsData from '../../../../bookings-data.json';

export const POST: APIRoute = async ({ request, locals }) => {
  // Check authentication
  const { authorized } = requireAdminAuth(request, { locals } as any);
  if (!authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Initialize storage with bookings data
    await db.storage.initialize({
      bookings: bookingsData.bookings || [],
      bookingRules: bookingsData.bookingRules || (await db.bookingRules.get()),
      rates: bookingsData.rates || (await db.rates.get())
    });

    const count = bookingsData.bookings?.length || 0;
    console.log(`[Init] Loaded ${count} bookings from file`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Initialized with ${count} bookings`,
      count 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Init] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to initialize data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


