import type { APIRoute } from 'astro';
import { getStorage } from '../../../lib/storage';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const checkIn = url.searchParams.get('checkIn');
    const checkOut = url.searchParams.get('checkOut');
    const accommodationType = url.searchParams.get('accommodationType');
    const specificSuite = url.searchParams.get('specificSuite');
    const excludeBookingId = url.searchParams.get('excludeBookingId');

    if (!checkIn || !checkOut || !accommodationType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const storage = getStorage(locals?.runtime?.env);
    const allBookings = await storage.bookings.getAll();

    // Filter active bookings (exclude cancelled and optionally the booking being edited)
    const activeBookings = allBookings.filter(
      (b) => b.status !== 'cancelled' && b.id !== excludeBookingId
    );

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
    console.error('Availability check error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to check availability' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
