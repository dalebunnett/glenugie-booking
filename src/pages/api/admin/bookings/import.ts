import type { APIRoute } from 'astro';
import { db, initDB } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Initialize storage with KV binding
    initDB(locals.runtime);
    
    const { bookings } = await request.json();
    
    if (!Array.isArray(bookings)) {
      return new Response(JSON.stringify({ error: 'Invalid format: bookings must be an array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const imported: any[] = [];
    const errors: any[] = [];

    for (const booking of bookings) {
      try {
        // Validate booking has required fields
        if (!booking.checkIn || !booking.checkOut || !booking.accommodationType) {
          errors.push({
            booking,
            error: 'Missing required fields (checkIn, checkOut, accommodationType)'
          });
          continue;
        }

        // Generate ID if not provided
        if (!booking.id) {
          booking.id = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        }

        // Set timestamps
        booking.createdAt = booking.createdAt || new Date().toISOString();
        booking.updatedAt = new Date().toISOString();

        // Create booking (now async)
        const created = await db.bookings.create(booking);
        imported.push(created);
      } catch (error) {
        errors.push({
          booking,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      imported: imported.length,
      errors: errors.length,
      details: { imported, errors }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error importing bookings:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to import bookings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};






