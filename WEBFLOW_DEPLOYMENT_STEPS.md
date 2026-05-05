# 🚀 Webflow Cloud Deployment - Final Steps

## ✅ What We Just Configured

Updated `wrangler.jsonc` with:
- ✅ KV namespace binding: `BOOKINGS_KV` → ID: `4dd144b89325450b8949d8132a8ad02c`
- ✅ Environment variables:
  - `ADMIN_PASSWORD=Peterhead2026!`
  - `ADMIN_EMAIL=info@glenugiekennels.co.uk`
  - `GOOGLE_REVIEW_LINK=https://maps.google.com/?cid=8993054838066790595`

---

## 🔴 IMPORTANT: Missing Secrets

You still need to add these **secret keys** (don't put these in wrangler.jsonc, they should be secrets):

### Option 1: Add in Webflow Dashboard
If Webflow has a secrets/environment variables section:
```
RESEND_API_KEY=re_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
```

### Option 2: Add via Wrangler CLI
```bash
npx wrangler secret put RESEND_API_KEY
# Enter your Resend API key when prompted

npx wrangler secret put STRIPE_SECRET_KEY
# Enter your Stripe secret key when prompted
```

---

## 📋 Deployment Checklist

### Step 1: Pull Latest Changes
If you're working on your local machine:
```bash
git pull origin main
```

### Step 2: Push to GitHub
If you made changes locally:
```bash
git add .
git commit -m "Configure KV and environment variables"
git push origin main
```

### Step 3: Wait for Webflow Auto-Deploy
- Webflow should automatically detect the GitHub push
- Wait for the build to complete
- Check your Webflow dashboard for deployment status

### Step 4: Verify KV Binding in Webflow
1. Go to your Webflow project settings
2. Look for "Bindings" or "Resources" or "Cloudflare Settings"
3. Verify that `BOOKINGS_KV` is bound to namespace ID: `4dd144b89325450b8949d8132a8ad02c`
4. If not visible, you may need to configure it manually in Webflow

### Step 5: Add Secret Keys
Add `RESEND_API_KEY` and `STRIPE_SECRET_KEY` using one of the options above.

### Step 6: Test the Environment
Visit: `https://glenugiekennels.webflow.io/app/api/debug/env-check`

You should now see:
- ✅ KV Storage: Bound
- ✅ Environment Variables: Present
- ✅ Database: Working

### Step 7: Initialize Data (First Time Only)
If this is the first deployment with KV:

Visit: `https://glenugiekennels.webflow.io/app/api/admin/init-data`

Or use the admin dashboard to initialize default data.

### Step 8: Test Admin Login
1. Go to: `https://glenugiekennels.webflow.io/app/admin`
2. Enter password: `Peterhead2026!`
3. Verify you can see bookings, rules, and rates

---

## 🔍 Troubleshooting

### KV Still Not Bound After Deploy

**Check Webflow Settings**:
1. In your Webflow project, go to Settings
2. Look for any section related to:
   - Cloudflare Bindings
   - Worker Configuration
   - Environment/Resources
3. Manually add the KV binding if there's an option

**Alternative: Deploy to Cloudflare Pages Directly**
If Webflow doesn't support KV bindings properly, you can deploy to Cloudflare Pages:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Workers & Pages → Create → Pages → Connect to Git
3. Select your GitHub repo
4. Configure build settings:
   - Build command: `npm run build`
   - Build output: `dist`
5. Add KV binding in Settings → Functions → KV namespace bindings
6. Add environment variables in Settings → Environment Variables

### Environment Variables Still Missing

**If using Webflow Cloud**:
- Check if there's a separate "Secrets" or "Environment Variables" section
- Contact Webflow support to ask how to set environment variables

**If using Cloudflare Pages**:
- Add them in Settings → Environment Variables
- Secrets should be added with "Encrypt" option enabled

### Data Not Persisting

**Without KV**:
- Data is stored in memory only
- Will be lost on Worker restarts
- Need to properly bind KV namespace

**With KV**:
- Check Cloudflare KV dashboard to see if data is being written
- View your KV namespace at: https://dash.cloudflare.com → Workers & Pages → KV
- You should see keys: `bookings`, `booking-rules`, `rates`

---

## 📞 Need Help?

### Webflow Support
If KV bindings aren't working, ask Webflow:
1. How to bind a Cloudflare KV namespace to my app
2. How to set environment variables that are accessible via `locals.runtime.env`
3. Whether they support the standard Cloudflare Workers runtime

### Alternative Deployment
If Webflow Cloud doesn't support KV properly, I recommend deploying directly to Cloudflare Pages instead. It's:
- Free for most use cases
- Full Cloudflare Workers compatibility
- Better logging and debugging
- Auto-deploys from GitHub

---

## ✅ Success Criteria

You'll know everything is working when:
1. ✅ Environment check shows all green
2. ✅ Admin login works
3. ✅ Can view/edit bookings
4. ✅ Data persists after refreshing the page
5. ✅ Can create new bookings from the booking form

---

## 🎯 Current Status Summary

**Completed**:
- ✅ Code deployed to Webflow
- ✅ Database working (598 bookings found)
- ✅ KV namespace ID configured in wrangler.jsonc
- ✅ Basic environment variables set
- ✅ Admin password configured

**Pending**:
- ⏳ Webflow needs to recognize KV binding from wrangler.jsonc
- ⏳ Add RESEND_API_KEY secret
- ⏳ Add STRIPE_SECRET_KEY secret
- ⏳ Verify KV is accessible at runtime

**Next Action**:
Push updated wrangler.jsonc to GitHub and wait for Webflow to redeploy, then verify the environment check page.

---

Good luck! Let me know if you run into any issues. 🙂
