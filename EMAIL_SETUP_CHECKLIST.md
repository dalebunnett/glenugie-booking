# Email Suite - Quick Setup Checklist ✅

## 1. Install Dependencies ✓
Already done! Resend is installed.

## 2. Get Resend API Key 🔑

### Steps:
1. Go to **https://resend.com**
2. Sign up for free account
3. Navigate to **API Keys** in dashboard
4. Click **Create API Key**
5. Copy the key (starts with `re_`)

### Free Tier Includes:
- 3,000 emails/month
- 100 emails/day
- All features included
- Perfect for getting started!

## 3. Add Environment Variables 🔐

Add to your `.env` file:

```env
# Resend Email API Key
RESEND_API_KEY=re_your_actual_key_here

# Cron Secret (create a random string)
CRON_SECRET=change-this-to-random-string
```

**For Production (Webflow/Cloudflare):**
Add these in your Cloudflare Workers environment variables:
- `RESEND_API_KEY` = your Resend key
- `CRON_SECRET` = your random secret

## 4. Configure Email Addresses 📧

Edit `src/lib/email.ts`:

```typescript
// Line 13-14
const FROM_EMAIL = 'Glenugie Kennels <bookings@glenugiekennels.co.uk>';
const ADMIN_EMAIL = 'info@glenugiekennels.co.uk';
```

**Update to your actual email addresses!**

### Domain Verification (Important!)

#### Option A: Use Your Domain (Recommended)
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `glenugiekennels.co.uk`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually a few minutes)
6. You can now send from `@glenugiekennels.co.uk`

#### Option B: Use Resend Sandbox (Testing Only)
- No domain setup needed
- Can only send to verified email addresses
- Good for testing before going live

## 5. Test Your Setup 🧪

### Test Booking Confirmation Email:
1. Make a test booking on your site
2. Check console for email log
3. Check Resend dashboard under **Logs**
4. Verify email arrives in inbox

### Test Scheduled Emails:
```bash
# Run this command to test
curl -X POST http://localhost:4321/api/emails/send-scheduled \
  -H "Authorization: Bearer your-cron-secret"
```

## 6. Set Up Scheduled Email Delivery ⏰

Choose ONE option:

### Option A: Cloudflare Cron Triggers (Recommended)

Create `src/scheduled-email.ts`:
```typescript
import { db } from './lib/db';
import { sendDailyReminders, sendDailyThankYous } from './lib/email';

export default {
  async scheduled(event: any, env: any, ctx: any) {
    console.log('Running scheduled email job...');
    
    const bookings = await db.bookings.getAll();
    await sendDailyReminders(bookings);
    await sendDailyThankYous(bookings);
    
    console.log('Scheduled email job complete');
  }
};
```

Add to `wrangler.jsonc`:
```json
{
  "triggers": {
    "crons": ["0 9 * * *"]
  }
}
```

### Option B: GitHub Actions (Free)

Create `.github/workflows/send-emails.yml`:
```yaml
name: Send Daily Emails
on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM UTC daily

jobs:
  send-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger email send
        run: |
          curl -X POST https://your-domain.com/api/emails/send-scheduled \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add `CRON_SECRET` to GitHub repository secrets.

### Option C: Cron-job.org (External Service)

1. Sign up at **https://cron-job.org** (free)
2. Create new cron job:
   - **URL**: `https://your-domain.com/api/emails/send-scheduled`
   - **Schedule**: Daily at 9:00 AM
   - **Request Method**: POST
   - **Headers**: Add `Authorization: Bearer your-cron-secret`

## 7. Email Schedule Summary 📅

| Email Type | When Sent | Recipient | Trigger |
|------------|-----------|-----------|---------|
| **Booking Confirmation** | Immediately | Customer + Admin | New booking created |
| **Payment Notification** | Immediately | Admin | Payment received |
| **Day Before Reminder** | 9 AM, 1 day before check-in | Customer | Cron job |
| **Thank You + Review** | 9 AM, 1 day after check-out | Customer | Cron job |

## 8. Verify Everything Works ✓

### Checklist:
- [ ] Resend API key added to `.env`
- [ ] Domain verified in Resend (or using sandbox)
- [ ] FROM_EMAIL and ADMIN_EMAIL updated
- [ ] Test booking creates and sends confirmation
- [ ] Admin receives new booking notification
- [ ] Admin receives payment notification
- [ ] Cron job configured for scheduled emails
- [ ] Test scheduled email endpoint works
- [ ] Monitor Resend dashboard for delivery

## 9. Going Live 🚀

Before production:
1. ✅ Verify domain in Resend
2. ✅ Test all email templates
3. ✅ Set up real cron job
4. ✅ Add environment variables to production
5. ✅ Test payment flow with real Stripe
6. ✅ Send yourself a test booking
7. ✅ Monitor first few days closely

## 10. Monitor & Maintain 📊

### Weekly Tasks:
- Check Resend dashboard for delivery rates
- Review bounce/complaint rates
- Test scheduled emails are working

### Monthly Tasks:
- Review email content for improvements
- Check if customers are clicking review link
- Update seasonal messaging if needed

---

## Quick Environment Variables Reference

Add these to `.env` (development):
```env
RESEND_API_KEY=re_xxxxx
CRON_SECRET=random-secret-string
ADMIN_EMAIL=your-email@domain.com  # Optional override
```

Add these to Cloudflare Workers (production):
```
RESEND_API_KEY
CRON_SECRET
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
ADMIN_PASSWORD
```

---

## Need Help?

- 📚 **Resend Docs**: https://resend.com/docs
- 🎯 **Resend Dashboard**: https://resend.com/emails
- ❓ **Email Guide**: See `EMAIL_SUITE_GUIDE.md` for detailed documentation
- 🐛 **Issues**: Check console logs and Resend dashboard

---

## What's Included

✅ **5 Professional Email Templates**
  1. Booking Confirmation (Customer)
  2. New Booking Alert (Admin)
  3. Day Before Reminder (Customer)
  4. Thank You + Review Request (Customer)
  5. Payment Received (Admin)

✅ **Automated Sending**
  - Immediate emails on booking/payment
  - Scheduled reminders and thank yous
  - Admin notifications

✅ **Beautiful Design**
  - Brand colors and fonts
  - Mobile responsive
  - Professional layout
  - Clear call-to-actions

✅ **Google Review Integration**
  - Direct link: https://g.page/r/CVLGkcM4kJ3DEBM/review
  - Prominent button in thank you email
  - Sent 24 hours after checkout

---

**You're all set!** 🎉 

Your email suite is ready to send professional, automated emails to delight your customers and streamline your operations.
