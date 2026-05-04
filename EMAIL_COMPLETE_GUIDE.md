# Complete Email Suite Guide 📧

## Overview

Your Glenugie Kennels website now has a complete email system with **8 different email types** covering all customer and admin communication needs.

---

## 📨 Email Types

### Customer Emails (6 types)

#### 1. **Booking Confirmation** 
- **Sent:** Immediately after booking is created (online or manually)
- **Recipient:** Customer
- **Includes:** Full booking details, pet info, payment summary, check-in/out times
- **Function:** `sendBookingConfirmation(booking, isManualBooking)`

#### 2. **Payment Received**
- **Sent:** When any payment is processed
- **Recipient:** Customer
- **Includes:** Payment amount, remaining balance, booking reference
- **Function:** `sendPaymentReceived(booking, amount, 'deposit' | 'balance' | 'full')`

#### 3. **Booking Cancelled**
- **Sent:** When a booking is cancelled
- **Recipient:** Customer
- **Includes:** Cancelled booking details, refund information (if applicable)
- **Function:** `sendBookingCancelled(booking, refundAmount?)`

#### 4. **Booking Amended**
- **Sent:** When booking details are modified
- **Recipient:** Customer
- **Includes:** Old vs new details comparison, updated summary
- **Function:** `sendBookingAmended(booking, changes)`

#### 5. **Day-Before Reminder**
- **Sent:** Automatically at 9 AM, 1 day before check-in
- **Recipient:** Customer
- **Includes:** Checklist, payment reminder, booking details
- **Function:** `sendDayBeforeReminder(booking)` (called by cron)

#### 6. **Thank You + Google Review Request**
- **Sent:** Automatically at 9 AM, 1 day after check-out
- **Recipient:** Customer
- **Includes:** Thank you message, Google review link, rebook button
- **Function:** `sendThankYouReview(booking)` (called by cron)

### Admin Emails (2 types)

#### 7. **New Booking Notification**
- **Sent:** Immediately when booking is created
- **Recipient:** Admin (info@glenugiekennels.co.uk)
- **Includes:** Complete booking details, customer info, pet details, special requests
- **Function:** `sendBookingConfirmation(booking, isManualBooking)` (also sends customer email)

#### 8. **Payment Received Notification**
- **Sent:** When any payment is processed
- **Recipient:** Admin
- **Includes:** Payment amount, booking details, Stripe payment ID
- **Function:** `sendPaymentReceived(booking, amount, type)` (also sends customer email)

---

## 🔧 How to Use Each Email

### When Creating a New Booking

```typescript
import { sendBookingConfirmation } from '../lib/email';

// After creating booking
const newBooking = await createBooking(data);

// Send confirmation to customer + notification to admin
await sendBookingConfirmation(newBooking, false); // false = online booking
```

### When Creating a Manual Booking (Admin)

```typescript
import { sendBookingConfirmation } from '../lib/email';

// After creating manual booking in admin
const manualBooking = await createBooking(data);

// Send confirmation with "manual booking" notice to admin
await sendBookingConfirmation(manualBooking, true); // true = manual booking
```

### When Payment is Received

```typescript
import { sendPaymentReceived } from '../lib/email';

// After processing payment
await sendPaymentReceived(booking, 50.00, 'deposit'); // or 'balance' or 'full'
```

### When Cancelling a Booking

```typescript
import { sendBookingCancelled } from '../lib/email';

// After cancelling booking
await sendBookingCancelled(booking, 25.00); // optional refund amount
// or
await sendBookingCancelled(booking); // no refund
```

### When Amending a Booking

```typescript
import { sendBookingAmended } from '../lib/email';

// Save old values before updating
const oldCheckIn = booking.checkIn;
const oldCheckOut = booking.checkOut;
const oldAccommodation = booking.specificSuite;
const oldTotalPrice = booking.totalPrice;

// Update booking...
updateBooking(booking, newData);

// Send amendment email
await sendBookingAmended(booking, {
  oldCheckIn,
  oldCheckOut,
  oldAccommodation,
  oldTotalPrice
});
```

---

## 🤖 Automated Emails (Cron Jobs)

### Day-Before Reminders

**Scheduled:** Daily at 9:00 AM  
**Logic:** Finds all bookings with check-in = tomorrow and status = confirmed

```typescript
// Called by cron job
import { sendDailyReminders } from '../lib/email';
import { db } from '../lib/db';

const allBookings = db.bookings.getAll();
await sendDailyReminders(allBookings);
```

