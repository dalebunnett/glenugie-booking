import type { APIRoute } from 'astro';
import { deleteAllBookings } from '../../../../lib/storage';
import { requireAdminAuth } from '../../../../lib/admin-auth';

export const DELETE: APIRoute = async ({ request, locals }) => {
  // Check authentication
  const authResult = requireAdminAuth(request, { locals } as any);
  if (!authResult.authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('[DELETE /api/admin/bookings/delete-all] Deleting all bookings...');
    
    const deletedCount = await deleteAllBookings(locals);
    
    console.log(`[DELETE /api/admin/bookings/delete-all] Deleted ${deletedCount} bookings`);
    
    // Verify deletion by reading back
    const { initializeStorage } = await import('../../../../lib/storage');
    const storage = initializeStorage(locals.runtime);
    const remainingBookings = await storage.getBookings();
    
    console.log(`[DELETE /api/admin/bookings/delete-all] Verification: ${remainingBookings.length} bookings remaining`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      deletedCount,
      remainingCount: remainingBookings.length,
      message: `Successfully deleted ${deletedCount} bookings. ${remainingBookings.length} remaining.`
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('[DELETE /api/admin/bookings/delete-all] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete bookings',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};



