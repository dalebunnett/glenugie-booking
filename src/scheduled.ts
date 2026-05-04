// Cloudflare Cron Trigger Handler
// This runs daily at 9:00 AM UTC to send automated emails

import type { ScheduledController } from '@cloudflare/workers-types';
import { db } from './lib/db';
import { sendDailyReminders, sendDailyThankYous } from './lib/email';

export default {
  async scheduled(
    controller: ScheduledController,
    env: any,
    ctx: any
  ): Promise<void> {
    console.log('🕐 Scheduled email job started at:', new Date().toISOString());
    console.log('   Cron schedule:', controller.cron);

    try {
      // Get all bookings from the database
      const allBookings = db.bookings.getAll();
      console.log(`   Found ${allBookings.length} total bookings`);

      // Send day-before reminder emails
      console.log('📧 Processing day-before reminders...');
      await sendDailyReminders(allBookings);

      // Send thank you + review request emails
      console.log('📧 Processing thank you/review emails...');
      await sendDailyThankYous(allBookings);

      console.log('✅ Scheduled email job completed successfully');
    } catch (error) {
      console.error('❌ Scheduled email job failed:', error);
      throw error; // Cloudflare will log this error
    }
  }
};
