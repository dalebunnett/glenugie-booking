# Cloudflare KV Setup Guide

## The Problem
Your admin dashboard shows no bookings or rules because the KV storage isn't connected in production.

## Solution: Bind KV to Your Cloudflare Pages Project

### Step 1: Create KV Namespace

**Via Cloudflare Dashboard:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages** → **KV**
4. Click **Create namespace**
5. Name it: `BOOKINGS_KV`
6. Click **Add**
7. **Copy the Namespace ID** (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 2: Bind KV to Your Pages Project

1. Go to **Workers & Pages**
2. Click on your project (probably `glenugie-booking`)
3. Go to **Settings** tab
4. Scroll to **Bindings** section
5. Click **Add** under **KV Namespace Bindings**
6. Set:
   - **Variable name:** `BOOKINGS_KV`
   - **KV namespace:** Select the one you just created (`BOOKINGS_KV`)
7. Click **Save**

### Step 3: Redeploy

After binding, trigger a new deployment (or just wait - it should work immediately).

---

## Alternative: Using Wrangler CLI

If you prefer command line:

```bash
# 1. Create KV namespace
npx wrangler kv:namespace create "BOOKINGS_KV"

# This will output something like:
# ✨ Success!
# Add the following to your wrangler.jsonc:
# { binding = "BOOKINGS_KV", id = "abc123..." }

# 2. Update wrangler.jsonc with the real ID
# Replace "placeholder" with the actual ID

# 3. Deploy
npx wrangler pages deploy dist --project-name=YOUR_PROJECT_NAME
```

---

## Initialize with Demo Data

Once KV is connected, visit:

```
https://www.glenugiekennels.co.uk/api/admin/init-data
```

This will populate your KV store with:
- Sample bookings
- Default booking rules
- Current rates

---

## Verify It's Working

1. **Check KV has data:**
   - Cloudflare Dashboard → KV → Your namespace
   - You should see keys: `bookings`, `booking-rules`, `rates`

2. **Check admin dashboard:**
   - Go to `/admin`
   - Login with your password
   - You should now see bookings and rules

---

## Environment Variables Checklist

Make sure these are set in **Cloudflare Pages Settings → Environment variables**:

- ✅ `ADMIN_PASSWORD`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_PUBLISHABLE_KEY`
- ✅ `RESEND_API_KEY`
- ✅ `WEBFLOW_API_HOST`
- ✅ `WEBFLOW_SITE_API_TOKEN`
- ✅ `WEBFLOW_CMS_SITE_API_TOKEN`

---

## Troubleshooting

### Still not working?

1. **Check Cloudflare Pages logs:**
   - Go to your project → **Deployments** → Click latest deployment → **Functions** tab
   - Look for errors

2. **Test the API directly:**
   ```
   https://www.glenugiekennels.co.uk/api/admin/bookings
   ```
   Should return JSON with bookings array

3. **Verify KV binding:**
   - Pages Settings → Bindings
   - Make sure `BOOKINGS_KV` is listed

4. **Check browser console:**
   - Open admin dashboard
   - Press F12
   - Look for JavaScript errors or failed API calls
