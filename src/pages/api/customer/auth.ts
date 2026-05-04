import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

// Simple password hashing (in production, use bcrypt or similar)
function hashPassword(password: string): string {
  // This is a simple hash for demonstration - use bcrypt in production
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Register new customer
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    // Validate required fields
    if (!email || !password || !name || !phone) {
      return new Response(JSON.stringify({ 
        error: 'Email, password, name, and phone are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if customer already exists
    const existingCustomer = db.customers.getByEmail(email);
    if (existingCustomer) {
      return new Response(JSON.stringify({ 
        error: 'An account with this email already exists' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create new customer
    const customerId = `customer-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const passwordHash = hashPassword(password);

    const customer = db.customers.create({
      id: customerId,
      email: email.toLowerCase(),
      passwordHash,
      name,
      phone
    });

    // Create session
    const session = db.customerSessions.create(customerId);

    return new Response(JSON.stringify({ 
      success: true,
      sessionId: session.id,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone
      }
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `customer_session=${session.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000` // 30 days
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ 
      error: 'Registration failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Login
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ 
        error: 'Email and password are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find customer
    const customer = db.customers.getByEmail(email);
    if (!customer) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email or password' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify password
    if (!verifyPassword(password, customer.passwordHash)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid email or password' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create session
    const session = db.customerSessions.create(customer.id);

    return new Response(JSON.stringify({ 
      success: true,
      sessionId: session.id,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `customer_session=${session.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000` // 30 days
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ 
      error: 'Login failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Logout
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const headerSessionId = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const cookies = request.headers.get('cookie') || '';
    const sessionMatch = cookies.match(/customer_session=([^;]+)/);
    const cookieSessionId = sessionMatch ? sessionMatch[1] : null;
    
    const sessionId = headerSessionId || cookieSessionId;

    if (sessionId) {
      db.customerSessions.delete(sessionId);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': 'customer_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Logout failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
