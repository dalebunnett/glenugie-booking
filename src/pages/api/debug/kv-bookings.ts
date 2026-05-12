import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    console.log('[Debug KV] Checking KV storage...');
    console.log('[Debug KV] Runtime:', !!locals.runtime);
    console.log('[Debug KV] Runtime.env:', !!locals.runtime?.env);
    console.log('[Debug KV] booking_kv:', !!locals.runtime?.env?.booking_kv);
    
    // Initialize DB with runtime
    const database = initDB(locals.runtime);
    
    // Get all bookings
    const bookings = await database.bookings.getAll();
    
    console.log(`[Debug KV] Found ${bookings.length} bookings in KV`);
    
    // Get sample bookings
    const sampleBookings = bookings.slice(0, 5).map(b => ({
      id: b.id,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      accommodationType: b.accommodationType,
      specificSuite: b.specificSuite,
      status: b.status,
      kennelNumber: b.kennelNumber
    }));
    
    return new Response(JSON.stringify({
      success: true,
      totalBookings: bookings.length,
      sampleBookings,
      kvAvailable: !!locals.runtime?.env?.booking_kv,
      runtimeAvailable: !!locals.runtime
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[Debug KV] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack,
      kvAvailable: !!locals.runtime?.env?.booking_kv,
      runtimeAvailable: !!locals.runtime
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
