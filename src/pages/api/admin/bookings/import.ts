import type { APIRoute } from 'astro';
import { db, initDB } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    console.log('[Import] Starting import process');
    console.log('[Import] Locals available:', !!locals);
    console.log('[Import] Locals.runtime:', !!locals?.runtime);
    
    // Initialize storage with KV binding
    initDB(locals.runtime);
    console.log('[Import] DB initialized');
    
    const { bookings } = await request.json();
    console.log('[Import] Received', bookings?.length || 0, 'bookings in request');
    
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

        console.log('[Import] Creating booking:', booking.id);
        
        // Create booking (now async)
        const created = await db.bookings.create(booking);
        console.log('[Import] Booking created successfully:', created.id);
        imported.push(created);
      } catch (error) {
        console.error('[Import] Error creating booking:', error);
        errors.push({
          booking,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('[Import] Import complete. Imported:', imported.length, 'Errors:', errors.length);
    
    // Verify bookings were saved
    const allBookings = await db.bookings.getAll();
    console.log('[Import] Total bookings after import:', allBookings.length);

    return new Response(JSON.stringify({ 
      success: true,
      imported: imported.length,
      errors: errors.length,
      totalBookingsInDB: allBookings.length,
      details: { imported, errors }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Import] Fatal error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to import bookings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};







