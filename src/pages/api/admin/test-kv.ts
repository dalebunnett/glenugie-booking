import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';
import { requireAdminAuth } from '../../../lib/admin-auth';

export const GET: APIRoute = async ({ request, locals, url }) => {
  initDB(locals.runtime);
  
  const authResult = requireAdminAuth(request, { locals } as any);
  if (!authResult.authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const action = url.searchParams.get('action') || 'check';
  const kv = locals.runtime.env.BOOKINGS_KV;

  try {
    if (action === 'check') {
      // Check what's in KV
      const list = await kv.list();
      const bookingKeys = list.keys.filter(k => k.name.startsWith('booking:'));
      
      return new Response(JSON.stringify({ 
        success: true,
        totalKeys: list.keys.length,
        bookingKeys: bookingKeys.length,
        allKeys: list.keys.map(k => k.name)
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      });
    }
    
    if (action === 'clear') {
      // Clear everything
      const list = await kv.list();
      for (const key of list.keys) {
        await kv.delete(key.name);
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        message: `Cleared ${list.keys.length} keys`
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Invalid action. Use ?action=check or ?action=clear'
    }), {
      status: 400,
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
