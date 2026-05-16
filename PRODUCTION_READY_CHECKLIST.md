# 🚀 Production Ready Checklist for Glenugie Kennels

Your booking system is **fully built and ready to take bookings!** Follow this checklist to get everything configured for production.

## ✅ Current Status

**What's Already Done:**
- ✅ Complete booking form with 5-step process
- ✅ Stripe payment integration (deposit & full payment)
- ✅ Admin dashboard with booking management
- ✅ Calendar view with availability tracking
- ✅ Email confirmation system (Resend)
- ✅ Customer portal for managing bookings
- ✅ Booking rules (min nights, blocked dates, peak seasons)
- ✅ Kennel allocation system
- ✅ All accommodation types configured
- ✅ Responsive design for all devices

**What Needs Configuration:**
- ⚠️ Cloudflare KV storage binding (for production data)
- ⚠️ Environment variables verification
- ⚠️ Initial data setup
- ⚠️ Stripe webhook configuration
- ⚠️ Email templates customization

---

## 🔧 Step-by-Step Setup

### 1. Cloudflare KV Storage Setup (CRITICAL)

**Why:** Your bookings, rules, and rates are stored in Cloudflare KV. Without this, the admin dashboard will be empty.

**Steps:**

1. **Create KV Namespace:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages** → **KV**
   - Click **Create namespace**
   - Name: `BOOKINGS_KV`
   - Click **Add**
   - **Copy the Namespace ID** (you'll need this)

2. **Bind KV to Your Pages Project:**
   - Go to **Workers & Pages**
   - Click your project (likely `glenugie-booking` or similar)
   - Go to **Settings** tab
   - Scroll to **Bindings** section
   - Click **Add** under **KV Namespace Bindings**
   - Variable name: `BOOKINGS_KV`
   - KV namespace: Select `BOOKINGS_KV`
   - Click **Save**

3. **Update wrangler.jsonc** (for local development):
   ```jsonc
   {
     "name": "glenugie-kennels",
     "compatibility_date": "2024-01-01",
     "kv_namespaces": [
       {
         "binding": "BOOKINGS_KV",
         "id": "YOUR_ACTUAL_KV_ID_HERE" // Replace with the ID from step 1
       }
     ]
   }
   ```

---

### 2. Environment Variables Check

**Verify these are set in Cloudflare Pages:**

Go to: **Pages Project** → **Settings** → **Environment variables**

**Required Variables:**

```env
# Admin Access
ADMIN_PASSWORD=your_secure_password_here

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (set this after webhook setup)

# Email Service (Resend)
RESEND_API_KEY=re_...

# Webflow (if using CMS)
WEBFLOW_API_HOST=https://api.webflow.com
WEBFLOW_SITE_API_TOKEN=...
WEBFLOW_CMS_SITE_API_TOKEN=...
```

**⚠️ Important:** Use **production** Stripe keys for live bookings, **test** keys for testing.

---

### 3. Initialize Your Data

**After KV is bound**, initialize with your booking rules and rates:

**Option A: Via API (Recommended)**

Visit this URL in your browser:
```
https://www.glenugiekennels.co.uk/api/admin/init-data
```

This will create:
- Default booking rules (min nights, blocked dates, peak seasons)
- Current rates for all accommodation types
- Sample booking (optional - you can delete this)

**Option B: Via Admin Dashboard**

1. Go to `/admin`
2. Login with your admin password
3. Navigate to **Booking Rules** tab
4. Set your rules:
   - Minimum nights (default: 1)
   - Peak season dates (e.g., Christmas, Easter, Summer)
   - Blocked dates (maintenance, holidays)
   - Max advance booking days (default: 365)

5. Navigate to **Rates** tab
6. Verify/update pricing:
   - Luxury Dog Suites: £25/night
   - Standard Kennels: £20/night
   - Cattery Suites: £15/night
   - Additional pets: £7.50-£10/night

---

### 4. Stripe Webhook Setup (For Payment Confirmations)

**Why:** Webhooks notify your system when payments succeed/fail.

**Steps:**

1. **Go to Stripe Dashboard:**
   - [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)

2. **Add Endpoint:**
   - Click **Add endpoint**
   - URL: `https://www.glenugiekennels.co.uk/api/webhooks/stripe`
   - Events to send:
     - ✅ `checkout.session.completed`
     - ✅ `payment_intent.succeeded`
     - ✅ `charge.refunded`
   - Click **Add endpoint**

3. **Get Webhook Secret:**
   - Click on your new webhook
   - Click **Reveal** under "Signing secret"
   - Copy the secret (starts with `whsec_`)

4. **Add to Environment Variables:**
   - Cloudflare Pages → Settings → Environment variables
   - Add: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

### 5. Email Configuration

**Your email system is already set up with Resend!**

**Verify:**

1. **Check Resend Dashboard:**
   - [https://resend.com/emails](https://resend.com/emails)
   - Verify your sending domain is active

2. **Test Email:**
   - Make a test booking
   - Check if confirmation emails arrive
   - Check spam folder if not in inbox

**Email Templates Sent:**
- ✅ Booking confirmation (customer)
- ✅ Booking notification (admin)
- ✅ Payment confirmation
- ✅ Booking updates/cancellations

**Customize Email Content:**
- Edit: `src/lib/email.ts`
- Update sender name, subject lines, email body

---

### 6. Test Your Booking System

**Use Stripe Test Mode First:**

1. **Set Test Keys:**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. **Make Test Booking:**
   - Go to `/booking`
   - Select accommodation
   - Choose dates
   - Fill in details
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

3. **Verify:**
   - ✅ Booking appears in admin dashboard
   - ✅ Email confirmation received
   - ✅ Payment shows in Stripe dashboard
   - ✅ Calendar shows booking

4. **Test Scenarios:**
   - ✅ Booking >7 days in advance (30% deposit)
   - ✅ Booking ≤7 days in advance (full payment)
   - ✅ Multiple pets
   - ✅ Different accommodation types
   - ✅ Blocked dates (should prevent booking)
   - ✅ Peak season (higher min nights)

---

### 7. Switch to Live Mode

**When ready for real bookings:**

1. **Update Stripe Keys:**
   - Replace test keys with live keys
   - `sk_live_...` and `pk_live_...`

2. **Update Webhook:**
   - Create new webhook in Stripe (live mode)
   - Update `STRIPE_WEBHOOK_SECRET`

3. **Final Test:**
   - Make a small real booking (£1 test)
   - Verify everything works
   - Refund the test booking

---

## 📋 Pre-Launch Checklist

### Content & Settings

- [ ] Verify all accommodation names and descriptions
- [ ] Check pricing is correct
- [ ] Set booking rules (min nights, blocked dates)
- [ ] Add peak season dates
- [ ] Update contact information
- [ ] Review terms & conditions
- [ ] Test contact form

### Technical

- [ ] KV storage bound and initialized
- [ ] All environment variables set
- [ ] Stripe webhooks configured
- [ ] Email sending working
- [ ] Admin password changed from default
- [ ] Test bookings completed successfully
- [ ] Calendar showing availability correctly
- [ ] Mobile responsiveness verified

### Legal & Business

- [ ] Terms & conditions reviewed
- [ ] Privacy policy in place
- [ ] Cancellation policy clear
- [ ] Deposit/payment terms stated
- [ ] Vaccination requirements documented
- [ ] Insurance requirements stated

---

## 🎯 Quick Start Commands

**Local Development:**
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

**Deploy to Production:**
```bash
npm run build
npx wrangler pages deploy dist
```

**Initialize Data:**
```bash
# Visit in browser after deployment:
https://www.glenugiekennels.co.uk/api/admin/init-data
```

---

## 🔍 Verification URLs

After setup, test these URLs:

1. **Homepage:** `https://www.glenugiekennels.co.uk/`
2. **Booking Form:** `https://www.glenugiekennels.co.uk/booking`
3. **Admin Dashboard:** `https://www.glenugiekennels.co.uk/admin`
4. **API Health Check:** `https://www.glenugiekennels.co.uk/api/admin/bookings`
5. **Contact Form:** `https://www.glenugiekennels.co.uk/contact`

---

## 🆘 Troubleshooting

### "No bookings found" in Admin Dashboard

**Cause:** KV not bound or not initialized

**Fix:**
1. Check KV binding in Cloudflare Pages settings
2. Visit `/api/admin/init-data` to initialize
3. Check browser console for errors

### Payments Not Processing

**Cause:** Stripe keys incorrect or webhook not set up

**Fix:**
1. Verify Stripe keys in environment variables
2. Check Stripe dashboard for errors
3. Ensure webhook is configured and secret is set

### Emails Not Sending

**Cause:** Resend API key missing or invalid

**Fix:**
1. Check `RESEND_API_KEY` in environment variables
2. Verify domain in Resend dashboard
3. Check Resend logs for errors

### Dates Not Blocking

**Cause:** Booking rules not loaded or KV issue

**Fix:**
1. Check booking rules in admin dashboard
2. Verify KV has `booking-rules` key
3. Re-initialize data if needed

---

## 📞 Support Resources

- **Stripe Docs:** [https://stripe.com/docs](https://stripe.com/docs)
- **Cloudflare KV:** [https://developers.cloudflare.com/kv](https://developers.cloudflare.com/kv)
- **Resend Docs:** [https://resend.com/docs](https://resend.com/docs)
- **Astro Docs:** [https://docs.astro.build](https://docs.astro.build)

---

## 🎉 You're Ready!

Once you complete this checklist, your booking system will be **fully operational** and ready to accept real bookings!

**Next Steps:**
1. Complete the KV setup (most critical)
2. Initialize your data
3. Test with Stripe test mode
4. Switch to live mode
5. Start taking bookings! 🐾

---

**Questions?** Check the detailed guides:
- `KV_SETUP_GUIDE.md` - Detailed KV setup
- `ADMIN_GUIDE.md` - Admin dashboard usage
- `README.md` - Full system documentation
