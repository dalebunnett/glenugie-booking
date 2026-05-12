import type { APIRoute } from 'astro';
import { db, initDB } from '../../../lib/db';
import { requireAdminAuth } from '../../../lib/admin-auth';
import { readFileSync } from 'fs';
import { join } from 'path';

export const POST: APIRoute = async ({ request, locals }) => {
  // Initialize DB with KV binding
  initDB(locals.runtime);
  
  // Check authentication
  const authResult = requireAdminAuth(request, { locals } as any);
  if (!authResult.authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Load test data from data/bookings.json
    const dataPath = join(process.cwd(), 'data', 'bookings.json');
    const testBookings = JSON.parse(readFileSync(dataPath, 'utf-8'));
    
    console.log(`[Load Test Data] Found ${testBookings.length} test bookings`);
    
    // Get existing bookings
    const existingBookings = await db.bookings.getAll();
    console.log(`[Load Test Data] Existing bookings in KV: ${existingBookings.length}`);
    
    // Merge test bookings with existing (avoid duplicates by ID)
    const existingIds = new Set(existingBookings.map(b => b.id));
    const newBookings = testBookings.filter((b: any) => !existingIds.has(b.id));
    
    console.log(`[Load Test Data] New bookings to add: ${newBookings.length}`);
    
    // Add all new bookings
    for (const booking of newBookings) {
      await db.bookings.create(booking);
    }
    
    const totalCount = existingBookings.length + newBookings.length;
    console.log(`[Load Test Data] Total bookings in KV: ${totalCount}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Loaded ${newBookings.length} new bookings. Total: ${totalCount}`,
      count: newBookings.length,
      total: totalCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Load Test Data] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to load test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

