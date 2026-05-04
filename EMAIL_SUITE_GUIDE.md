# Email Suite - Complete Guide

## Overview
A comprehensive email system using Resend to send automated emails for bookings, reminders, thank you messages, and admin notifications.

## Email Templates

### 1. **Booking Confirmation Email** 📧
**Trigger:** Immediately after booking is created  
**Recipients:** Customer + Admin  
**Subject:** "🐾 Booking Confirmed - Glenugie Kennels"

**Customer Email Includes:**
- Booking reference number
- Check-in and check-out dates
- Accommodation details and kennel number
- Pet information (name, breed, age, special requirements)
- Payment summary (total, deposit, balance)
- Special requests
- Important times (drop-off: 2PM-5PM, pick-up: 10AM-12PM)
- Contact information

**Admin Email Includes:**
- All customer contact details
- Complete booking information
- All pet details and special requirements
- Payment status and Stripe payment ID
- Link to admin dashboard

### 2. **Day Before Reminder Email** ⏰
**Trigger:** 24 hours before check-in  
**Recipient:** Customer  
**Subject:** "⏰ Reminder: Check-in Tomorrow - Glenugie Kennels"

**Includes:**
- Reminder of tomorrow's check-in
- Booking reference
- Check-in time window (2PM-5PM)
- Checklist of items to bring:
  - Vaccination records
  - Medications
  - Favorite food
  - Comfort items (toys, blankets)
- Pet information
- Balance due reminder
- Contact information for last-minute questions

### 3. **Thank You & Review Request Email** 💙
**Trigger:** 24 hours after check-out  
**Recipient:** Customer  
**Subject:** "💙 Thank You for Choosing Glenugie Kennels!"

**Includes:**
- Thank you message
- Stay summary
- **Prominent Google Review button** (https://g.page/r/CVLGkcM4kJ3DEBM/review)
- Call-to-action to book next stay
- Customer portal promotion
- Social media follow request

### 4. **Admin Payment Notification** 💰
**Trigger:** When payment is received (Stripe webhook)  
**Recipient:** Admin  
**Subject:** "💰 Payment Received - [Customer Name] ([Booking ID])"

**Includes:**
- Large payment amount display
- Payment type (deposit/balance)
- Booking reference
- Customer details
- Payment breakdown (total, paid, remaining)
- Stripe payment ID
- Link to admin dashboard

## Setup Instructions

### 1. Install Resend
```bash
npm install resend
```

### 2. Get Resend API Key
1. Sign up at https://resend.com
2. Create an API key
3. Add domain verification (or use sandbox for testing)

### 3. Configure Environment Variables

Add to your `.env` file:
```env
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx

# Cron Secret (for scheduled emails endpoint)
CRON_SECRET=your-random-secret-token-here
```

### 4. Configure Sender Email
In `src/lib/email.ts`, update:
```typescript
const FROM_EMAIL = 'Glenugie Kennels <bookings@glenugiekennels.co.uk>';
const ADMIN_EMAIL = 'info@glenugiekennels.co.uk';
```

**Important:** The sender email domain must be verified in Resend or use Resend's sandbox domain for testing.

### 5. Deploy to Production
Ensure environment variables are set in your Cloudflare Workers settings:
- `RESEND_API_KEY`
- `CRON_SECRET`

## Email Sending Flow

### Booking Confirmation (Automatic)
```
Customer makes booking
    ↓
Booking created in database
    ↓
sendBookingConfirmation() called
    ↓
Two emails sent:
  1. Customer: Booking details & confirmation
  2. Admin: New booking notification
```

### Payment Notification (Automatic)
```
Stripe payment succeeds
    ↓
Webhook receives event
    ↓
Booking updated (status: confirmed)
    ↓
sendAdminPaymentNotification() called
    ↓
Admin receives payment confirmation
```

### Scheduled Emails (Daily Cron Job)
```
Cron job calls /api/emails/send-scheduled
    ↓
Check all bookings for:
  • Check-in tomorrow → Send reminder
  • Check-out yesterday → Send thank you
```

## Setting Up Scheduled Emails

You have three options for automated scheduled emails:

### Option 1: Cloudflare Workers Cron Triggers (Recommended)
Add to `wrangler.jsonc`:
```json
{
  "triggers": {
    "crons": ["0 9 * * *"]  // Runs daily at 9 AM UTC
  }
}
```

Create a cron handler:
```javascript
export default {
  async scheduled(event, env, ctx) {
    await fetch('https://your-domain.com/api/emails/send-scheduled', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CRON_SECRET}`
      }
    });
  }
}
```

### Option 2: External Cron Service
Use a service like:
- **Cron-job.org** (free)
- **EasyCron**
- **GitHub Actions**

Setup:
```bash
# Daily at 9 AM
curl -X POST https://your-domain.com/api/emails/send-scheduled \
  -H "Authorization: Bearer your-cron-secret"
```

### Option 3: GitHub Actions (Free)
Create `.github/workflows/send-emails.yml`:
```yaml
name: Send Scheduled Emails
on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  send-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Send emails
        run: |
          curl -X POST https://your-domain.com/api/emails/send-scheduled \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## Testing Emails

### 1. Test in Development (Console Logging)
Without RESEND_API_KEY set, emails will be logged to console:
```
📧 [EMAIL - Not Configured]
   To: customer@example.com
   Subject: 🐾 Booking Confirmed - Glenugie Kennels
```

