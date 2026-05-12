import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';
import { requireAdminAuth } from '../../../lib/admin-auth';

export const POST: APIRoute = async ({ request, locals }) => {
  initDB(locals.runtime);
  
  const authResult = requireAdminAuth(request, { locals } as any);
  if (!authResult.authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const kv = locals.runtime.env.BOOKINGS_KV;
    
    // List all keys
    const list = await kv.list();
    let deletedCount = 0;
    
    // Delete each key
    for (const key of list.keys) {
      await kv.delete(key.name);
      deletedCount++;
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: `Cleared ${deletedCount} items from KV storage`,
      deletedCount
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    console.error('[Clear Everything] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to clear storage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
