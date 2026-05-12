import type { APIRoute } from 'astro';
import { db, initDB } from '../../../lib/db';
import { requireAdminAuth } from '../../../lib/admin-auth';
import { initializeStorage } from '../../../lib/storage';

// Import the bookings data
import bookingsData from '../../../../bookings-data.json';

export const POST: APIRoute = async ({ request, locals }) => {
  // DISABLED IMMEDIATELY: Return error before doing anything
  // This prevents the old cached frontend from reloading bookings on login
  console.log('[Init-Data] BLOCKED: This endpoint is disabled');
  return new Response(JSON.stringify({ 
    error: 'This endpoint is disabled. Bookings will NOT be reloaded.',
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
  
  // OLD CODE BELOW - NEVER REACHED
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










