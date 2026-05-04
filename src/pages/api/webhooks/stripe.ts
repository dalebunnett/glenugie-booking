import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { db } from '../../../lib/db';
import { sendAdminPaymentNotification } from '../../../lib/email';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const stripeKey = locals?.runtime?.env?.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY;
    const webhookSecret = locals?.runtime?.env?.STRIPE_WEBHOOK_SECRET || import.meta.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !webhookSecret) {
      return new Response('Webhook not configured', { status: 500 });
    }

    const stripe = new Stripe(stripeKey);
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return new Response('No signature', { status: 400 });
    }

    const body = await request.text();
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.client_reference_id;
        const paymentAmount = (session.amount_total || 0) / 100; // Convert from pence to pounds

        if (bookingId) {
          // Update booking status
          await db.bookings.update(bookingId, {
            paymentStatus: 'paid',
            paidAmount: paymentAmount,
            totalDue: 0,
            status: 'confirmed',
            stripePaymentId: session.payment_intent as string
          });

          console.log(`[Stripe] Payment confirmed for booking ${bookingId}`);

          // Get the booking to send notification
          const booking = await db.bookings.getById(bookingId);
          if (booking) {
            // Send admin payment notification
            try {
              await sendAdminPaymentNotification(booking, paymentAmount, 'deposit');
            } catch (emailError) {
              console.error('Failed to send admin payment notification:', emailError);
            }
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        // Handle successful payment
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', charge.id);
        
        // Find booking by charge ID and update payment status
        // TODO: Implement refund logic
        // db.bookings.update(bookingId, { paymentStatus: 'refunded' });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
};