### Thank You + Review Requests

**Scheduled:** Daily at 9:00 AM  
**Logic:** Finds all bookings with check-out = yesterday and status = completed

```typescript
// Called by cron job
import { sendDailyThankYous } from '../lib/email';
import { db } from '../lib/db';

const allBookings = db.bookings.getAll();
await sendDailyThankYous(allBookings);
```

---

## 🛠️ Setup Instructions

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up (free tier: 3,000 emails/month)
3. Create an API key
4. Copy the key (starts with `re_`)

### 2. Add to Environment Variables

**.env** (local development):
```env
RESEND_API_KEY=re_your_actual_key_here
CRON_SECRET=random-secret-string-here
```

**Cloudflare Workers** (production):
- Add `RESEND_API_KEY` in environment variables
- Add `CRON_SECRET` in environment variables

### 3. Verify Your Domain

**In Resend Dashboard:**
1. Go to **Domains**
2. Add `glenugiekennels.co.uk`
3. Add DNS records to your domain provider
4. Wait for verification

**Update email addresses in `src/lib/email.ts`:**
```typescript
const FROM_EMAIL = 'Glenugie Kennels <bookings@glenugiekennels.co.uk>';
const ADMIN_EMAIL = 'info@glenugiekennels.co.uk';
```

### 4. Set Up Cron Job

Choose one option:

#### Option A: Cloudflare Cron Triggers (Recommended)

Add to `wrangler.jsonc`:
```json
{
  "triggers": {
    "crons": ["0 9 * * *"]
  }
}
```

#### Option B: GitHub Actions

Create `.github/workflows/send-emails.yml`:
```yaml
name: Send Daily Emails
on:
  schedule:
    - cron: '0 9 * * *'

jobs:
  send-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger email send
        run: |
          curl -X POST https://glenugiekennels.co.uk/api/emails/send-scheduled \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### Option C: Cron-job.org

1. Sign up at [cron-job.org](https://cron-job.org)
2. Create job:
   - URL: `https://glenugiekennels.co.uk/api/emails/send-scheduled`
   - Schedule: Daily 9:00 AM
   - Method: POST
   - Header: `Authorization: Bearer your-cron-secret`

---

## 🎯 Integration Points

### Where to Add Email Calls

#### 1. **Online Booking Flow** (`src/pages/api/bookings.ts`)

```typescript
// After successful booking creation
await sendBookingConfirmation(newBooking, false);

// After payment via Stripe webhook
await sendPaymentReceived(booking, amount, paymentType);
```

#### 2. **Admin Dashboard** (`src/components/admin/CreateBookingForm.tsx`)

```typescript
// After creating manual booking
await sendBookingConfirmation(newBooking, true);
```

#### 3. **Admin Booking Management** (`src/pages/api/admin/bookings/[bookingId].ts`)

```typescript
// When updating booking
if (hasChanges) {
  await sendBookingAmended(booking, {
    oldCheckIn: originalBooking.checkIn,
    oldCheckOut: originalBooking.checkOut,
    // etc...
  });
}

// When cancelling booking
await sendBookingCancelled(booking, refundAmount);
```

#### 4. **Payment Webhook** (`src/pages/api/webhooks/stripe.ts`)

```typescript
// When payment succeeds
await sendPaymentReceived(booking, amountPaid, 'deposit');
```

---

## 📋 Email Schedule Summary

| Email Type | When | Who | Trigger |
|------------|------|-----|---------|
| **Booking Confirmation** | Immediately | Customer + Admin | Booking created |
| **Payment Received** | Immediately | Customer + Admin | Payment processed |
| **Booking Cancelled** | Immediately | Customer | Booking cancelled |
| **Booking Amended** | Immediately | Customer | Booking modified |
| **Day-Before Reminder** | 9 AM daily | Customer | 1 day before check-in |
| **Thank You + Review** | 9 AM daily | Customer | 1 day after check-out |

---

## 🎨 Email Features

All emails include:
- ✅ Glenugie Kennels branding
- ✅ Mobile responsive design
- ✅ Beautiful gradient headers
- ✅ Clear call-to-action buttons
- ✅ Professional typography
- ✅ Contact information in footer
- ✅ Proper email formatting
- ✅ Accessible HTML structure

---

## 🧪 Testing

### Test Individual Email

