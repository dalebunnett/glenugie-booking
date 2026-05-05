import type { APIRoute } from 'astro';
import { getTokenFromRequest, isValidAdminToken, getAdminSecret } from '../../../lib/admin-auth';

export const GET: APIRoute = async ({ request, locals }) => {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    cookies: {
      raw: request.headers.get('cookie') || 'No cookies',
      parsed: {}
    },
    token: {
      found: false,
      value: null,
      valid: false,
      source: null
    },
    secret: {
      available: false,
      value: null
    },
    headers: {
      authorization: request.headers.get('authorization') || 'Not set',
      cookie: request.headers.get('cookie') || 'Not set'
    }
  };

  // Parse cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc: any, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {});
  diagnostics.cookies.parsed = cookies;

  // Get token
  const token = getTokenFromRequest(request);
  diagnostics.token.found = !!token;
  diagnostics.token.value = token ? `${token.substring(0, 20)}...` : null;

  // Determine token source
  if (request.headers.get('authorization')) {
    diagnostics.token.source = 'Authorization header';
  } else if (cookies.admin_session) {
    diagnostics.token.source = 'Cookie (admin_session)';
  } else {
    diagnostics.token.source = 'Not found';
  }

  // Get secret
  const secret = getAdminSecret({ locals } as any);
  diagnostics.secret.available = !!secret;
  diagnostics.secret.value = secret ? `${secret.substring(0, 10)}...` : null;

  // Validate token
  if (token && secret) {
    diagnostics.token.valid = isValidAdminToken(token, secret);
  }

  // Test authentication result
  diagnostics.authResult = {
    isAuthenticated: diagnostics.token.found && diagnostics.token.valid,
    reason: !diagnostics.token.found 
      ? 'No token found' 
      : !diagnostics.token.valid 
        ? 'Token invalid or expired' 
        : 'Authenticated'
  };

  // HTML output
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authentication Test - Glenugie Kennels</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 1000px;
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
      max-width: 60%;
      overflow: hidden;
      text-overflow: ellipsis;
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
    .badge.warning { background: #fef3c7; color: #92400e; }
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
    .alert {
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .alert.success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #6ee7b7;
    }
    .alert.error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    .alert h3 { margin-bottom: 0.5rem; font-size: 1.1rem; }
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
      <h1>🔐 Authentication Test</h1>
      <p class="timestamp">${diagnostics.timestamp}</p>
    </div>
    
    <div class="content">
      <!-- Auth Status Alert -->
      ${diagnostics.authResult.isAuthenticated ? `
      <div class="alert success">
        <h3>✅ Authentication Successful</h3>
        <p>You are currently authenticated with a valid session token.</p>
      </div>
      ` : `
      <div class="alert error">
        <h3>❌ Not Authenticated</h3>
        <p>${diagnostics.authResult.reason}</p>
        <p style="margin-top: 0.5rem; font-size: 0.9rem;">Please log in at <a href="/app/admin" style="color: inherit; font-weight: bold;">/app/admin</a> first.</p>
      </div>
      `}

      <!-- Token Info -->
      <div class="section">
        <div class="section-header">
          <span>Token Information</span>
          <span class="badge ${diagnostics.token.valid ? 'success' : 'error'}">
            ${diagnostics.token.valid ? 'Valid' : 'Invalid'}
          </span>
        </div>
        <div class="section-body">
          <div class="row">
            <span class="label">Token Found</span>
            <span class="status ${diagnostics.token.found ? 'success' : 'error'}">
              ${diagnostics.token.found ? '✓ Yes' : '✗ No'}
            </span>
          </div>
          <div class="row">
            <span class="label">Token Source</span>
            <span class="value">${diagnostics.token.source}</span>
          </div>
          <div class="row">
            <span class="label">Token Value</span>
            <span class="value">${diagnostics.token.value || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Token Valid</span>
            <span class="status ${diagnostics.token.valid ? 'success' : 'error'}">
              ${diagnostics.token.valid ? '✓ Yes' : '✗ No'}
            </span>
          </div>
        </div>
      </div>

      <!-- Cookies -->
      <div class="section">
        <div class="section-header">
          <span>Cookies</span>
          <span class="badge ${Object.keys(diagnostics.cookies.parsed).length > 0 ? 'success' : 'warning'}">
            ${Object.keys(diagnostics.cookies.parsed).length} cookies
          </span>
        </div>
        <div class="section-body">
          <div class="row">
            <span class="label">Cookie Header</span>
            <span class="value">${diagnostics.cookies.raw}</span>
          </div>
          ${Object.entries(diagnostics.cookies.parsed).map(([key, value]) => `
          <div class="row">
            <span class="label">${key}</span>
            <span class="value">${value}</span>
          </div>
          `).join('')}
        </div>
      </div>

      <!-- Headers -->
      <div class="section">
        <div class="section-header">
          <span>Request Headers</span>
        </div>
        <div class="section-body">
          <div class="row">
            <span class="label">Authorization</span>
            <span class="value">${diagnostics.headers.authorization}</span>
          </div>
          <div class="row">
            <span class="label">Cookie</span>
            <span class="value">${diagnostics.headers.cookie}</span>
          </div>
        </div>
      </div>

      <!-- Secret Info -->
      <div class="section">
        <div class="section-header">
          <span>Admin Secret</span>
          <span class="badge ${diagnostics.secret.available ? 'success' : 'error'}">
            ${diagnostics.secret.available ? 'Available' : 'Missing'}
          </span>
        </div>
        <div class="section-body">
          <div class="row">
            <span class="label">Secret Available</span>
            <span class="status ${diagnostics.secret.available ? 'success' : 'error'}">
              ${diagnostics.secret.available ? '✓ Yes' : '✗ No'}
            </span>
          </div>
          <div class="row">
            <span class="label">Secret Value (partial)</span>
            <span class="value">${diagnostics.secret.value || 'N/A'}</span>
          </div>
        </div>
      </div>

      <!-- Raw JSON -->
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
          🔄 Refresh Test
        </button>
        <a href="/app/admin" class="btn btn-secondary">
          🔑 Go to Login
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
