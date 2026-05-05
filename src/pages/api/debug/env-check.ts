import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    runtime: {
      available: !!locals?.runtime,
      env: {
        available: !!locals?.runtime?.env,
        keys: locals?.runtime?.env ? Object.keys(locals.runtime.env) : []
      }
    },
    kvBinding: {
      available: !!locals?.runtime?.env?.BOOKINGS_KV,
      name: 'BOOKINGS_KV'
    },
    environment: {
      ADMIN_PASSWORD: locals?.runtime?.env?.ADMIN_PASSWORD ? '✓ Set' : '✗ Missing',
      STRIPE_SECRET_KEY: locals?.runtime?.env?.STRIPE_SECRET_KEY ? '✓ Set' : '✗ Missing',
      RESEND_API_KEY: locals?.runtime?.env?.RESEND_API_KEY ? '✓ Set' : '✗ Missing',
    },
    tests: {
      kvRead: null as any,
      kvWrite: null as any,
      dbInit: null as any,
      bookingsCount: null as any
    }
  };

  // Test KV read/write
  if (locals?.runtime?.env?.BOOKINGS_KV) {
    try {
      const testKey = 'test-' + Date.now();
      const testValue = { test: true, timestamp: Date.now() };
      
      // Test write
      await locals.runtime.env.BOOKINGS_KV.put(testKey, JSON.stringify(testValue));
      diagnostics.tests.kvWrite = '✓ Success';
      
      // Test read
      const readValue = await locals.runtime.env.BOOKINGS_KV.get(testKey, 'json');
      diagnostics.tests.kvRead = readValue?.test === true ? '✓ Success' : '✗ Mismatch';
      
      // Clean up
      await locals.runtime.env.BOOKINGS_KV.delete(testKey);
    } catch (error) {
      diagnostics.tests.kvRead = '✗ Error: ' + (error instanceof Error ? error.message : 'Unknown');
      diagnostics.tests.kvWrite = '✗ Error: ' + (error instanceof Error ? error.message : 'Unknown');
    }
  } else {
    diagnostics.tests.kvRead = '✗ KV not available';
    diagnostics.tests.kvWrite = '✗ KV not available';
  }

  // Test DB initialization
  try {
    initDB(locals.runtime);
    diagnostics.tests.dbInit = '✓ Success';
    
    // Try to get bookings
    const { db } = await import('../../../lib/db');
    const bookings = await db.bookings.getAll();
    diagnostics.tests.bookingsCount = `✓ ${bookings.length} bookings found`;
  } catch (error) {
    diagnostics.tests.dbInit = '✗ Error: ' + (error instanceof Error ? error.message : 'Unknown');
    diagnostics.tests.bookingsCount = '✗ Failed to fetch';
  }

  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Environment Diagnostics - Glenugie Kennels</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .timestamp { opacity: 0.9; font-size: 0.9rem; }
    .content { padding: 2rem; }
    .section {
      margin-bottom: 2rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      overflow: hidden;
    }
    .section-header {
      background: #f9fafb;
      padding: 1rem 1.5rem;
      font-weight: 600;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-body { padding: 1.5rem; }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .row:last-child { border-bottom: none; }
    .label { font-weight: 500; color: #374151; }
    .value {
      font-family: 'Courier New', monospace;
      background: #f3f4f6;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.9rem;
    }
    .status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .status.success { background: #d1fae5; color: #065f46; }
    .status.error { background: #fee2e2; color: #991b1b; }
    .status.warning { background: #fef3c7; color: #92400e; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.success { background: #d1fae5; color: #065f46; }
    .badge.error { background: #fee2e2; color: #991b1b; }
    .json-viewer {
      background: #1f2937;
      color: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }
    .btn {
      flex: 1;
      padding: 1rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      text-align: center;
      display: block;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }
    .btn-secondary:hover { background: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 Environment Diagnostics</h1>
      <p class="timestamp">${diagnostics.timestamp}</p>
    </div>
    
    <div class="content">
      <!-- Runtime Status -->
      <div class="section">
        <div class="section-header">
          <span>Runtime Environment</span>
          <span class="badge ${diagnostics.runtime.available ? 'success' : 'error'}">
            ${diagnostics.runtime.available ? 'Available' : 'Missing'}
          </span>
        </div>
        <div class="section-body">
          <div class="row">
            <span class="label">Runtime Object</span>
            <span class="status ${diagnostics.runtime.available ? 'success' : 'error'}">
              ${diagnostics.runtime.available ? '✓ Available' : '✗ Missing'}
            </span>
          </div>
          <div class="row">
            <span class="label">Environment Variables</span>
            <span class="status ${diagnostics.runtime.env.available ? 'success' : 'error'}">
              ${diagnostics.runtime.env.available ? '✓ Available' : '✗ Missing'}
            </span>
          </div>
          <div class="row">
            <span class="label">Env Keys Found</span>
            <span class="value">${diagnostics.runtime.env.keys.length} keys</span>
          </div>
          ${diagnostics.runtime.env.keys.length > 0 ? `
          <div class="row">
            <span class="label">Available Keys</span>
            <span class="value">${diagnostics.runtime.env.keys.join(', ')}</span>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- KV Status -->
      <div class="section">
        <div class="section-header">
          <span>KV Storage (BOOKINGS_KV)</span>
          <span class="badge ${diagnostics.kvBinding.available ? 'success' : 'error'}">
            ${diagnostics.kvBinding.available ? 'Bound' : 'Not Bound'}
          </span>
        </div>
        <div class="section-body">
          <div class="row">
            <span class="label">Binding Available</span>
            <span class="status ${diagnostics.kvBinding.available ? 'success' : 'error'}">
              ${diagnostics.kvBinding.available ? '✓ Yes' : '✗ No'}
            </span>
          </div>
          <div class="row">
            <span class="label">Read Test</span>
            <span class="status ${diagnostics.tests.kvRead?.startsWith('✓') ? 'success' : 'error'}">
              ${diagnostics.tests.kvRead}
            </span>
          </div>
          <div class="row">
            <span class="label">Write Test</span>
            <span class="status ${diagnostics.tests.kvWrite?.startsWith('✓') ? 'success' : 'error'}">
              ${diagnostics.tests.kvWrite}
            </span>
          </div>
        </div>
      </div>

      <!-- Environment Variables -->
      <div class="section">
        <div class="section-header">
          <span>Environment Variables</span>
        </div>
        <div class="section-body">
          <div class="row">
            <span class="label">ADMIN_PASSWORD</span>
            <span class="status ${diagnostics.environment.ADMIN_PASSWORD.includes('✓') ? 'success' : 'error'}">
              ${diagnostics.environment.ADMIN_PASSWORD}
            </span>
          </div>
          <div class="row">
            <span class="label">STRIPE_SECRET_KEY</span>
            <span class="status ${diagnostics.environment.STRIPE_SECRET_KEY.includes('✓') ? 'success' : 'warning'}">
              ${diagnostics.environment.STRIPE_SECRET_KEY}
            </span>
          </div>
          <div class="row">
            <span class="label">RESEND_API_KEY</span>
            <span class="status ${diagnostics.environment.RESEND_API_KEY.includes('✓') ? 'success' : 'warning'}">
              ${diagnostics.environment.RESEND_API_KEY}
            </span>
          </div>
        </div>
      </div>

      <!-- Database Tests -->
      <div class="section">
        <div class="section-header">
          <span>Database Tests</span>
        </div>
        <div class="section-body">
          <div class="row">
            <span class="label">DB Initialization</span>
            <span class="status ${diagnostics.tests.dbInit?.startsWith('✓') ? 'success' : 'error'}">
              ${diagnostics.tests.dbInit}
            </span>
          </div>
          <div class="row">
            <span class="label">Bookings Query</span>
            <span class="status ${diagnostics.tests.bookingsCount?.startsWith('✓') ? 'success' : 'error'}">
              ${diagnostics.tests.bookingsCount}
            </span>
          </div>
        </div>
      </div>

      <!-- Raw JSON Data -->
      <div class="section">
        <div class="section-header">
          <span>Raw Diagnostics JSON</span>
        </div>
        <div class="section-body">
          <div class="json-viewer">${JSON.stringify(diagnostics, null, 2)}</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="btn btn-primary" onclick="location.reload()">
          🔄 Refresh Diagnostics
        </button>
        <a href="/app/admin" class="btn btn-secondary">
          ← Back to Admin
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};
