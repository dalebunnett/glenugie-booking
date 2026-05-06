# Webflow Cloud KV Storage Setup Guide

## Problem
The booking system can't access bookings or rules because the **Cloudflare KV binding** isn't configured in Webflow Cloud.

## Solution: Configure KV in Webflow Cloud

### Step 1: Find Your KV Namespace ID

Your KV namespace ID is already in `wrangler.jsonc`:
```
"id": "4dd144b89325450b8949d8132a8ad02c"
```

### Step 2: Configure in Webflow Cloud

1. **Go to your Webflow project**
2. **Navigate to:** Apps → Your App → Settings
3. **Find the "Bindings" or "Environment" section**
4. **Add KV Namespace Binding:**
   - **Binding Name:** `BOOKINGS_KV`
   - **Namespace ID:** `4dd144b89325450b8949d8132a8ad02c`

### Step 3: Verify Environment Variables

Make sure these are also set in Webflow Cloud:

```
ADMIN_PASSWORD=Peterhead2026!
ADMIN_EMAIL=info@glenugiekennels.co.uk
GOOGLE_REVIEW_LINK=https://maps.google.com/?cid=8993054838066790595
```

### Step 4: Test the Configuration

After deploying, visit:
```
https://www.glenugiekennels.co.uk/app/api/debug/env-check
```

You should see:
```json
{
  "hasBookingsKV": true,
  "isKVNamespace": true,
  "runtimeEnvKeys": ["BOOKINGS_KV", "ADMIN_PASSWORD", "ADMIN_EMAIL", ...]
}
```

---

## Alternative: If Webflow Cloud Doesn't Support KV Bindings

If Webflow Cloud doesn't have a UI for KV bindings, you may need to:

### Option A: Use Cloudflare Pages Instead
Deploy directly to Cloudflare Pages (not through Webflow Cloud):
1. Connect your GitHub repo to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add KV binding in Cloudflare Pages settings

### Option B: Contact Webflow Support
Ask them how to configure Cloudflare KV bindings for Workers deployed through Webflow Cloud.

---

## Troubleshooting

### Check if KV is working:
```bash
# Visit this URL after deployment:
https://www.glenugiekennels.co.uk/app/api/debug/env-check
```

### Expected Output (Working):
```json
{
  "hasBookingsKV": true,
  "isKVNamespace": true
}
```

### Expected Output (Not Working):
```json
{
  "hasBookingsKV": false,
  "isKVNamespace": false
}
```

---

## Initialize Data (After KV is Working)

Once KV is properly bound, initialize it with default data:

```bash
# Visit this URL to initialize:
https://www.glenugiekennels.co.uk/app/api/admin/init-data
```

This will populate:
- Default booking rules
- Default rates
- Empty bookings array

---

## Need Help?

1. Check the debug endpoint: `/app/api/debug/env-check`
2. Check browser console for errors
3. Check Cloudflare Workers logs in Cloudflare dashboard
4. Contact Webflow support about KV bindings
