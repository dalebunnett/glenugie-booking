import type { APIRoute } from 'astro';
import { db, initDB } from '../../../lib/db';
import { requireAdminAuth } from '../../../lib/admin-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  console.log('[booking-rules] GET request received');
  
  // Initialize DB with KV binding
  initDB(locals.runtime);
  
  // Check authentication
  const authResult = requireAdminAuth(request, { locals } as any);
  if (!authResult.authorized) {
    console.log('[booking-rules] ❌ Unauthorized');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  console.log('[booking-rules] ✅ Auth successful, fetching rules');
  
  try {
    const rules = await db.bookingRules.get();
    console.log('[booking-rules] Rules fetched successfully');
    return new Response(JSON.stringify(rules), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[booking-rules] Error fetching rules:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch booking rules' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  // Initialize DB with KV binding
  initDB(locals.runtime);
  
  // Check authentication for updates
  const authResult = requireAdminAuth(request, { locals } as any);
  if (!authResult.authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const updates = await request.json();
    const updated = await db.bookingRules.update(updates);
    
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating booking rules:', error);
    return new Response(JSON.stringify({ error: 'Failed to update booking rules' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};












