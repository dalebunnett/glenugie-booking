import type { APIRoute } from 'astro';
import { db, initDB } from '../../../lib/db';

// Helper function to normalize suite names to slugs
function normalizeToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

    // Normalize slug for comparison
    const normalizedSlug = normalizeToSlug(slug);
    console.log(`[Availability API] Looking for normalized slug: ${normalizedSlug}`);

    // Filter bookings for this specific kennel/suite
    const kennelBookings = activeBookings.filter(booking => {
      // Normalize the booking's specific suite for comparison
      const bookingSpecificSuite = booking.specificSuite 
        ? normalizeToSlug(booking.specificSuite)
        : null;
      
      const bookingAccommodationType = booking.accommodationType 
        ? normalizeToSlug(booking.accommodationType)
        : null;

      // FIRST: Check if this booking has a specific suite that matches
      if (bookingSpecificSuite === normalizedSlug) {
        console.log(`[Availability API] ✓ Match on specificSuite: ${booking.specificSuite} -> ${bookingSpecificSuite}`);
        return true;
      }
      
      // SECOND: Check for general accommodation type matches
      if (bookingAccommodationType === normalizedSlug) {
        console.log(`[Availability API] ✓ Match on accommodationType: ${booking.accommodationType} -> ${bookingAccommodationType}`);
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

