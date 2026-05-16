# 🚀 Webflow Cloud Booking System Setup

## Your Deployment
**URL:** `https://glenugiekennels.co.uk/glenugie-booking`  
**Mount Path:** `/app`  
**Platform:** Webflow Cloud (Cloudflare Workers)

Your booking system is **fully built and deployed**! Follow these steps to make it ready to accept real bookings.

---

## ✅ What's Already Working

- ✅ Booking form deployed at `/glenugie-booking/booking`
- ✅ Admin dashboard at `/glenugie-booking/admin`
- ✅ All pages and components built
- ✅ Stripe integration code ready
- ✅ Email system configured
- ✅ Calendar and availability system

---

## 🔧 Required Setup Steps

### Step 1: Configure Environment Variables in Webflow

**Where:** Webflow Dashboard → Your Site → Apps → glenugie-booking → Settings

**Required Variables:**

```env
# Admin Access
ADMIN_PASSWORD=your_secure_password_here

# Stripe Keys (Use TEST keys first, then LIVE keys)
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_... (set after webhook setup)

# Email Service (Resend)
RESEND_API_KEY=re_...

# Optional: Webflow CMS (if using)
WEBFLOW_API_HOST=https://api.webflow.com
WEBFLOW_SITE_API_TOKEN=...
WEBFLOW_CMS_SITE_API_TOKEN=...
```

**How to Add:**
1. Go to Webflow Dashboard
2. Navigate to your site
3. Click **Apps** in left sidebar
4. Find **glenugie-booking** app
5. Click **Settings** or **Environment Variables**
6. Add each variable above

---

### Step 2: Set Up Cloudflare KV Storage

**Why:** Your bookings, rules, and rates are stored in Cloudflare KV.

#### Option A: Via Webflow Dashboard (Easiest)

1. In Webflow Apps settings for glenugie-booking
2. Look for **KV Bindings** or **Storage** section
3. Create or bind a KV namespace named: `BOOKINGS_KV`
4. Variable name must be: `BOOKINGS_KV`

#### Option B: Via Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Find the Workers project for your Webflow app
3. Go to **Settings** → **Bindings**
4. Add KV Namespace:
   - Variable name: `BOOKINGS_KV`
   - Create new namespace or select existing
5. Save

---

### Step 3: Initialize Your Data

**After KV is set up**, visit this URL to initialize:

```
https://glenugiekennels.co.uk/glenugie-booking/api/admin/init-data
```

This creates:
- ✅ Default booking rules
- ✅ Current rates for all accommodations
- ✅ Sample booking (you can delete this later)

**Expected Response:**
```json
{
  "success": true,
  "message": "Data initialized successfully"
}
```

---

### Step 4: Configure Stripe Webhooks

**Why:** Webhooks notify your system when payments succeed.

#### Create Webhook in Stripe:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. **Endpoint URL:** 
   ```
   https://glenugiekennels.co.uk/glenugie-booking/api/webhooks/stripe
   ```
4. **Events to send:**
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `charge.refunded`
5. Click **Add endpoint**

#### Get Webhook Secret:

1. Click on your new webhook
2. Click **Reveal** under "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to Webflow environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

### Step 5: Test Your Booking System

#### Test Mode (Recommended First):

1. **Use Stripe Test Keys:**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. **Make a Test Booking:**
   - Visit: `https://glenugiekennels.co.uk/glenugie-booking/booking`
   - Select accommodation
   - Choose dates
   - Fill in details
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)

3. **Verify:**
   - ✅ Booking completes successfully
   - ✅ Redirects to success page
   - ✅ Email confirmation received
   - ✅ Booking appears in admin dashboard

#### Check Admin Dashboard:

1. Visit: `https://glenugiekennels.co.uk/glenugie-booking/admin`
2. Login with your `ADMIN_PASSWORD`
3. You should see:
   - ✅ Booking statistics
   - ✅ Your test booking in the list
   - ✅ Calendar showing the booking
   - ✅ Booking rules loaded

---

### Step 6: Go Live!

**When ready for real bookings:**

1. **Switch to Live Stripe Keys:**
   - Update `STRIPE_SECRET_KEY` to `sk_live_...`
   - Update `STRIPE_PUBLISHABLE_KEY` to `pk_live_...`

2. **Create Live Webhook:**
   - In Stripe, switch to **Live mode** (toggle in top right)
   - Create new webhook with same URL and events
   - Update `STRIPE_WEBHOOK_SECRET` with live secret

3. **Final Test:**
   - Make a small real booking (you can refund it)
   - Verify everything works end-to-end

4. **You're Live! 🎉**

---

## 📋 Quick Reference URLs

### Customer-Facing Pages:
- **Home:** `https://glenugiekennels.co.uk/glenugie-booking/`
- **Booking Form:** `https://glenugiekennels.co.uk/glenugie-booking/booking`
- **Accommodations:** `https://glenugiekennels.co.uk/glenugie-booking/accommodations`
- **Contact:** `https://glenugiekennels.co.uk/glenugie-booking/contact`
- **My Bookings:** `https://glenugiekennels.co.uk/glenugie-booking/my-bookings`

### Admin Pages:
- **Dashboard:** `https://glenugiekennels.co.uk/glenugie-booking/admin`
- **Initialize Data:** `https://glenugiekennels.co.uk/glenugie-booking/api/admin/init-data`

