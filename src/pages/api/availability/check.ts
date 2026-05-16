import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const checkIn = url.searchParams.get('checkIn');
    const checkOut = url.searchParams.get('checkOut');
    const accommodationType = url.searchParams.get('accommodationType');
    const specificSuite = url.searchParams.get('specificSuite');
    const excludeBookingId = url.searchParams.get('excludeBookingId');

    console.log('[Availability Check] Params:', { checkIn, checkOut, accommodationType, specificSuite, excludeBookingId });

    if (!checkIn || !checkOut || !accommodationType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = initDB(locals?.runtime);
    console.log('[Availability Check] DB initialized');
    
    const allBookings = await db.bookings.getAll();
    console.log('[Availability Check] Got bookings:', allBookings.length);

    // Filter active bookings (exclude cancelled and optionally the booking being edited)
    const activeBookings = allBookings.filter(
      (b) => b.status !== 'cancelled' && b.id !== excludeBookingId
    );
    console.log('[Availability Check] Active bookings:', activeBookings.length);

    // Check for conflicts
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const conflicts = activeBookings.filter((booking) => {
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);

      // Check if dates overlap
      const datesOverlap =
        checkInDate < bookingCheckOut && checkOutDate > bookingCheckIn;

      if (!datesOverlap) return false;

      // Check if accommodation matches
      if (specificSuite) {
        return booking.specificSuite === specificSuite;
      } else {
        return booking.accommodationType === accommodationType;
      }
    });

    console.log('[Availability Check] Conflicts found:', conflicts.length);

    if (conflicts.length > 0) {
      return new Response(
        JSON.stringify({
          available: false,
          message: 'This accommodation is not available for the selected dates',
          conflicts: conflicts.length,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        available: true,
        message: 'Available for booking',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Availability Check] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to check availability',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};


