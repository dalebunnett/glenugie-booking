# 🎯 START HERE: Deploy Your Booking System

## Current Situation

✅ **What's Ready:**
- Your booking system code is complete
- All features are built and tested
- Code is in this project folder

❌ **What's Missing:**
- The app is NOT deployed to your website yet
- URL `https://glenugiekennels.co.uk/glenugie-booking` shows 404

---

## 🚀 What You Need to Do

### Step 1: Deploy the App to Webflow Cloud

**You have 3 options:**

#### Option A: Via Webflow Workbench (Easiest)
If you're working in Webflow's development environment:

1. Open Webflow Workbench
2. Find the "glenugie-booking" app
3. Click **Deploy** → **Production**
4. Wait for deployment to complete
5. ✅ App will be live at `https://glenugiekennels.co.uk/glenugie-booking`

#### Option B: Via GitHub
If your code is in GitHub:

1. Connect GitHub repo to Webflow
2. Push code to main branch
3. Webflow auto-deploys
4. ✅ App goes live

#### Option C: Manual Build
If you need to build manually:

```bash
npm install
npm run build
```

Then upload the `dist` folder to Webflow.

---

### Step 2: Configure After Deployment

Once the app is deployed and accessible:

#### A. Set Environment Variables in Webflow Dashboard

Go to: **Webflow Dashboard → Apps → glenugie-booking → Settings**

Add these variables:

```
ADMIN_PASSWORD=YourSecurePassword123
STRIPE_SECRET_KEY=sk_test_51... (get from Stripe)
STRIPE_PUBLISHABLE_KEY=pk_test_... (get from Stripe)
RESEND_API_KEY=re_... (get from Resend)
```

#### B. Set Up KV Storage

In Webflow/Cloudflare settings:
- Create KV namespace
- Name it: `BOOKINGS_KV`
- Bind it to your app

#### C. Initialize Your Data

Visit this URL in your browser:
```
https://glenugiekennels.co.uk/glenugie-booking/api/admin/init-data
```

You should see:
```json
{"success": true, "message": "Data initialized"}
```

#### D. Set Up Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://glenugiekennels.co.uk/glenugie-booking/api/webhooks/stripe`
4. Events: Select `checkout.session.completed` and `payment_intent.succeeded`
5. Copy the webhook secret (starts with `whsec_`)
6. Add to Webflow environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

### Step 3: Test Your Booking System

1. **Visit the booking page:**
   ```
   https://glenugiekennels.co.uk/glenugie-booking/booking
   ```

2. **Make a test booking:**
   - Select a luxury suite
   - Choose dates
   - Fill in details
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete booking

3. **Check admin dashboard:**
   ```
   https://glenugiekennels.co.uk/glenugie-booking/admin
   ```
   - Login with your ADMIN_PASSWORD
   - Verify booking appears

---

## 🎯 Quick Reference

### Where to Get API Keys

**Stripe Keys:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API Keys**
3. Copy:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

**Resend API Key:**
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create new API key
3. Copy key (starts with `re_`)

**Admin Password:**
- Choose any secure password
- You'll use this to login to `/admin`

---

## 📋 Deployment Checklist

Use this to track your progress:

### Pre-Deployment
- [ ] Code is ready (✅ Already done!)
- [ ] You have access to Webflow Dashboard
- [ ] You have Stripe account
- [ ] You have Resend account

### Deployment
- [ ] App deployed to Webflow Cloud
- [ ] Can access `https://glenugiekennels.co.uk/glenugie-booking` (no 404)
- [ ] Home page loads correctly

### Configuration
- [ ] Environment variables set in Webflow
- [ ] KV storage bound (`BOOKINGS_KV`)
- [ ] Data initialized (visited `/api/admin/init-data`)
- [ ] Stripe webhook configured
- [ ] Webhook secret added to environment variables

### Testing
- [ ] Can access booking form
- [ ] Can complete test booking
- [ ] Receive confirmation email
- [ ] Booking appears in admin dashboard
- [ ] Can login to admin panel

### Go Live
- [ ] Switch to Stripe live keys
- [ ] Create live webhook
- [ ] Test with real payment (then refund)
- [ ] Ready to accept bookings! 🎉

---

## 🆘 Common Issues

### "I can't access the Webflow Dashboard"
- Contact your Webflow account owner
- You need admin access to the site
- Or ask them to deploy for you

### "I don't have Stripe/Resend accounts"
**Stripe:**
- Sign up at [stripe.com](https://stripe.com)
- Free to create account
- Use test mode first (no real money)

**Resend:**
- Sign up at [resend.com](https://resend.com)
- Free tier available
- Verify your domain for sending emails

### "The app won't deploy"
- Check build logs in Webflow Dashboard
- Try building locally first: `npm run build`
- Check for errors in terminal
- Contact Webflow support

### "I deployed but still see 404"
- Wait 5-10 minutes for DNS propagation
- Clear browser cache
- Try incognito/private window
- Check deployment status in Webflow Dashboard

---

## 📞 Get Help

**Webflow Support:**
- [Webflow Cloud Docs](https://developers.webflow.com/cloud)
- Support chat in Webflow Dashboard

**Stripe Support:**
- [Stripe Docs](https://stripe.com/docs)
- [Support](https://support.stripe.com)

**Resend Support:**
- [Resend Docs](https://resend.com/docs)

---

## 🎉 What You'll Have When Done

A fully functional booking system where:

**Customers can:**
- Browse luxury dog suites and cattery suites
- Check real-time availability
- Book and pay online securely
- Receive instant email confirmation
- Manage their bookings online

**You can:**
- View all bookings in admin dashboard
- See calendar with availability
- Create manual bookings
- Update booking status
- Manage rates and rules
- Track all payments

**All at:**
```
https://glenugiekennels.co.uk/glenugie-booking
```

---

## 🚀 Ready to Start?

1. **First:** Deploy the app (Step 1 above)
2. **Then:** Follow Step 2 to configure
3. **Finally:** Test with Step 3

**The code is ready. You just need to deploy it!** 🐾

---

## 📚 Additional Resources

- `DEPLOY_TO_WEBFLOW_CLOUD.md` - Detailed deployment guide
- `WEBFLOW_CLOUD_SETUP.md` - Post-deployment configuration
- `README.md` - Project overview

**Start with deploying, then come back to configure!**
