import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const kvNamespace = locals?.runtime?.env?.GLENUGIE_KV || (import.meta as any).env?.GLENUGIE_KV;
    
    if (!kvNamespace) {
      return new Response(JSON.stringify({
        success: false,
        error: 'KV namespace not found',
        available_bindings: Object.keys(locals?.runtime?.env || {}),
        locals_keys: Object.keys(locals || {}),
        runtime_keys: Object.keys(locals?.runtime || {}),
        env_keys: Object.keys(locals?.runtime?.env || {})
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Try to write a test value
    await kvNamespace.put('test-key', 'test-value-' + Date.now());
    
    // Try to read it back
    const value = await kvNamespace.get('test-key');
    
    // List all keys
    const list = await kvNamespace.list();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'KV is working!',
      test_write: 'success',
      test_read: value,
      total_keys: list.keys.length,
      keys: list.keys.map(k => k.name),
      binding_name: 'GLENUGIE_KV'
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
