import type { APIRoute } from 'astro';
import { db, initDB } from '../../../lib/db';
import { requireAdminAuth } from '../../../lib/admin-auth';
import { sendBookingConfirmation } from '../../../lib/email';
import type { Booking } from '../../../lib/booking-types';
import { allocateKennelNumber } from '../../../lib/kennel-allocation';

interface AdminBookingRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pets: Pet[];
  accommodationType: AccommodationType;
  specificSuite?: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  totalPrice: number;
  depositAmount: number;
  specialRequests?: string;
}

// Simple cache
let cachedBookings: Booking[] | null = null;
let cachedStats: any = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export const GET: APIRoute = async ({ request, locals }) => {
  console.log('[Bookings GET] Starting request');
  console.log('[Bookings GET] Locals available:', !!locals);
  console.log('[Bookings GET] Locals.runtime:', !!locals?.runtime);
  
  // Initialize DB with KV binding
  initDB(locals.runtime);
  console.log('[Bookings GET] DB initialized');
  
  // Check authentication
  const { authorized } = requireAdminAuth(request, { locals } as any);
  if (!authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('[Bookings GET] Fetching all bookings...');
    const bookings = await db.bookings.getAll();
    console.log('[Bookings GET] Retrieved', bookings.length, 'bookings');
    
    return new Response(JSON.stringify(bookings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Bookings GET] Error fetching bookings:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch bookings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  // Initialize DB with KV binding
  initDB(locals.runtime);
  
  // Check authentication
  const { authorized } = requireAdminAuth(request, { locals } as any);
  if (!authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const booking = await request.json();
    
    // Generate ID if not provided
    if (!booking.id) {
      booking.id = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    
    // Set timestamps
    booking.createdAt = booking.createdAt || new Date().toISOString();
    booking.updatedAt = new Date().toISOString();
    
    const created = await db.bookings.create(booking);
    
    return new Response(JSON.stringify(created), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to create booking' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

















