import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import type { Booking } from '../../../lib/booking-types';

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Accommodation slug is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const allBookings = await db.bookings.getAll();
    const activeBookings = allBookings.filter(b => b.status !== 'cancelled');

    // Normalize slug for village
    const normalizedSlug = slug === 'the-village' ? 'village' : slug;

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

    // Return only necessary booking info (no personal details)
    const publicBookings = kennelBookings.map(booking => ({
      id: booking.id,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      numberOfNights: booking.numberOfNights,
      status: booking.status,
      petCount: booking.pets.length,
      kennelNumber: booking.kennelNumber // Include kennel number for multi-kennel types
    }));

    return new Response(JSON.stringify(publicBookings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch availability' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};




