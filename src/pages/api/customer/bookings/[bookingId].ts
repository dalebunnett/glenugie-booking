import type { APIRoute } from 'astro';
import { getStorage } from '../../../../lib/storage';
import type { Booking } from '../../../../lib/booking-types';

// GET - Get single booking
export const GET: APIRoute = async ({ params, locals, cookies }) => {
  try {
    const sessionId = cookies.get('customer_session')?.value;
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const storage = getStorage(locals?.runtime?.env);
    const session = await storage.sessions.get(sessionId);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const booking = await storage.bookings.get(params.bookingId!);
    
    if (!booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify booking belongs to customer
    if (booking.customerEmail !== session.customer.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(booking), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch booking' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PATCH - Update booking
export const PATCH: APIRoute = async ({ params, request, locals, cookies }) => {
  try {
    const sessionId = cookies.get('customer_session')?.value;
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const storage = getStorage(locals?.runtime?.env);
    const session = await storage.sessions.get(sessionId);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const booking = await storage.bookings.get(params.bookingId!);
    
    if (!booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify booking belongs to customer
    if (booking.customerEmail !== session.customer.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Only allow editing if booking is pending or confirmed
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return new Response(JSON.stringify({ error: 'Cannot edit cancelled or completed bookings' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updates = await request.json();

    // Update booking
    const updatedBooking: Booking = {
      ...booking,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await storage.bookings.update(params.bookingId!, updatedBooking);

    return new Response(JSON.stringify(updatedBooking), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to update booking' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE - Cancel booking
export const DELETE: APIRoute = async ({ params, locals, cookies }) => {
  try {
    const sessionId = cookies.get('customer_session')?.value;
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const storage = getStorage(locals?.runtime?.env);
    const session = await storage.sessions.get(sessionId);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const booking = await storage.bookings.get(params.bookingId!);
    
    if (!booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify booking belongs to customer
    if (booking.customerEmail !== session.customer.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return new Response(JSON.stringify({ error: 'Booking already cancelled' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate refund based on cancellation policy
    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let refundPercentage = 0;
    let refundPolicy = '';
    
    if (daysUntilCheckIn >= 14) {
      refundPercentage = 100;
      refundPolicy = 'Full refund (14+ days notice)';
    } else if (daysUntilCheckIn >= 7) {
      refundPercentage = 50;
      refundPolicy = '50% refund (7-13 days notice)';
    } else {
      refundPercentage = 0;
      refundPolicy = 'No refund (less than 7 days notice)';
    }

    const refundAmount = (booking.paidAmount || 0) * (refundPercentage / 100);

    // Update booking status
    const cancelledBooking: Booking = {
      ...booking,
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    };

    await storage.bookings.update(params.bookingId!, cancelledBooking);

    return new Response(JSON.stringify({
      success: true,
      booking: cancelledBooking,
      refund: {
        percentage: refundPercentage,
        amount: refundAmount,
        policy: refundPolicy
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to cancel booking' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
