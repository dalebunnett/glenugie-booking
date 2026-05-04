import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

// Get customer profile
export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const headerSessionId = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const cookies = request.headers.get('cookie') || '';
    const sessionMatch = cookies.match(/customer_session=([^;]+)/);
    const cookieSessionId = sessionMatch ? sessionMatch[1] : null;
    
    const sessionId = headerSessionId || cookieSessionId;

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = db.customerSessions.get(sessionId);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const customer = db.customers.getById(session.customerId);
    if (!customer) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return customer without password hash
    const { passwordHash, ...customerData } = customer;

    return new Response(JSON.stringify(customerData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Update customer profile
export const PATCH: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const headerSessionId = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const cookies = request.headers.get('cookie') || '';
    const sessionMatch = cookies.match(/customer_session=([^;]+)/);
    const cookieSessionId = sessionMatch ? sessionMatch[1] : null;
    
    const sessionId = headerSessionId || cookieSessionId;

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = db.customerSessions.get(sessionId);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { name, phone, address, city, county, postcode, country, emergencyContactName, emergencyContactNumber } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    if (county !== undefined) updates.county = county;
    if (postcode !== undefined) updates.postcode = postcode;
    if (country !== undefined) updates.country = country;
    if (emergencyContactName !== undefined) updates.emergencyContactName = emergencyContactName;
    if (emergencyContactNumber !== undefined) updates.emergencyContactNumber = emergencyContactNumber;

    const updatedCustomer = db.customers.update(session.customerId, updates);
    if (!updatedCustomer) {
      return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { passwordHash, ...customerData } = updatedCustomer;

    return new Response(JSON.stringify(customerData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
