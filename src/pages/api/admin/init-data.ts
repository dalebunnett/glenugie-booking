import type { APIRoute } from 'astro';
import { db, initDB } from '../../../lib/db';
import { requireAdminAuth } from '../../../lib/admin-auth';
import { initializeStorage } from '../../../lib/storage';

// Import the bookings data
import bookingsData from '../../../../bookings-data.json';

export const POST: APIRoute = async ({ request, locals }) => {
  // DISABLED: This endpoint is deprecated and should not be used
  // The old cached frontend code was calling this automatically on login
  // which was re-loading 498 bookings every time
  return new Response(JSON.stringify({ 
    error: 'This endpoint is disabled. Please use the manual "Load Test Data" button instead.',
    success: false,
    count: 0
  }), {
    status: 410, // Gone
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    }
  });
  
  // Initialize DB with KV binding
  initDB(locals.runtime);
  
  // Check authentication
  const authResult = requireAdminAuth(request, { locals } as any);
  if (!authResult.authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get storage instance
    const storage = initializeStorage(locals.runtime);
    
    // Initialize storage with bookings data
    await storage.initialize({
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









