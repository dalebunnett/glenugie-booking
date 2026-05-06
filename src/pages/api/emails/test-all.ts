import type { APIRoute } from 'astro';
import {
  sendBookingConfirmation,
  sendPaymentReceived,
  sendBookingCancelled,
  sendBookingAmended,
  sendDayBeforeReminder,
  sendThankYouReview
} from '../../../lib/email';
import type { Booking } from '../../../lib/booking-types';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals?.runtime?.env;
  
  try {
    const { emailType, testEmail } = await request.json();

    // Create a test booking
    const testBooking: Booking = {
      id: 'TEST-' + Date.now(),
      customerName: 'John Smith',
      customerEmail: testEmail || 'test@example.com',
      customerPhone: '07700 900000',
      customerAddress: '123 Test Street, Aberdeen, AB10 1XX',
      checkIn: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      checkOut: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
      numberOfNights: 2,
      accommodationType: 'Luxury Dog Suite',
      specificSuite: 'Sniffany Suite',
      kennelNumber: 'K-001',
      pets: [
        {
          name: 'Max',
          type: 'Dog',
          breed: 'Golden Retriever',
          age: 3,
          gender: 'Male',
          specialRequirements: 'Needs medication twice daily'
        }
      ],
      totalPrice: 50.00,
      depositAmount: 25.00,
      paymentStatus: 'Deposit Paid',
      status: 'confirmed',
      specialRequests: 'Please use the blue bowl for feeding',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let result;
    switch (emailType) {
      case 'booking-confirmation':
        await sendBookingConfirmation(testBooking, false, env);
        result = 'Booking confirmation sent';
        break;
      
      case 'payment-received':
        await sendPaymentReceived(testBooking, 25.00, 'deposit', env);
        result = 'Payment received email sent';
        break;
      
      case 'booking-cancelled':
        await sendBookingCancelled(testBooking, 25.00, env);
        result = 'Booking cancelled email sent';
        break;
      
      case 'booking-amended':
        await sendBookingAmended(testBooking, {
          oldCheckIn: new Date(Date.now() + 172800000).toISOString(),
          oldTotalPrice: 40.00
        }, env);
        result = 'Booking amended email sent';
        break;
      
      case 'day-before-reminder':
        await sendDayBeforeReminder(testBooking, env);
        result = 'Day-before reminder sent';
        break;
      
      case 'thank-you-review':
        await sendThankYouReview(testBooking, env);
        result = 'Thank you/review email sent';
        break;
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid email type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: result,
      sentTo: testEmail || 'test@example.com'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Test email error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

