import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { db, initDB } from '../../lib/db';
import { sendBookingConfirmation } from '../../lib/email';
import type { Booking } from '../../lib/booking-types';
import { allocateKennelNumber } from '../../lib/kennel-allocation';

export const POST: APIRoute = async ({ request, locals }) => {
  // Initialize DB with KV binding
  initDB(locals.runtime);
  
  try {
    const data = await request.json();
    
    // Generate booking ID
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Auto-allocate kennel number for standard kennels
    let kennelNumber = data.kennelNumber;
    if ((data.accommodationType === 'village' || data.accommodationType === 'ruffs-retreat') && !kennelNumber) {
      const existingBookings = await db.bookings.getAll();
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
      
      // Payment
      totalPrice: data.totalPrice,
      depositAmount: data.depositAmount,
      paidAmount: 0,
      totalDue: data.totalPrice,
      paymentStatus: 'pending',
      
      // Special Requests
      specialRequests: data.specialRequests || '',
      
      // Vaccination Certificate (will be uploaded separately)
      vaccinationCertificateUrl: data.vaccinationCertificateUrl,
      
      // Terms & Conditions
      agreedToTerms: data.agreedToTerms,
      
      // Status & Metadata
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save booking to database (now async)
    await db.bookings.create(booking);

    // Send confirmation emails
    try {
      await sendBookingConfirmation(booking);
    } catch (emailError) {
      console.error('Failed to send confirmation emails:', emailError);
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
              name: `Glenugie Kennels - ${data.accommodationType} ${data.specificSuite ? `(${data.specificSuite})` : ''}`,
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





