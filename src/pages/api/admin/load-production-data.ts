import type { APIRoute } from 'astro';
import { db, initDB } from '../../../lib/db';
import { requireAdminAuth } from '../../../lib/admin-auth';

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
    // Load bookings from GitHub
    const githubUrl = 'https://raw.githubusercontent.com/dalebunnett/glenugie-booking/main/data/bookings.json';
    const response = await fetch(githubUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from GitHub: ${response.statusText}`);
    }
    
    const testBookings = await response.json();
    console.log(`[Load Production Data] Found ${testBookings.length} bookings from GitHub`);
    
    // Get existing bookings
    const existingBookings = await db.bookings.getAll();
    console.log(`[Load Production Data] Existing bookings in KV: ${existingBookings.length}`);
    
    // Merge bookings with existing (avoid duplicates by ID)
    const existingIds = new Set(existingBookings.map(b => b.id));
    const newBookings = testBookings.filter((b: any) => !existingIds.has(b.id));
    
    console.log(`[Load Production Data] New bookings to add: ${newBookings.length}`);
    
    // Add all new bookings
    for (const booking of newBookings) {
      await db.bookings.create(booking);
    }
    
    const totalCount = existingBookings.length + newBookings.length;
    console.log(`[Load Production Data] Total bookings in KV: ${totalCount}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Loaded ${newBookings.length} new bookings from GitHub. Total: ${totalCount}`,
      count: newBookings.length,
      total: totalCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Load Production Data] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to load production data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
