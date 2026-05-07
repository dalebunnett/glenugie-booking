import type { APIRoute } from 'astro';
import { db, initDB } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const debug: any = {
    timestamp: new Date().toISOString(),
    environment: 'production',
    checks: {}
  };

  try {
    // Check 1: Runtime available
    debug.checks.runtime = {
      available: !!locals.runtime,
      type: typeof locals.runtime
    };

    // Check 2: KV namespace available
    if (locals.runtime?.env) {
      debug.checks.kvNamespace = {
        available: !!locals.runtime.env.GLENUGIE_BOOKINGS,
        type: typeof locals.runtime.env.GLENUGIE_BOOKINGS,
        methods: locals.runtime.env.GLENUGIE_BOOKINGS 
          ? Object.getOwnPropertyNames(Object.getPrototypeOf(locals.runtime.env.GLENUGIE_BOOKINGS))
          : []
      };
    } else {
      debug.checks.kvNamespace = {
        available: false,
        error: 'locals.runtime.env not available'
      };
    }

    // Check 3: Try to initialize DB
    try {
      initDB(locals.runtime);
      debug.checks.dbInit = {
        success: true,
        message: 'DB initialized successfully'
      };
    } catch (err) {
      debug.checks.dbInit = {
        success: false,
        error: err instanceof Error ? err.message : String(err)
      };
    }

    // Check 4: Try to fetch bookings
    try {
      const bookings = await db.bookings.getAll();
      debug.checks.fetchBookings = {
        success: true,
        count: bookings.length,
        sample: bookings.length > 0 ? {
          id: bookings[0].id,
          email: bookings[0].customerEmail,
          status: bookings[0].status
        } : null
      };
    } catch (err) {
      debug.checks.fetchBookings = {
        success: false,
        error: err instanceof Error ? err.message : String(err)
      };
    }

    // Check 5: Build version
    try {
      const buildVersion = await fetch(new URL('/BUILD_VERSION.txt', new URL(locals.url || 'http://localhost')));
      debug.checks.buildVersion = {
        available: buildVersion.ok,
        version: buildVersion.ok ? await buildVersion.text() : 'not found'
      };
    } catch (err) {
      debug.checks.buildVersion = {
        available: false,
        error: 'Could not fetch build version'
      };
    }

    return new Response(JSON.stringify(debug, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Debug check failed',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
