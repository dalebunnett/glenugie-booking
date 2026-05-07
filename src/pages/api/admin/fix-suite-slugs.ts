import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';
import { verifyAdminAuth } from '../../../lib/admin-auth';

// Mapping of old suite names to correct slugs
const SUITE_NAME_TO_SLUG: Record<string, string> = {
  // Luxury Dog Suites
  'Sniffany Suite': 'sniffany-suite',
  'Woofdorf Suite': 'woofdorf-suite',
  'Barkingham Palace Suite': 'barkingham-palace-suite',
  'Nasherville Suite': 'nasherville-suite',
  'Lapdog land Suite': 'lapdog-land-suite',
  'Huntington Manor Suite': 'huntington-manor-suite',
  'Pawduree Suite': 'pawduree-suite',
  'Furrari Suite': 'furrari-suite',
  'Tail Away Suite': 'tail-away-suite',
  'The Fairy Dogmother Suite': 'the-fairy-dogmother-suite',
  
  // Cattery Suites
  'Clawrence House Suite': 'clawrence-house-suite',
  'Twitcher Suite': 'twitcher-suite',
  'Pussy Porchens Suite': 'pussy-porchens-suite',
  'Ragdoll Ranch Suite': 'ragdoll-ranch-suite',
  'Bengal Bay Suite': 'bengal-bay-suite',
  'Paws Palace Suite': 'paws-palace-suite',
  'Octopussy Suite': 'octopussy-suite',
  'Catsby Suite': 'catsby-suite',
  'Whiskers Lounge Suite': 'whiskers-lounge-suite',
  'Hairy Potter Suite': 'hairy-potter-suite',
  'Chalet Cat Suite': 'chalet-cat-suite',
  'Cleocatara Suite': 'cleocatara-suite',
  'Meowtel Suite': 'meowtel-suite',
  
  // Also handle variations without "Suite"
  'Sniffany': 'sniffany-suite',
  'Woofdorf': 'woofdorf-suite',
  'Barkingham Palace': 'barkingham-palace-suite',
  'Nasherville': 'nasherville-suite',
  'Lapdog land': 'lapdog-land-suite',
  'Huntington Manor': 'huntington-manor-suite',
  'Pawduree': 'pawduree-suite',
  'Furrari': 'furrari-suite',
  'Tail Away': 'tail-away-suite',
  'The Fairy Dogmother': 'the-fairy-dogmother-suite',
  'Clawrence House': 'clawrence-house-suite',
  'Twitcher': 'twitcher-suite',
  'Pussy Porchens': 'pussy-porchens-suite',
  'Ragdoll Ranch': 'ragdoll-ranch-suite',
  'Bengal Bay': 'bengal-bay-suite',
  'Paws Palace': 'paws-palace-suite',
  'Octopussy': 'octopussy-suite',
  'Catsby': 'catsby-suite',
  'Whiskers Lounge': 'whiskers-lounge-suite',
  'Hairy Potter': 'hairy-potter-suite',
  'Chalet Cat': 'chalet-cat-suite',
  'Cleocatara': 'cleocatara-suite',
  'Meowtel': 'meowtel-suite'
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request, locals);
    if (!authResult.authenticated) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[Fix Suite Slugs] Starting migration...');
    
    // Initialize DB
    const db = initDB(locals.runtime);
    
    // Get all bookings
    const bookings = await db.bookings.getAll();
    console.log(`[Fix Suite Slugs] Found ${bookings.length} bookings`);
    
    let fixedCount = 0;
    const updates: string[] = [];
    
    // Fix each booking
    const fixedBookings = bookings.map(booking => {
      if (booking.specificSuite && SUITE_NAME_TO_SLUG[booking.specificSuite]) {
        const oldSuite = booking.specificSuite;
        const newSlug = SUITE_NAME_TO_SLUG[booking.specificSuite];
        
        updates.push(`${booking.id}: "${oldSuite}" → "${newSlug}"`);
        fixedCount++;
        
        return {
          ...booking,
          specificSuite: newSlug
        };
      }
      return booking;
    });
    
    // Save updated bookings
    if (fixedCount > 0) {
      await db.bookings.getAll(); // Get storage instance
      const storage = (db as any).storageInstance || locals.runtime.env.BOOKINGS_KV;
      
      // Direct save to KV
      const kvStorage = locals.runtime.env.BOOKINGS_KV;
      await kvStorage.put('bookings', JSON.stringify(fixedBookings));
      
      console.log(`[Fix Suite Slugs] Fixed ${fixedCount} bookings`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      totalBookings: bookings.length,
      fixedCount,
      updates: updates.slice(0, 20), // Show first 20 updates
      message: `Successfully fixed ${fixedCount} bookings with incorrect suite names`
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('[Fix Suite Slugs] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
