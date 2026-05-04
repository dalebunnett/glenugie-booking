import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { sendDailyReminders, sendDailyThankYous } from '../../../lib/email';

// This endpoint should be called daily via a cron job or Cloudflare Worker scheduled trigger
// Example: curl -X POST https://your-domain.com/api/emails/send-scheduled -H "Authorization: Bearer YOUR_SECRET"

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verify authorization (simple secret token)
    const authHeader = request.headers.get('authorization');
    const expectedToken = import.meta.env.CRON_SECRET || 'change-this-secret';
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all bookings
    const allBookings = db.bookings.getAll();

    // Send day-before reminders
    await sendDailyReminders(allBookings);

    // Send thank you/review emails
    await sendDailyThankYous(allBookings);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Scheduled emails processed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Scheduled email error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send scheduled emails'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
