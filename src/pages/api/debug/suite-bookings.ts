import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = initDB(locals.runtime);
    const allBookings = await db.bookings.getAll();
    
    // Find all bookings for specific suites
    const suiteBookings = allBookings.filter(b => 
      b.specificSuite?.toLowerCase().includes('lapdog') ||
      b.specificSuite?.toLowerCase().includes('tail away') ||
      b.specificSuite?.toLowerCase().includes('tail-away') ||
      b.specificSuite?.toLowerCase().includes('tailaway')
    );
    
    console.log('[Suite Debug] Found bookings:', suiteBookings.length);
    
    // Group by suite name
    const grouped: Record<string, any[]> = {};
    suiteBookings.forEach(b => {
      const suite = b.specificSuite || 'Unknown';
      if (!grouped[suite]) grouped[suite] = [];
      grouped[suite].push(b);
    });
    
    return new Response(JSON.stringify({
      count: suiteBookings.length,
      groupedBySuite: Object.entries(grouped).map(([suite, bookings]) => ({
        suiteName: suite,
        normalizedSlug: suite.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        bookingCount: bookings.length,
        bookings: bookings.map(b => ({
          id: b.id,
          customerName: b.customerName,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          status: b.status
        }))
      })),
      allBookings: suiteBookings.map(b => ({
        id: b.id,
        customerName: b.customerName,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status,
        accommodationType: b.accommodationType,
        specificSuite: b.specificSuite,
        kennelNumber: b.kennelNumber,
        normalizedSpecificSuite: b.specificSuite?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      }))
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Suite Debug] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
