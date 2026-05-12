import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const kv = locals?.runtime?.env?.booking_kv;
  
  const result = {
    kvAvailable: !!kv,
    kvType: kv ? typeof kv : 'undefined',
    envKeys: locals?.runtime?.env ? Object.keys(locals.runtime.env) : [],
    canWrite: false,
    canRead: false,
    testData: null as any
  };

  if (kv) {
    try {
      // Test write
      await kv.put('test-key', JSON.stringify({ test: true, timestamp: Date.now() }));
      result.canWrite = true;

      // Test read
      const data = await kv.get('test-key', 'json');
      result.canRead = !!data;
      result.testData = data;
    } catch (error: any) {
      result.testData = { error: error.message };
    }
  }

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
