import type { APIRoute } from 'astro';
import { initializeStorage } from '../../../lib/storage';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const storage = initializeStorage(locals.runtime);
    const allBookings = await storage.getBookings();
    
    // Get sample bookings for each type
    const luxurySuite = allBookings.find(b => 
      b.accommodationType === 'luxury-suite' || 
      b.specificSuite?.includes('sniffany') ||
      b.specificSuite?.includes('woofdorf')
    );
    
    const cattery = allBookings.find(b => 
      b.accommodationType === 'cattery' ||
      b.specificSuite?.includes('clawrence') ||
      b.specificSuite?.includes('twitcher')
    );
    
    const ruffs = allBookings.find(b => 
      b.accommodationType === 'ruffs-retreat' ||
      b.specificSuite === 'ruffs-retreat'
    );
    
    const village = allBookings.find(b => 
      b.accommodationType === 'village' ||
      b.specificSuite === 'village' ||
      b.accommodationType === 'the-village'
    );

    return new Response(JSON.stringify({
      total: allBookings.length,
      samples: {
        luxurySuite,
        cattery,
        ruffs,
        village
      },
      // Show all unique accommodation types
      accommodationTypes: [...new Set(allBookings.map(b => b.accommodationType))],
      // Show all unique specific suites
      specificSuites: [...new Set(allBookings.map(b => b.specificSuite).filter(Boolean))]
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