### 2. Test with Resend Sandbox
Use Resend's test domain to send to verified emails without domain setup.

### 3. Manual Testing
Send test emails via API:
```javascript
import { sendBookingConfirmation } from './lib/email';

const testBooking = { /* booking object */ };
await sendBookingConfirmation(testBooking);
```

### 4. Test Scheduled Emails
Manually trigger:
```bash
curl -X POST http://localhost:4321/api/emails/send-scheduled \
  -H "Authorization: Bearer change-this-secret"
```

## Email Design

All emails feature:
- **Responsive design** - Looks great on mobile and desktop
- **Brand colors** - Uses Glenugie blue (#83C8E8) throughout
- **Clean layout** - Easy to read with clear sections
- **Professional styling** - Matches website aesthetic
- **Accessible** - High contrast, readable fonts
- **Call-to-action buttons** - Clear next steps

### Fonts
- Headers: Great Vibes (cursive, matching website)
- Body: Fira Sans (clean, readable)

### Colors
- Primary: #83C8E8 (Glenugie blue)
- Secondary: #5BB5DC (darker blue)
- Success: #4caf50 (green for payments)
- Warning: #ffc107 (yellow for highlights)

## Email Metrics

Track these in Resend dashboard:
- ✅ Delivery rate
- 📖 Open rate
- 🖱️ Click rate (especially Google Review link)
- ⚠️ Bounce rate
- 🚫 Complaint rate

## Customization

### Change Email Content
Edit templates in `src/lib/email.ts`:
- `bookingConfirmationEmail()`
- `dayBeforeReminderEmail()`
- `thankYouReviewEmail()`
- `adminBookingNotification()`
- `adminPaymentNotification()`

### Change Sender/Admin Email
Update constants in `src/lib/email.ts`:
```typescript
const FROM_EMAIL = 'Your Name <your@email.com>';
const ADMIN_EMAIL = 'admin@email.com';
```

### Change Google Review Link
Update constant:
```typescript
const GOOGLE_REVIEW_LINK = 'your-google-review-link';
```

## Troubleshooting

### Emails Not Sending
1. **Check API Key**: Ensure `RESEND_API_KEY` is set correctly
2. **Verify Domain**: Domain must be verified in Resend
3. **Check Logs**: Look for error messages in console
4. **Test Credentials**: Try sending a test email from Resend dashboard

### Scheduled Emails Not Working
1. **Verify Cron Setup**: Check cron trigger configuration
2. **Check Secret**: Ensure `CRON_SECRET` matches in request
3. **Test Endpoint**: Manually call the endpoint
4. **Check Logs**: Look for execution logs

### HTML Not Rendering
1. **Check Email Client**: Some clients strip styles
2. **Use Inline Styles**: Already implemented in templates
3. **Test in Multiple Clients**: Gmail, Outlook, Apple Mail, etc.

## Best Practices

### Email Deliverability
- ✅ Use verified domain
- ✅ Include unsubscribe link (required for commercial emails)
- ✅ Don't send too frequently
- ✅ Monitor bounce/complaint rates
- ✅ Use clear, non-spammy subject lines

### Content
- ✅ Keep subject lines under 50 characters
- ✅ Front-load important information
- ✅ Include clear call-to-action
- ✅ Test on mobile devices
- ✅ Proofread carefully

### Timing
- Booking Confirmation: Immediate
- Day Before Reminder: 24 hours before check-in (9 AM)
- Thank You/Review: 24 hours after check-out (9 AM)
- Admin Notifications: Immediate

## Future Enhancements

1. **Email Templates in Database** - Allow admin to customize via UI
2. **A/B Testing** - Test different subject lines and content
3. **Personalization** - More dynamic content based on customer data
4. **Attachments** - Send booking PDFs, vaccination reminders
5. **SMS Notifications** - Add text message option
6. **Drip Campaigns** - Series of emails for customer education
7. **Seasonal Promotions** - Automated holiday specials
8. **Win-back Campaigns** - Re-engage past customers
9. **Newsletter** - Monthly updates and tips
10. **Referral Program** - Email friends for discount

## Support

For issues or questions:
- 📧 Resend Support: https://resend.com/support
- 📚 Resend Docs: https://resend.com/docs
- 🐛 File Issue: Create an issue in your repository

## Files Modified/Created

### Created:
- `src/lib/email.ts` - Main email service with all templates
- `src/pages/api/emails/send-scheduled.ts` - Cron endpoint
- `EMAIL_SUITE_GUIDE.md` - This guide

### Modified:
- `src/pages/api/bookings.ts` - Already calls sendBookingConfirmation
- `src/pages/api/webhooks/stripe.ts` - Added payment notification
- `package.json` - Added Resend dependency

## Quick Start Checklist

- [ ] Install Resend: `npm install resend`
- [ ] Get Resend API key from https://resend.com
- [ ] Add `RESEND_API_KEY` to `.env`
- [ ] Add `CRON_SECRET` to `.env`
- [ ] Verify sender email domain in Resend
- [ ] Update `FROM_EMAIL` and `ADMIN_EMAIL` in `email.ts`
- [ ] Test booking confirmation email
- [ ] Set up cron job for scheduled emails
- [ ] Test day-before reminder
- [ ] Test thank you/review email
- [ ] Monitor email metrics in Resend dashboard

---

**Ready to go!** 🚀 Your complete email suite is configured and ready to send professional, branded emails to your customers.
