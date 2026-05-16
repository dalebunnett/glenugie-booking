import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { db, initDB } from '../../lib/db';
import { sendBookingConfirmation } from '../../lib/email';
import { formatAccommodationDisplay } from '../../lib/booking-types';
import type { Booking } from '../../lib/booking-types';
import { allocateKennelNumber } from '../../lib/kennel-allocation';

/**
 * Check if a suite/kennel is available for the given date range
 */
function isAvailable(
  accommodationType: string,
  specificSuite: string | undefined,
  kennelNumber: string | undefined,
  checkIn: string,
  checkOut: string,
  existingBookings: Booking[]
): boolean {
  const requestedCheckIn = new Date(checkIn);
  const requestedCheckOut = new Date(checkOut);
  
  // Normalize dates to midnight UTC
  requestedCheckIn.setHours(0, 0, 0, 0);
  requestedCheckOut.setHours(0, 0, 0, 0);
  
  // Filter bookings that could conflict
  const conflictingBookings = existingBookings.filter(booking => {
    // Skip cancelled bookings
    if (booking.status === 'cancelled') return false;
    
    // Check if it's the same accommodation
    let isSameAccommodation = false;
    
    if (accommodationType === 'luxury-suite' && specificSuite) {
      // For luxury suites, check specific suite name
      isSameAccommodation = booking.accommodationType === 'luxury-suite' && 
                           booking.specificSuite === specificSuite;
    } else if (accommodationType === 'cattery' && specificSuite) {
      // For cattery, check specific suite name
      isSameAccommodation = booking.accommodationType === 'cattery' && 
                           booking.specificSuite === specificSuite;
    } else if ((accommodationType === 'village' || accommodationType === 'ruffs-retreat') && kennelNumber) {
      // For standard kennels, check kennel number
      isSameAccommodation = booking.accommodationType === accommodationType && 
                           booking.kennelNumber === kennelNumber;
    }
    
    if (!isSameAccommodation) return false;
    
    // Check date overlap
    const bookingCheckIn = new Date(booking.checkIn);
    const bookingCheckOut = new Date(booking.checkOut);
    
    bookingCheckIn.setHours(0, 0, 0, 0);
    bookingCheckOut.setHours(0, 0, 0, 0);
    
    // Bookings overlap if:
    // - New check-in is before existing check-out AND
    // - New check-out is after existing check-in
    const overlaps = requestedCheckIn < bookingCheckOut && requestedCheckOut > bookingCheckIn;
    
    return overlaps;
  });
  
  return conflictingBookings.length === 0;
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Initialize DB with KV binding
  initDB(locals.runtime);
  
  try {
    const data = await request.json();
    
    // Get all existing bookings to check availability
    const existingBookings = await db.bookings.getAll();
    
    // Auto-allocate kennel number for standard kennels
    let kennelNumber = data.kennelNumber;
    if ((data.accommodationType === 'village' || data.accommodationType === 'ruffs-retreat') && !kennelNumber) {
      kennelNumber = allocateKennelNumber(
        data.accommodationType,
        data.checkIn,
        data.checkOut,
        existingBookings
      );
      
      if (!kennelNumber) {
        return new Response(JSON.stringify({ 
          error: 'No available kennels for the selected dates. Please try different dates or contact us.',
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`[Booking] Auto-allocated kennel number ${kennelNumber} for ${data.accommodationType}`);
    }
    
    // Check availability for the requested accommodation
    const available = isAvailable(
      data.accommodationType,
      data.specificSuite,
      kennelNumber,
      data.checkIn,
      data.checkOut,
      existingBookings
    );
    
    if (!available) {
      const accommodationName = data.specificSuite || data.accommodationType;
      return new Response(JSON.stringify({ 
        error: `${accommodationName} is not available for the selected dates. Please choose different dates or another accommodation.`,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate booking ID
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Create booking object with all required fields
    const booking: Booking = {
      id: bookingId,
      customerId: `customer-${Date.now()}`,
      
      // Customer Information
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress || '',
      customerCity: data.customerCity || '',
      customerCounty: data.customerCounty || '',
      customerPostcode: data.customerPostcode || '',
      customerCountry: data.customerCountry || 'United Kingdom',
      
      // Emergency Contact
      emergencyContactName: data.emergencyContactName,
      emergencyContactNumber: data.emergencyContactNumber,
      
      // Pets
      pets: data.pets,
      
      // Pet Additional Info
      veterinarySurgery: data.veterinarySurgery || '',
      petInsurance: data.petInsurance || '',
      feedingInstructions: data.feedingInstructions || '',
      medicalInstructions: data.medicalInstructions || '',
      hasAggressionIssues: data.hasAggressionIssues || false,
      aggressionDetails: data.aggressionDetails || '',
      triesEscape: data.triesEscape || false,
      escapeDetails: data.escapeDetails || '',
      additionalNotes: data.additionalNotes || '',
      
      // Accommodation
      accommodationType: data.accommodationType,
      specificSuite: data.specificSuite,
      kennelNumber,
      
      // Booking Dates
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      numberOfNights: data.numberOfNights,
      
      // Payment - FIX: Set paidAmount to depositAmount
      totalPrice: data.totalPrice,
      depositAmount: data.depositAmount,
      paidAmount: data.depositAmount, // Changed from 0 to depositAmount
      totalDue: data.totalPrice - data.depositAmount, // Calculate remaining balance
      paymentStatus: 'partial', // Changed from 'pending' since deposit is paid
      
      // Special Requests
      specialRequests: data.specialRequests || '',
      
      // Vaccination Certificate (will be uploaded separately)
      vaccinationCertificateUrl: data.vaccinationCertificateUrl,
      
      // Terms & Conditions
      agreedToTerms: data.agreedToTerms,
      
      // Status & Metadata
      status: 'confirmed', // Changed from 'pending' since deposit is paid
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save booking to database (now async)
    await db.bookings.create(booking);

    // Send confirmation emails - FIX: Pass runtime env for email API key
    try {
      await sendBookingConfirmation(booking, false, locals.runtime?.env);
      console.log('✅ Confirmation emails sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send confirmation emails:', emailError);
      // Don't fail the booking if email fails
    }

    // Initialize Stripe
    const stripeKey = locals?.runtime?.env?.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      return new Response(JSON.stringify({ 
        success: true,
        bookingId,
        message: 'Booking created. Payment processing unavailable in development.',
        checkoutUrl: null
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stripe = new Stripe(stripeKey);

    // Get base URL for redirect
    const url = new URL(request.url);
    const origin = url.origin;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Glenugie Kennels - ${formatAccommodationDisplay({ accommodationType: data.accommodationType, specificSuite: data.specificSuite } as any)}`,
              description: `${data.numberOfNights} nights for ${data.pets.map((p: any) => p.name).join(', ')}`
            },
            unit_amount: Math.round(data.totalPrice * 100) // Convert to pence
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${origin}${import.meta.env.BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${origin}${import.meta.env.BASE_URL}/booking/cancelled?booking_id=${bookingId}`,
      client_reference_id: bookingId,
      customer_email: data.customerEmail,
      metadata: {
        bookingId,
        customerName: data.customerName
      }
    });

    // Update booking with Stripe session ID (now async)
    await db.bookings.update(bookingId, { stripeSessionId: session.id });

    return new Response(JSON.stringify({ 
      success: true, 
      bookingId,
      checkoutUrl: session.url 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Booking error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ locals }) => {
  // Initialize DB with KV binding
  initDB(locals.runtime);
  
  try {
    const bookings = await db.bookings.getAll();
    
    return new Response(JSON.stringify(bookings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch bookings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};



