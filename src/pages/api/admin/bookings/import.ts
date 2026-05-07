import type { APIRoute } from 'astro';
import { db, initDB } from '../../../../lib/db';

// Process bookings in smaller batches to avoid timeout
const BATCH_SIZE = 50;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    console.log('[Import] Starting import process');
    
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

    // Limit total bookings to prevent timeout
    if (bookings.length > 500) {
      return new Response(JSON.stringify({ 
        error: 'Too many bookings. Please import in batches of 500 or fewer.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const imported: any[] = [];
    const errors: any[] = [];

    // Process in batches
    for (let i = 0; i < bookings.length; i += BATCH_SIZE) {
      const batch = bookings.slice(i, i + BATCH_SIZE);
      console.log(`[Import] Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} bookings)`);
      
      // Process batch in parallel for speed
      const batchResults = await Promise.allSettled(
        batch.map(async (booking) => {
          // Validate booking has required fields
          if (!booking.checkIn || !booking.checkOut || !booking.accommodationType) {
            throw new Error('Missing required fields (checkIn, checkOut, accommodationType)');
          }

          // Generate ID if not provided
          if (!booking.id) {
            booking.id = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          }

          // Set timestamps
          booking.createdAt = booking.createdAt || new Date().toISOString();
          booking.updatedAt = new Date().toISOString();

          // Create booking
          return await db.bookings.create(booking);
        })
      );

      // Collect results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          imported.push(result.value);
        } else {
          errors.push({
            booking: batch[index],
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
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
      details: { 
        imported: imported.slice(0, 10), // Only return first 10 for preview
        errors: errors.slice(0, 10) // Only return first 10 errors
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
