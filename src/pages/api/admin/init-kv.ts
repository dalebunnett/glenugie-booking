import type { APIRoute } from 'astro';
import { initializeStorage } from '../../../lib/storage';
import { requireAdminAuth } from '../../../lib/admin-auth';

export const POST: APIRoute = async ({ request, locals }) => {
  console.log('[init-kv] Initializing KV storage...');
  
  // Check authentication
  const authResult = requireAdminAuth(request, { locals } as any);
  if (!authResult.authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const storage = initializeStorage(locals.runtime);
    
    // Initialize with defaults (will only create if missing)
    await storage.initialize();
    
    console.log('[init-kv] KV storage initialized successfully');
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'KV storage initialized with default values'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[init-kv] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to initialize KV storage',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
