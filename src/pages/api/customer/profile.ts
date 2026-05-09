import type { APIRoute } from 'astro';
import { getStorage } from '../../../lib/storage';

// Get customer profile
export const GET: APIRoute = async ({ cookies, locals }) => {
  const sessionId = cookies.get('customer_session')?.value;
  
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const storage = getStorage(locals?.runtime?.env);
  const session = await storage.sessions.get(sessionId);
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(session.customer), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

// PATCH - Update customer profile
export const PATCH: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const sessionId = cookies.get('customer_session')?.value;
    
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const storage = getStorage(locals?.runtime?.env);
    const session = await storage.sessions.get(sessionId);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updates = await request.json();

    // Update customer information
    const updatedCustomer = {
      ...session.customer,
      ...updates,
      // Don't allow changing email or id
      id: session.customer.id,
      email: session.customer.email
    };

    // Update session
    const updatedSession = {
      ...session,
      customer: updatedCustomer
    };

    await storage.sessions.set(sessionId, updatedSession);

    // Also update all bookings with this customer's email
    const allBookings = await storage.bookings.getAll();
    const customerBookings = allBookings.filter(b => b.customerEmail === session.customer.email);
    
    for (const booking of customerBookings) {
      await storage.bookings.update(booking.id, {
        ...booking,
        customerName: updatedCustomer.name || booking.customerName,
        customerPhone: updatedCustomer.phone || booking.customerPhone,
        customerAddress: updatedCustomer.address || booking.customerAddress,
        customerCity: updatedCustomer.city || booking.customerCity,
        customerCounty: updatedCustomer.county || booking.customerCounty,
        customerPostcode: updatedCustomer.postcode || booking.customerPostcode,
        customerCountry: updatedCustomer.country || booking.customerCountry,
        updatedAt: new Date().toISOString()
      });
    }

    return new Response(JSON.stringify(updatedCustomer), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};