### API Endpoints:
- **Bookings API:** `https://glenugiekennels.co.uk/glenugie-booking/api/bookings`
- **Admin Bookings:** `https://glenugiekennels.co.uk/glenugie-booking/api/admin/bookings`
- **Stripe Webhook:** `https://glenugiekennels.co.uk/glenugie-booking/api/webhooks/stripe`

---

## 🎯 Current Pricing

**Dogs:**
- Luxury Suites: £25/night
- Standard Kennels (Ruff's Retreat, The Village): £20/night
- Additional dogs: £10/night

**Cats:**
- Cattery Suites: £15/night
- Additional cats: £7.50/night

**To Update Pricing:**
1. Go to admin dashboard
2. Navigate to **Rates** tab
3. Update prices
4. Click **Save**

---

## 🔍 Troubleshooting

### Issue: "No bookings found" in Admin

**Cause:** KV not initialized or not bound

**Fix:**
1. Check KV binding is set up (variable name: `BOOKINGS_KV`)
2. Visit `/glenugie-booking/api/admin/init-data`
3. Refresh admin dashboard

### Issue: Payment fails or doesn't redirect

**Cause:** Stripe keys incorrect or missing

**Fix:**
1. Verify `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in environment variables
2. Check Stripe dashboard for errors
3. Ensure keys match the mode (test vs live)

### Issue: No confirmation emails

**Cause:** Resend API key missing or invalid

**Fix:**
1. Check `RESEND_API_KEY` in environment variables
2. Verify domain is verified in Resend dashboard
3. Check Resend logs for delivery status

### Issue: Dates not blocking properly

**Cause:** Booking rules not loaded

**Fix:**
1. Visit admin dashboard → Booking Rules tab
2. Verify rules are loaded
3. Re-initialize data if needed: `/glenugie-booking/api/admin/init-data`

### Issue: Can't access admin dashboard

**Cause:** Password not set or incorrect

**Fix:**
1. Check `ADMIN_PASSWORD` is set in environment variables
2. Try the password you set
3. If forgotten, update the environment variable and redeploy

---

## 🔐 Security Checklist

Before going live:

- [ ] Change `ADMIN_PASSWORD` from any default value
- [ ] Use strong, unique password for admin
- [ ] Switch to Stripe **live** keys (not test)
- [ ] Verify webhook secret is for **live** mode
- [ ] Test with real payment (then refund)
- [ ] Verify SSL certificate is active (https)
- [ ] Check all environment variables are set

---

## 📧 Email Configuration

Your system sends these emails via Resend:

**Customer Emails:**
- ✅ Booking confirmation
- ✅ Payment receipt
- ✅ Booking updates
- ✅ Cancellation confirmation

**Admin Emails:**
- ✅ New booking notification
- ✅ Payment received notification

**To Customize Email Content:**
- Edit: `src/lib/email.ts`
- Update sender name, subject lines, email body
- Redeploy via Webflow

---

## 🎨 Customization

### Update Accommodation Names/Pricing:

1. **Via Admin Dashboard:**
   - Go to `/glenugie-booking/admin`
   - Navigate to **Rates** tab
   - Update as needed

2. **Via Code:**
   - Edit: `src/lib/booking-types.ts`
   - Update `LUXURY_SUITES`, `CATTERY_SUITES`, `PRICING`
   - Commit and push to trigger Webflow rebuild

### Update Booking Rules:

1. Go to admin dashboard
2. Navigate to **Booking Rules** tab
3. Set:
   - Minimum nights
   - Peak season dates
   - Blocked dates (holidays, maintenance)
   - Max advance booking days

---

## 📱 Mobile Testing

Your booking system is fully responsive. Test on:

- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)
- [ ] Desktop (Chrome, Firefox, Safari)

**Key flows to test:**
- [ ] Browse accommodations
- [ ] Complete booking
- [ ] View booking confirmation
- [ ] Access customer portal
- [ ] Admin dashboard (tablet/desktop only)

---

## 🚀 Launch Checklist

### Pre-Launch:
- [ ] KV storage bound and initialized
- [ ] All environment variables set
- [ ] Stripe test mode working
- [ ] Test booking completed successfully
- [ ] Confirmation emails received
- [ ] Admin dashboard accessible
- [ ] Booking rules configured
- [ ] Pricing verified

### Go Live:
- [ ] Switch to Stripe live keys
- [ ] Create live webhook
- [ ] Update webhook secret
- [ ] Make test real booking
- [ ] Verify end-to-end flow
- [ ] Monitor first few bookings

### Post-Launch:
- [ ] Check bookings daily
- [ ] Monitor email delivery
- [ ] Review Stripe dashboard
- [ ] Check for errors in logs
- [ ] Respond to customer inquiries

---

## 📞 Support

**Webflow Cloud Support:**
- [Webflow Cloud Docs](https://developers.webflow.com/cloud)
- Webflow Support Chat

**Stripe Support:**
- [Stripe Docs](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

**Resend Support:**
- [Resend Docs](https://resend.com/docs)
- [Resend Support](https://resend.com/support)

---

## 🎉 You're Ready to Take Bookings!

Once you complete these steps, your booking system will be **fully operational** at:

**`https://glenugiekennels.co.uk/glenugie-booking`**

Customers can:
- ✅ Browse luxury suites and kennels
- ✅ Check real-time availability
- ✅ Book and pay online
- ✅ Receive instant confirmation
- ✅ Manage their bookings

You can:
- ✅ View all bookings in admin dashboard
- ✅ See calendar with availability
- ✅ Create manual bookings
- ✅ Update booking status
- ✅ Manage rates and rules
- ✅ Track payments

**Start with Step 1 above and work through each step!** 🐾
