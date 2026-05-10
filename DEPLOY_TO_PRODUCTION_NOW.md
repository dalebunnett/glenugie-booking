# 🚀 Deploy to Production - Complete Guide

## Step 1: Build the Project Locally

```bash
npm run build
```

This creates a `dist/` folder with your production-ready files.

## Step 2: Deploy via Webflow Dashboard

### Option A: Deploy via Webflow UI (Recommended)

1. **Open Webflow Designer**
   - Go to your site in Webflow
   - Open the Apps panel
   - Find your Glenugie Kennels app

2. **Push to Production**
   - Click "Deploy to Production" or "Publish"
   - Webflow will automatically build and deploy your code

### Option B: Deploy via Wrangler CLI

```bash
# Login to Cloudflare (if not already)
npx wrangler login

# Deploy to production
npx wrangler deploy
```

## Step 3: Set Environment Variables in Production

In your Webflow app settings or Cloudflare Workers dashboard, set these variables:

### Required Variables:
```
ADMIN_PASSWORD=your-secure-admin-password
SESSION_SECRET=your-random-secret-key-min-32-chars
```

### Optional (if using features):
```
RESEND_API_KEY=re_xxxxx (for emails)
STRIPE_SECRET_KEY=sk_live_xxxxx (for payments)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (for Stripe webhooks)
WEBFLOW_CMS_SITE_API_TOKEN=xxxxx (if using CMS)
```

## Step 4: Initialize Production Data

After deployment, visit these URLs to set up your production data:

1. **Initialize KV Storage**
   ```
   https://your-site.webflow.io/your-app-path/api/admin/init-kv
   ```

2. **Initialize Booking Data** (if migrating from local)
   ```
   https://your-site.webflow.io/your-app-path/api/admin/init-data
   ```

3. **Verify Admin Access**
   ```
   https://your-site.webflow.io/your-app-path/admin
   ```
   Login with your ADMIN_PASSWORD

## Step 5: Import Existing Bookings (if any)

If you have bookings in your local `data/bookings.json`:

1. Go to Admin Dashboard: `/admin`
2. Navigate to "Import Bookings"
3. Upload your `data/bookings.json` file
4. Click "Import"

## Step 6: Test Production Site

Visit these pages to verify everything works:

- ✅ Homepage: `/`
- ✅ Booking Form: `/booking`
- ✅ My Bookings: `/my-bookings`
- ✅ Admin Dashboard: `/admin`
- ✅ Accommodations: `/accommodations`

## Step 7: Configure Cron Jobs (Optional)

For scheduled email reminders, set up a cron trigger in Cloudflare Workers:

1. Go to Cloudflare Workers dashboard
2. Find your worker
3. Add a Cron Trigger: `0 9 * * *` (daily at 9 AM)
4. This will trigger `/api/emails/send-scheduled`

## Troubleshooting

### Issue: "Missing environment variables"
**Solution:** Set all required env vars in Webflow app settings

### Issue: "No bookings showing"
**Solution:** Run the init-data endpoint to populate KV storage

### Issue: "Admin login not working"
**Solution:** Verify ADMIN_PASSWORD and SESSION_SECRET are set

### Issue: "404 errors on routes"
**Solution:** Ensure base path is configured correctly in `astro.config.mjs`

## Quick Deploy Commands

```bash
# Full deployment process
npm run build
npx wrangler deploy

# Or use Webflow's built-in deployment
# (Just click "Deploy" in the Webflow Apps panel)
```

## Post-Deployment Checklist

- [ ] Environment variables set
- [ ] KV storage initialized
- [ ] Booking data imported (if applicable)
- [ ] Admin access verified
- [ ] Test booking flow end-to-end
- [ ] Email notifications working (if configured)
- [ ] All pages loading correctly
- [ ] Mobile responsiveness checked

## Production URLs

Your app will be available at:
```
https://glenugiekennels.co.uk/[your-app-mount-path]/
```

Or via Webflow preview:
```
https://[your-site].webflow.io/[your-app-mount-path]/
```

## Need Help?

- Check `DEPLOYMENT_CHECKLIST.md` for detailed steps
- Review `ADMIN_GUIDE.md` for admin features
- See `TROUBLESHOOTING.md` for common issues

---

**Ready to deploy?** Run `npm run build` and then deploy via Webflow! 🚀