```typescript
import { sendEmail, bookingConfirmationEmail } from './lib/email';

// Create email
const email = bookingConfirmationEmail(testBooking);

// Send it
await sendEmail(email);
```

### Test via API Endpoint

```bash
# Test scheduled emails
curl -X POST http://localhost:4321/api/emails/send-scheduled \
  -H "Authorization: Bearer your-cron-secret"
```

### Monitor in Resend Dashboard

1. Go to [resend.com/emails](https://resend.com/emails)
2. View all sent emails
3. Check delivery status
4. Debug any issues

---

## 📊 Monitoring

### Daily Checklist
- [ ] Check Resend dashboard for delivery rates
- [ ] Monitor bounce/complaint rates
- [ ] Verify scheduled emails are running

### Weekly Checklist
- [ ] Review email open rates
- [ ] Check Google review link clicks
- [ ] Test sample booking flow

### Monthly Checklist
- [ ] Review and update email content
- [ ] Check seasonal messaging
- [ ] Analyze customer feedback

---

## 🔍 Troubleshooting

### Emails Not Sending

1. **Check API key:**
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Check domain verification:**
   - Go to Resend dashboard → Domains
   - Ensure status is "Verified"

3. **Check console logs:**
   ```typescript
   console.log('Email sent:', result);
   ```

### Emails Going to Spam

1. **Verify domain properly** (SPF, DKIM, DMARC records)
2. **Use verified sender email** (`bookings@glenugiekennels.co.uk`)
3. **Avoid spam trigger words**
4. **Include unsubscribe link** (optional)

### Scheduled Emails Not Running

1. **Check cron job is configured**
2. **Verify CRON_SECRET matches**
3. **Test endpoint manually:**
   ```bash
   curl -X POST https://your-domain.com/api/emails/send-scheduled \
     -H "Authorization: Bearer your-cron-secret"
   ```

---

## 📝 Customization

### Update Email Content

Edit templates in `src/lib/email.ts`:

```typescript
// Find the email function (e.g., bookingConfirmationEmail)
export function bookingConfirmationEmail(booking: Booking): EmailOptions {
  return {
    to: booking.customerEmail,
    subject: `🐾 Booking Confirmed - Glenugie Kennels`, // Edit subject
    html: `
      <!-- Edit HTML content here -->
    `
  };
}
```

### Change Email Addresses

In `src/lib/email.ts`:

```typescript
const FROM_EMAIL = 'Glenugie Kennels <bookings@glenugiekennels.co.uk>';
const ADMIN_EMAIL = 'info@glenugiekennels.co.uk';
const GOOGLE_REVIEW_LINK = 'https://g.page/r/CVLGkcM4kJ3DEBM/review';
```

### Adjust Timing

Change cron schedule:

```json
// Daily at 8 AM instead of 9 AM
"crons": ["0 8 * * *"]

// Twice daily (9 AM and 5 PM)
"crons": ["0 9,17 * * *"]
```

---

## 🎉 What's Included

### Complete Email Suite
1. ✅ Booking confirmation (customer + admin)
2. ✅ Payment received (customer + admin)
3. ✅ Booking cancelled (customer)
4. ✅ Booking amended (customer)
5. ✅ Day-before reminder (customer)
6. ✅ Thank you + review (customer)

### Professional Features
- Beautiful, branded design
- Mobile responsive
- Clear call-to-actions
- Google Review integration
- Payment tracking
- Booking management
- Admin notifications

### Automated Workflows
- Daily reminder emails
- Daily thank you emails
- Instant confirmations
- Real-time notifications

---

## 🚀 Quick Start Checklist

- [ ] Get Resend API key
- [ ] Add `RESEND_API_KEY` to `.env`
- [ ] Verify domain in Resend
- [ ] Update email addresses in code
- [ ] Test booking confirmation
- [ ] Set up cron job
- [ ] Test scheduled emails
- [ ] Monitor Resend dashboard
- [ ] Create first real booking
- [ ] Verify all emails work

---

## 📞 Support

### Email Issues
- Check Resend dashboard logs
- Review console errors
- Verify environment variables

### Booking Integration
- See `BOOKING_SYSTEM_UPDATE.md`
- Check API endpoints
- Review admin functions

### Cron Jobs
- Test endpoint manually
- Check cron logs
- Verify authentication

---

**You're all set!** 🎊

Your complete email system is ready to send professional, automated emails that will delight your customers and streamline your operations. All 8 email types are configured and ready to use!
