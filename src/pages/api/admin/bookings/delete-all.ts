import type { APIRoute } from 'astro';
import { deleteAllBookings } from '../../../../lib/storage';

export const DELETE: APIRoute = async ({ locals }) => {
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
