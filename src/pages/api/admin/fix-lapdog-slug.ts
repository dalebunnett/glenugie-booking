import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';
import { requireAdminAuth } from '../../../lib/admin-auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Verify admin authentication
    const authResult = requireAdminAuth(request);
    if (!authResult.authorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[Fix Lapdog Slug] Starting fix...');
    
    // Initialize DB
    const db = initDB(locals.runtime);
    
    // Get all bookings
    const bookings = await db.bookings.getAll();
    console.log(`[Fix Lapdog Slug] Found ${bookings.length} bookings`);
    
    let fixedCount = 0;
    const updates: string[] = [];
    
    // Fix each booking with old lapdog-land slug
    const fixedBookings = bookings.map(booking => {
      let updated = false;
      const changes: string[] = [];
      
      // Fix specificSuite if it's lapdog-land
      if (booking.specificSuite === 'lapdog-land') {
        changes.push(`specificSuite: "lapdog-land" → "lapdog-land-suite"`);
        booking.specificSuite = 'lapdog-land-suite';
        updated = true;
      }
      
      // Fix accommodationType if it's lapdog-land
      if (booking.accommodationType === 'lapdog-land') {
        changes.push(`accommodationType: "lapdog-land" → "lapdog-land-suite"`);
        booking.accommodationType = 'lapdog-land-suite';
        updated = true;
      }
      
      if (updated) {
        fixedCount++;
        updates.push(`Booking ${booking.id} (${booking.customerName}): ${changes.join(', ')}`);
      }
      
      return booking;
    });
    
    // Save updated bookings directly to KV
    if (fixedCount > 0) {
      const kvStorage = locals.runtime.env.booking_kv;
      await kvStorage.put('bookings', JSON.stringify(fixedBookings));
      
      console.log(`[Fix Lapdog Slug] Fixed ${fixedCount} bookings`);
      console.log('[Fix Lapdog Slug] Updates:', updates);
    }
    
    return new Response(JSON.stringify({
      success: true,
      totalBookings: bookings.length,
      fixedCount,
      updates,
      message: fixedCount > 0 
        ? `Successfully fixed ${fixedCount} bookings with old 'lapdog-land' slug` 
        : 'No bookings needed fixing'
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('[Fix Lapdog Slug] Error:', error);
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
