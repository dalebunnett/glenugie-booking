# 🔧 Webflow Cloud + KV Setup Guide

## Overview
Your booking app uses **Cloudflare KV** (Key-Value storage) to persist data:
- Bookings
- Booking rules
- Rates
- Customer sessions

Since you're deploying via **Webflow Cloud** (which runs on Cloudflare Workers), you need to configure the KV binding.

---

## ✅ Step 1: Get Your KV Namespace ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **KV**
3. Find your KV namespace (or create one if needed)
4. Copy the **Namespace ID** (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

---

## ✅ Step 2: Update wrangler.jsonc

Open `wrangler.jsonc` and replace `YOUR_KV_NAMESPACE_ID_HERE` with your actual KV ID:

```jsonc
"kv_namespaces": [
  { 
    "binding": "KV", 
    "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",  // ← Your actual KV ID
    "preview_id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
  }
],
```

---

## ✅ Step 3: Configure Webflow Cloud

### Option A: If Webflow reads from wrangler.jsonc
1. Commit your updated `wrangler.jsonc` to GitHub
2. Push to your repository
3. Webflow Cloud should automatically detect the KV binding

### Option B: If Webflow has its own settings
1. In Webflow Apps settings, find **Cloudflare Bindings**
2. Add a KV binding:
   - **Binding name**: `KV`
   - **Namespace ID**: Your KV namespace ID

---

## ✅ Step 4: Set Environment Variables

Make sure these are set in Webflow Cloud:

```bash
ADMIN_PASSWORD=Peterhead2026!
RESEND_API_KEY=your_resend_key
ADMIN_EMAIL=your_admin_email
GOOGLE_REVIEW_LINK=your_google_review_link
```

---

## ✅ Step 5: Initialize Data (First Time Only)

After deploying, you need to initialize the KV with default data:

1. Go to your admin dashboard: `https://www.glenugiekennels.co.uk/app/admin`
2. Click **"Initialize Data"** button (if available)
3. Or call the init endpoint: `https://www.glenugiekennels.co.uk/app/api/admin/init-data`

This will populate KV with:
- Default booking rules
- Default rates
- Empty bookings array

---

## 🔍 Verify It's Working

### Check KV in Cloudflare Dashboard:
1. Go to **Workers & Pages** → **KV**
2. Click on your namespace
3. You should see keys like:
   - `bookings`
   - `booking-rules`
   - `rates`

### Check in Your App:
1. Go to admin dashboard
2. Try viewing bookings
3. Try updating rates
4. If you see data persisting after refresh, KV is working! ✅

---

## ⚠️ Troubleshooting

### "No KV binding found" warning in logs
- Check that `wrangler.jsonc` has the correct KV ID
- Verify Webflow Cloud has the binding configured
- Redeploy after making changes

### Data not persisting
- Check Cloudflare KV dashboard to see if data is being written
- Look at Worker logs for errors
- Verify the binding name is exactly `KV` (case-sensitive)

### Can't see bookings/rules
- Run the init-data endpoint first
- Check browser console for API errors
- Verify admin authentication is working

---

## 📝 How It Works

1. **API routes** initialize storage with KV binding:
   ```ts
   initDB(locals.runtime);
   ```

2. **Storage layer** tries KV first, falls back to in-memory:
   - ✅ With KV: Data persists across deployments
   - ⚠️ Without KV: Data lost on Worker restart

3. **Webflow Cloud** provides `locals.runtime.env.KV` to access the binding

---

## 🚀 Next Steps

After setup:
1. ✅ Initialize data
2. ✅ Test creating a booking
3. ✅ Verify data persists after refresh
4. ✅ Check KV dashboard to see stored data

Need help? Check the logs in Cloudflare Workers dashboard!
