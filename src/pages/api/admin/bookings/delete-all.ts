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
    
    return new Response(JSON.stringify({ 
      success: true, 
      deletedCount,
      message: `Successfully deleted ${deletedCount} bookings`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
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

