import type { APIRoute } from 'astro';
import { initializeStorage } from '../../../../lib/storage';

// Smaller batch size to avoid resource limits
const BATCH_SIZE = 100;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    console.log('[Import] Starting import process');
    
    // Initialize storage with KV binding
    const storage = initializeStorage(locals.runtime);
    console.log('[Import] Storage initialized');
    
    const { bookings } = await request.json();
    console.log('[Import] Received', bookings?.length || 0, 'bookings in request');
    
    if (!Array.isArray(bookings)) {
      return new Response(JSON.stringify({ error: 'Invalid format: bookings must be an array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Limit total bookings to prevent timeout
    if (bookings.length > 500) {
      return new Response(JSON.stringify({ 
        error: 'Too many bookings. Please import in batches of 500 or fewer.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get existing bookings
    const existingBookings = await storage.getBookings();
    console.log('[Import] Existing bookings:', existingBookings.length);

    const imported: any[] = [];
    const errors: any[] = [];
    const now = new Date().toISOString();

    // Process bookings with minimal validation
    for (const booking of bookings) {
      try {
        // Basic validation only
        if (!booking.checkIn || !booking.checkOut || !booking.accommodationType) {
          errors.push({
            booking,
            error: 'Missing required fields'
          });
          continue;
        }

        // Generate ID if not provided
        if (!booking.id) {
          booking.id = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        }

        // Set timestamps
        booking.createdAt = booking.createdAt || now;
        booking.updatedAt = now;

        imported.push(booking);
      } catch (error) {
        errors.push({
          booking,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Save all bookings at once (existing + new)
    const allBookings = [...existingBookings, ...imported];
    await storage.saveBookings(allBookings);

    console.log('[Import] Import complete. Imported:', imported.length, 'Errors:', errors.length);

    return new Response(JSON.stringify({ 
      success: true,
      imported: imported.length,
      errors: errors.length,
      totalBookingsInDB: allBookings.length,
      details: { 
        imported: imported.slice(0, 5), // Only return first 5 for preview
        errors: errors.slice(0, 5) // Only return first 5 errors
      }
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

