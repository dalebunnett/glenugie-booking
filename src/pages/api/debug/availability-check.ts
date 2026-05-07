import type { APIRoute } from 'astro';
import { db, initDB } from '../../../lib/db';

export const GET: APIRoute = async ({ url, locals }) => {
  const slug = url.searchParams.get('slug') || 'luxury-suite';
  
  const debug: any = {
    timestamp: new Date().toISOString(),
    requestedSlug: slug,
    checks: {}
  };

  try {
    // Initialize DB
    initDB(locals.runtime);
    debug.checks.dbInit = { success: true };

    // Get all bookings
    const allBookings = await db.bookings.getAll();
    debug.checks.totalBookings = {
      count: allBookings.length,
      sample: allBookings.length > 0 ? {
        id: allBookings[0].id,
        accommodationType: allBookings[0].accommodationType,
        specificSuite: allBookings[0].specificSuite,
        checkIn: allBookings[0].checkIn,
        checkOut: allBookings[0].checkOut,
        status: allBookings[0].status
      } : null
    };

    // Get active bookings
    const activeBookings = allBookings.filter(b => b.status !== 'cancelled');
    debug.checks.activeBookings = {
      count: activeBookings.length
    };

    // Normalize slug
    const normalizedSlug = slug === 'the-village' ? 'village' : slug;
    debug.normalizedSlug = normalizedSlug;

    // Filter for this kennel
    const kennelBookings = activeBookings.filter(booking => {
      if (normalizedSlug === 'luxury-suite') {
        return booking.accommodationType === 'luxury-suite';
      }
      if (normalizedSlug === 'cattery') {
        return booking.accommodationType === 'cattery';
      }
      if (booking.accommodationType === 'luxury-suite' && booking.specificSuite) {
        return booking.specificSuite === normalizedSlug;
      }
      if (booking.accommodationType === 'cattery' && booking.specificSuite) {
        return booking.specificSuite === normalizedSlug;
      }
      if (normalizedSlug === 'ruffs-retreat') {
        return booking.accommodationType === 'ruffs-retreat';
      }
      if (normalizedSlug === 'village') {
        return booking.accommodationType === 'village';
      }
      return false;
    });

    debug.checks.kennelBookings = {
      count: kennelBookings.length,
      bookings: kennelBookings.map(b => ({
        id: b.id,
        accommodationType: b.accommodationType,
        specificSuite: b.specificSuite,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status,
        kennelNumber: b.kennelNumber
      }))
    };

    // Show all unique accommodation types and suites
    const accommodationTypes = new Set(allBookings.map(b => b.accommodationType));
    const specificSuites = new Set(
      allBookings
        .filter(b => b.specificSuite)
        .map(b => `${b.accommodationType}:${b.specificSuite}`)
    );

    debug.checks.availableTypes = {
      accommodationTypes: Array.from(accommodationTypes),
      specificSuites: Array.from(specificSuites)
    };

    return new Response(JSON.stringify(debug, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Debug check failed',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
