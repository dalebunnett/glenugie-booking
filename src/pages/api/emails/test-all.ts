import type { APIRoute } from 'astro';
import { 
  sendBookingConfirmation, 
  sendDayBeforeReminder, 
  sendPaymentReceived,
  sendBookingCancelled, 
  sendBookingAmended, 
  sendThankYouReview 
} from '../../../lib/email';
import type { Booking } from '../../../lib/booking-types';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { emailType, testEmail } = await request.json();

    if (!testEmail) {
      return new Response(JSON.stringify({ error: 'Test email address required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sample booking data for testing
    const sampleBooking: Booking = {
      id: 'TEST-12345',
      customerName: 'Test Customer',
      customerEmail: testEmail,
      customerPhone: '+44 1234 567890',
      emergencyContactName: 'Emergency Contact',
      emergencyContactNumber: '+44 9876 543210',
      pets: [
        {
          name: 'Buddy',
          type: 'dog',
          breed: 'Golden Retriever',
          age: '3',
          gender: 'male',
          neutered: true,
          vaccinated: true,
          specialRequirements: 'Loves treats and belly rubs!'
        }
      ],
      accommodationType: 'luxury-suite',
      specificSuite: 'Sniffany Suite',
      kennelNumber: 5,
      checkIn: '2026-06-15',
      checkOut: '2026-06-20',
      numberOfNights: 5,
      totalPrice: 125,
      depositAmount: 50,
      paidAmount: 50,
      totalDue: 75,
      specialRequests: 'Please give extra treats!',
      status: 'confirmed',
      paymentStatus: 'deposit-paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let emailName = '';

    switch (emailType) {
      case 'booking-confirmation':
        emailName = 'Booking Confirmation';
        await sendBookingConfirmation(sampleBooking, false);
        break;

      case 'admin-notification':
        emailName = 'Admin Booking Notification';
        // This is sent automatically with sendBookingConfirmation when isManualBooking = false
        await sendBookingConfirmation(sampleBooking, false);
        break;

      case 'day-before-reminder':
        emailName = 'Day Before Reminder';
        // Adjust dates to tomorrow
        const reminderBooking = {
          ...sampleBooking,
          checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        await sendDayBeforeReminder(reminderBooking);
        break;

      case 'payment-received':
        emailName = 'Payment Received';
        await sendPaymentReceived(sampleBooking, 75, 'balance');
        break;

      case 'booking-cancelled':
        emailName = 'Booking Cancellation';
        await sendBookingCancelled(sampleBooking, 50);
        break;

      case 'booking-amended':
        emailName = 'Booking Amendment';
        const oldBooking = { ...sampleBooking };
        const newBooking = {
          ...sampleBooking,
          checkIn: '2026-06-16',
          checkOut: '2026-06-21',
          numberOfNights: 5,
          totalPrice: 125
        };
        await sendBookingAmended(oldBooking, newBooking, 'Dates changed by customer request');
        break;

      case 'thank-you':
        emailName = 'Thank You Email';
        // Adjust dates to yesterday for checkout
        const thankYouBooking = {
          ...sampleBooking,
          checkOut: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        await sendThankYouReview(thankYouBooking);
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid email type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${emailName} sent successfully to ${testEmail}`,
      emailType 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Email test error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send test email',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
