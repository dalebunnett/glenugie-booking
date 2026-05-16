import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = initDB(locals.runtime);
    const allBookings = await db.bookings.getAll();
    
    console.log('[Debug All] Total bookings:', allBookings.length);
    
    // Group by suite name
    const suiteGroups: Record<string, number> = {};
    allBookings.forEach(booking => {
      const suite = booking.specificSuite || booking.accommodationType || 'Unknown';
      suiteGroups[suite] = (suiteGroups[suite] || 0) + 1;
    });
    
    return new Response(JSON.stringify({
      totalBookings: allBookings.length,
      suiteBreakdown: suiteGroups,
      allBookings: allBookings.map(b => ({
        id: b.id,
        customerName: b.customerName,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status,
        accommodationType: b.accommodationType,
        specificSuite: b.specificSuite,
        kennelNumber: b.kennelNumber
      })).sort((a, b) => {
        const suiteA = a.specificSuite || a.accommodationType || '';
        const suiteB = b.specificSuite || b.accommodationType || '';
        return suiteA.localeCompare(suiteB);
      })
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Debug All] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
