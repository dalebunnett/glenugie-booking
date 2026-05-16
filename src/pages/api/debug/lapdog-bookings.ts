import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = initDB(locals.runtime);
    const allBookings = await db.bookings.getAll();
    
    // Find all bookings that might be Lapdog Land
    const lapdogBookings = allBookings.filter(b => 
      b.specificSuite?.toLowerCase().includes('lapdog') ||
      b.accommodationType?.toLowerCase().includes('lapdog')
    );
    
    console.log('[Lapdog Debug] Found bookings:', lapdogBookings.length);
    
    return new Response(JSON.stringify({
      count: lapdogBookings.length,
      bookings: lapdogBookings.map(b => ({
        id: b.id,
        customerName: b.customerName,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status,
        accommodationType: b.accommodationType,
        specificSuite: b.specificSuite,
        kennelNumber: b.kennelNumber,
        // Show what the normalized slug would be
        normalizedSpecificSuite: b.specificSuite?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        normalizedAccommodationType: b.accommodationType?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      }))
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Lapdog Debug] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
