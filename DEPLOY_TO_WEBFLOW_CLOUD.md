# 🚀 Deploy Booking System to Webflow Cloud

## Current Status
Your booking system code is **ready** but **not yet deployed** to `https://glenugiekennels.co.uk/glenugie-booking`.

The site is currently running WordPress. You need to deploy this Astro app as a Webflow Cloud app.

---

## 📋 Deployment Options

### Option 1: Deploy via Webflow Workbench (Recommended)

This is the easiest method if you're working in Webflow's development environment.

1. **Open Webflow Workbench**
   - Go to your Webflow project
   - Open the Apps section
   - Find or create the "glenugie-booking" app

2. **Deploy from Workbench**
   - Click **Deploy** button
   - Select **Production** environment
   - Wait for build to complete
   - App will be available at `/glenugie-booking`

3. **Verify Deployment**
   - Visit: `https://glenugiekennels.co.uk/glenugie-booking`
   - Should see the home page (not 404)

---

### Option 2: Deploy via GitHub + Webflow

If your code is in a GitHub repository:

1. **Connect GitHub to Webflow**
   - In Webflow Dashboard → Apps → glenugie-booking
   - Go to Settings → Deployment
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node version: 18 or higher

3. **Deploy**
   - Push code to main/master branch
   - Webflow will auto-deploy
   - Or manually trigger deployment in Webflow dashboard

---

### Option 3: Manual Build & Upload

If you have access to upload built files:

1. **Build Locally**
   ```bash
   npm install
   npm run build
   ```

2. **Upload to Webflow**
   - The `dist` folder contains your built app
   - Upload via Webflow's deployment interface
   - Or use Webflow CLI if available

---

## 🔧 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] `webflow.json` is configured correctly
  ```json
  {
    "cloud": {
      "framework": "astro",
      "project_id": "bbe639d0-9f8d-4e1f-9a2d-fcec4c31f416",
      "environment": "production",
      "mountPath": "/app"
    }
  }
  ```

- [ ] `astro.config.mjs` has correct base path
  ```javascript
  export default defineConfig({
    base: '/app',
    // ... rest of config
  });
  ```

- [ ] All dependencies are in `package.json`

- [ ] Build completes successfully locally:
  ```bash
  npm run build
  ```

---

## 🌐 After Deployment

Once deployed, you'll need to:

### 1. Set Environment Variables

In Webflow Dashboard → Apps → glenugie-booking → Settings:

```env
ADMIN_PASSWORD=your_secure_password
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...
```

### 2. Bind KV Storage

- Create or bind KV namespace: `BOOKINGS_KV`
- This stores bookings, rules, and rates

### 3. Initialize Data

Visit: `https://glenugiekennels.co.uk/glenugie-booking/api/admin/init-data`

### 4. Configure Stripe Webhook

Add webhook in Stripe Dashboard:
- URL: `https://glenugiekennels.co.uk/glenugie-booking/api/webhooks/stripe`
- Events: `checkout.session.completed`, `payment_intent.succeeded`

### 5. Test!

- Visit: `https://glenugiekennels.co.uk/glenugie-booking/booking`
- Make a test booking
- Verify in admin: `https://glenugiekennels.co.uk/glenugie-booking/admin`

---

## 🐛 Troubleshooting Deployment

### Issue: 404 Error After Deployment

**Possible Causes:**
1. Mount path mismatch
2. Base URL not configured
3. Deployment didn't complete

**Fix:**
- Check `webflow.json` mountPath matches URL path
- Verify `astro.config.mjs` base setting
- Check Webflow deployment logs for errors

### Issue: Build Fails

**Common Causes:**
- Missing dependencies
- Node version mismatch
- TypeScript errors

**Fix:**
```bash
# Test build locally first
npm install
npm run build

# Check for errors
npm run astro check
```

### Issue: Environment Variables Not Working

**Fix:**
- Verify variables are set in Webflow Dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Issue: KV Storage Not Working

**Fix:**
- Ensure KV namespace is bound with name: `BOOKINGS_KV`
- Check Cloudflare dashboard for KV namespace
- Verify binding in Webflow app settings

---

## 📞 Need Help?

**Webflow Support:**
- [Webflow Cloud Documentation](https://developers.webflow.com/cloud)
- Webflow Support Chat in Dashboard
- [Webflow Community Forum](https://forum.webflow.com)

**Check Deployment Status:**
- Webflow Dashboard → Apps → glenugie-booking → Deployments
- View build logs for errors
- Check deployment history

---

## 🎯 Quick Start After Deployment

Once your app is live at `https://glenugiekennels.co.uk/glenugie-booking`:

1. **Set environment variables** (see above)
2. **Bind KV storage** (`BOOKINGS_KV`)
3. **Initialize data**: Visit `/api/admin/init-data`
4. **Login to admin**: Visit `/admin`
5. **Test booking**: Visit `/booking`
6. **Configure Stripe webhook**
7. **Go live!** 🎉

---

## 🔄 Updating After Deployment

To update your app:

1. Make code changes
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Deploy via Webflow (push to GitHub or manual deploy)
5. Changes will be live in a few minutes

---

## 📱 What You'll Have After Deployment

**Customer Pages:**
- Home: `/glenugie-booking/`
- Booking Form: `/glenugie-booking/booking`
- Accommodations: `/glenugie-booking/accommodations`
- My Bookings: `/glenugie-booking/my-bookings`
- Contact: `/glenugie-booking/contact`

**Admin Pages:**
- Dashboard: `/glenugie-booking/admin`
- Manage bookings, rates, rules

**API Endpoints:**
- Bookings API: `/glenugie-booking/api/bookings`
- Admin API: `/glenugie-booking/api/admin/*`
- Stripe Webhook: `/glenugie-booking/api/webhooks/stripe`

---

## ✅ Deployment Complete!

Once deployed and configured, your booking system will be fully operational and ready to accept bookings! 🐾

Follow the **WEBFLOW_CLOUD_SETUP.md** guide for post-deployment configuration.
