# 🚀 Setting Up Webflow Cloud Environment

## Current Issue

Your environment check shows:
- ❌ KV Storage: Not Bound
- ❌ Environment Variables: Missing
- ✅ Database: Working (598 bookings found)

This means Webflow Cloud isn't reading from `wrangler.jsonc` or the bindings aren't configured.

---

## 📋 Solution: Configure in Webflow Dashboard

### Step 1: Access Webflow App Settings

1. Go to your Webflow account
2. Navigate to your **Apps** project
3. Find your "Glenugie Booking" app
4. Click on **Settings** or **Configuration**

### Step 2: Look for One of These Sections

Webflow Cloud should have one of these:
- **Environment Variables** section
- **Bindings** or **Resources** section
- **Cloudflare Settings** section
- **Worker Configuration** section

### Step 3: Add Environment Variables

Add these variables in Webflow:

```
ADMIN_PASSWORD=Peterhead2026!
RESEND_API_KEY=re_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
ADMIN_EMAIL=info@glenugiekennels.co.uk
GOOGLE_REVIEW_LINK=https://maps.google.com/?cid=8993054838066790595
```

### Step 4: Add KV Binding

If there's a **Bindings** section:
1. Click **Add Binding**
2. Select **KV Namespace**
3. Set binding name: `BOOKINGS_KV`
4. Create or select a KV namespace

If there's **NO bindings section**, you might need to:
1. Create a KV namespace in Cloudflare directly
2. Link it via Cloudflare Workers dashboard
3. Or contact Webflow support

---

## 🔧 Alternative: Use Cloudflare Workers Directly

If Webflow Cloud doesn't support KV bindings properly, you can deploy directly to Cloudflare:

### Option A: Deploy via Cloudflare Pages (Recommended)

1. **Disconnect from Webflow Cloud** (or run in parallel)

2. **Connect GitHub to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages**
   - Click **Create** → **Pages** → **Connect to Git**
   - Select your GitHub repository
   - Configure build settings:
     ```
     Build command: npm run build
     Build output directory: dist
     Root directory: /
     ```

3. **Add Environment Variables** in Cloudflare Pages:
   ```
   ADMIN_PASSWORD=Peterhead2026!
   RESEND_API_KEY=your_key
   STRIPE_SECRET_KEY=your_key
   ```

4. **Add KV Binding** in Cloudflare Pages:
   - Go to Settings → Functions → KV namespace bindings
   - Add binding: `BOOKINGS_KV`
   - Create new KV namespace or select existing

5. **Deploy**

Your app will be at: `https://your-project.pages.dev`

Then you can add a custom domain: `https://app.glenugiekennels.co.uk`

### Option B: Deploy via Wrangler CLI

If you have Wrangler installed:

1. **Create KV namespace**:
   ```bash
   npx wrangler kv:namespace create "BOOKINGS_KV"
   ```
   This will output an ID like: `a1b2c3d4e5f6...`

2. **Update wrangler.jsonc**:
   ```jsonc
   "kv_namespaces": [
     { 
       "binding": "BOOKINGS_KV", 
       "id": "a1b2c3d4e5f6..."  // ← Your actual ID
     }
   ]
   ```

3. **Add secrets**:
   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   # Enter: Peterhead2026!
   
   npx wrangler secret put RESEND_API_KEY
   # Enter: your_resend_key
   
   npx wrangler secret put STRIPE_SECRET_KEY
   # Enter: your_stripe_key
   ```

4. **Deploy**:
   ```bash
   npm run build
   npx wrangler pages deploy dist
   ```

---

## 🎯 Recommended Path Forward

I recommend **Option A: Cloudflare Pages** because:
- ✅ Full control over bindings
- ✅ Free tier is generous
- ✅ Auto-deploys from GitHub
- ✅ Built-in KV support
- ✅ Custom domains included
- ✅ Better logging and diagnostics

You can keep your main Webflow site and just host the `/app` section on Cloudflare Pages.

---

## 📞 If You Want to Stay with Webflow Cloud

Contact Webflow support and ask:
1. How to bind a Cloudflare KV namespace to your app
2. How to set environment variables that are accessible at runtime
3. Whether they support `locals.runtime.env` access

In the meantime, the app **will work without KV**, but:
- ⚠️ Data will be lost on Worker restarts
- ⚠️ Admin auth won't persist
- ⚠️ You'll need to re-enter bookings after deployments

---

## 🧪 Test Without KV (Temporary)

To test if everything else works, I can modify the code to work without KV temporarily. This would:
- Store everything in memory
- Reset on each deployment
- But let you test the UI and functionality

Want me to make this temporary change so you can at least test the app?

---

## 📝 Summary

**Current State**:
- Code deployed ✓
- Database working ✓
- KV not bound ✗
- Env vars not accessible ✗

**Next Steps**:
1. Try to find KV/binding settings in Webflow dashboard
2. If not available → Switch to Cloudflare Pages
3. Or → Ask Webflow support for help
4. Or → Use temporary in-memory mode for testing

**Let me know which path you want to take!** 🙂
