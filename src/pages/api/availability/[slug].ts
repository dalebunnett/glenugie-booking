import type { APIRoute } from 'astro';
import { db, initDB } from '../../../lib/db';

export const GET: APIRoute = async ({ params, locals }) => {
  const { slug } = params;

  if (!slug) {
    return new Response(JSON.stringify({ 
      error: 'Accommodation slug is required',
      bookings: []
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Initialize DB with runtime to use KV storage
    initDB(locals.runtime);
    
    const allBookings = await db.bookings.getAll();
    console.log(`[Availability API] Total bookings in system: ${allBookings.length}`);
    
    const activeBookings = allBookings.filter(b => b.status !== 'cancelled');
    console.log(`[Availability API] Active bookings: ${activeBookings.length}`);

    // Normalize slug for village
    const normalizedSlug = slug === 'the-village' ? 'village' : slug;
    console.log(`[Availability API] Looking for slug: ${normalizedSlug}`);

    // Filter bookings for this specific kennel/suite
    const kennelBookings = activeBookings.filter(booking => {
      // For luxury-suite as accommodation type (no specific suite selected)
      if (normalizedSlug === 'luxury-suite') {
        return booking.accommodationType === 'luxury-suite';
      }
      
      // For cattery as accommodation type (no specific suite selected)
      if (normalizedSlug === 'cattery') {
        return booking.accommodationType === 'cattery';
      }
      
      // For luxury suites, match by specific suite slug (already stored as slug)
      if (booking.accommodationType === 'luxury-suite' && booking.specificSuite) {
        return booking.specificSuite === normalizedSlug;
      }
      
      // For cattery, match by specific suite slug (already stored as slug)
      if (booking.accommodationType === 'cattery' && booking.specificSuite) {
        return booking.specificSuite === normalizedSlug;
      }
      
      // For standard kennels, match by accommodation type
      if (normalizedSlug === 'ruffs-retreat') {
        return booking.accommodationType === 'ruffs-retreat';
      }
      
      if (normalizedSlug === 'village') {
        return booking.accommodationType === 'village';
      }
      
      return false;
    });

    console.log(`[Availability API] Bookings for ${normalizedSlug}: ${kennelBookings.length}`);
    if (kennelBookings.length > 0) {
      console.log(`[Availability API] Sample booking:`, {
        checkIn: kennelBookings[0].checkIn,
        checkOut: kennelBookings[0].checkOut,
        accommodationType: kennelBookings[0].accommodationType,
        specificSuite: kennelBookings[0].specificSuite
      });
    }

    // Return bookings with consistent field names for the calendar component
    const publicBookings = kennelBookings.map(booking => ({
      id: booking.id,
      checkInDate: booking.checkIn,  // Map checkIn to checkInDate
      checkOutDate: booking.checkOut, // Map checkOut to checkOutDate
      numberOfNights: booking.numberOfNights,
      status: booking.status,
      petName: booking.pets && booking.pets.length > 0 ? booking.pets[0].name : 'Guest',
      petCount: booking.pets.length,
      kennelNumber: booking.kennelNumber,
      accommodationType: booking.accommodationType,
      specificSuite: booking.specificSuite
    }));

    return new Response(JSON.stringify({ 
      bookings: publicBookings,
      total: publicBookings.length,
      slug: normalizedSlug
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Availability API] Error fetching availability:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch availability',
      message: error instanceof Error ? error.message : 'Unknown error',
      bookings: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
