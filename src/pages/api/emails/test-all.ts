import type { APIRoute } from 'astro';
import { sendBookingConfirmation, sendAdminBookingNotification, sendDayBeforeReminder, sendPaymentReceivedEmail, sendBookingCancellationEmail, sendBookingAmendmentEmail, sendThankYouEmail } from '../../../lib/email';

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
    const sampleBooking = {
      id: 'TEST-12345',
      customerName: 'Test Customer',
      customerEmail: testEmail,
      customerPhone: '+44 1234 567890',
      petName: 'Buddy',
      petType: 'dog' as const,
      accommodationType: 'luxury-suite' as const,
      kennelNumber: 5,
      checkInDate: '2026-06-15',
      checkOutDate: '2026-06-20',
      numberOfNights: 5,
      numberOfPets: 1,
      totalPrice: 125,
      depositPaid: 50,
      balanceDue: 75,
      specialRequirements: 'Loves treats and belly rubs!',
      status: 'confirmed' as const,
      createdAt: new Date().toISOString(),
      paymentStatus: 'deposit-paid' as const
    };

    let result = false;
    let emailName = '';

    switch (emailType) {
      case 'booking-confirmation':
        emailName = 'Booking Confirmation';
        result = await sendBookingConfirmation(sampleBooking, locals);
        break;

      case 'admin-notification':
        emailName = 'Admin Booking Notification';
        result = await sendAdminBookingNotification(sampleBooking, locals);
        break;

      case 'day-before-reminder':
        emailName = 'Day Before Reminder';
        // Adjust dates to tomorrow
        const reminderBooking = {
          ...sampleBooking,
          checkInDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        result = await sendDayBeforeReminder(reminderBooking, locals);
        break;

      case 'payment-received':
        emailName = 'Payment Received';
        result = await sendPaymentReceivedEmail(
          sampleBooking,
          75, // amount
          'full', // payment type
          locals
        );
        break;

      case 'booking-cancelled':
        emailName = 'Booking Cancellation';
        result = await sendBookingCancellationEmail(
          sampleBooking,
          'Customer requested cancellation',
          50, // refund amount
          locals
        );
        break;

      case 'booking-amended':
        emailName = 'Booking Amendment';
        const oldBooking = { ...sampleBooking };
        const newBooking = {
          ...sampleBooking,
          checkInDate: '2026-06-16',
          checkOutDate: '2026-06-21',
          numberOfNights: 5,
          totalPrice: 125
        };
        result = await sendBookingAmendmentEmail(
          oldBooking,
          newBooking,
          'Dates changed by customer request',
          locals
        );
        break;

      case 'thank-you':
        emailName = 'Thank You Email';
        result = await sendThankYouEmail(sampleBooking, locals);
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid email type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    if (result) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: `${emailName} sent successfully to ${testEmail}`,
        emailType 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ 
        error: `Failed to send ${emailName}`,
        emailType 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
