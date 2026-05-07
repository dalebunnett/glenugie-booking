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
      // FIRST: Check if this booking has a specific suite that matches
      if (booking.specificSuite === normalizedSlug) {
        console.log(`[Availability API] ✓ Match on specificSuite: ${booking.specificSuite}`);
        return true;
      }
      
      // SECOND: Check for general accommodation type matches
      // For luxury-suite as accommodation type (no specific suite selected)
      if (normalizedSlug === 'luxury-suite' && booking.accommodationType === 'luxury-suite') {
        console.log(`[Availability API] ✓ Match on luxury-suite type`);
        return true;
      }
      
      // For cattery as accommodation type (no specific suite selected)
      if (normalizedSlug === 'cattery' && booking.accommodationType === 'cattery') {
        console.log(`[Availability API] ✓ Match on cattery type`);
        return true;
      }
      
      // For standard kennels, match by accommodation type
      if (normalizedSlug === 'ruffs-retreat' && booking.accommodationType === 'ruffs-retreat') {
        console.log(`[Availability API] ✓ Match on ruffs-retreat`);
        return true;
      }
      
      if (normalizedSlug === 'village' && booking.accommodationType === 'village') {
        console.log(`[Availability API] ✓ Match on village`);
        return true;
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
