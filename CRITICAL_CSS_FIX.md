# CRITICAL: CSS Not Loading in Production - FIX NOW

## Problem
Stylesheets are not loading on the live site at https://www.glenugiekennels.co.uk/glenugie-booking

## Root Cause
The `_routes.json` file needs to exclude CSS/JS assets from being processed by the Cloudflare Worker, so they're served as static files instead.

## IMMEDIATE FIX - Deploy Now

### Step 1: Rebuild Locally
```bash
npm run build
```

This will:
1. Build the Astro site
2. Copy `.assetsignore` to dist
3. Run `fix-routes.js` to create proper `_routes.json`

### Step 2: Verify Build Output
Check that these files exist:
```bash
ls -la dist/_routes.json
ls -la dist/glenugie-booking/assets/*.css
```

The `_routes.json` should contain:
```json
{
  "version": 1,
  "include": [
    "/*"
  ],
  "exclude": [
    "/glenugie-booking/assets/*",
    "/glenugie-booking/_astro/*",
    "/glenugie-booking/BUILD_VERSION.txt",
    "/glenugie-booking/admin-direct-backup.html",
    "/glenugie-booking/favicon.ico",
    "/glenugie-booking/favicon.svg",
    "/glenugie-booking/logo.svg",
    "/glenugie-booking/robots.txt"
  ]
}
```

### Step 3: Deploy to Webflow Cloud

**Option A: Via Webflow Dashboard (RECOMMENDED)**
1. Go to your Webflow site settings
2. Navigate to Apps → Your App
3. Click "Deploy" or "Redeploy"
4. Upload the entire `dist` folder

**Option B: Via Wrangler (if configured)**
```bash
wrangler pages deploy dist --project-name=glenugie-booking
```

### Step 4: Verify Fix
1. Visit https://www.glenugiekennels.co.uk/glenugie-booking
2. Open browser DevTools (F12) → Network tab
3. Refresh the page
4. Check that CSS files load with status 200 (not 404)
5. Look for files like: `/glenugie-booking/assets/*.css`

## What Was Fixed

1. **`.assetsignore`** - Now only ignores `_worker.js`, not CSS files
2. **`fix-routes.js`** - Already correct, excludes assets from worker routing
3. **Build process** - Runs fix-routes.js automatically

## If Still Not Working

### Check 1: Verify CSS Files Exist in Deployment
```bash
# In your dist folder
find dist/glenugie-booking/assets -name "*.css"
```

You should see files like:
- `dist/glenugie-booking/assets/[hash].css`

### Check 2: Check Browser Console
Open DevTools → Console and look for errors like:
- `Failed to load resource: net::ERR_ABORTED 404`
- CSS file paths

### Check 3: Verify _routes.json in Production
The `_routes.json` file MUST be in the root of your deployment (dist/_routes.json) and MUST exclude the assets folder.

## Emergency Rollback
If you need to rollback, the issue is likely:
1. CSS files not being uploaded
2. `_routes.json` not being deployed
3. Assets being processed by Worker instead of served statically

## Contact
If this doesn't fix it, check:
1. Webflow deployment logs
2. Cloudflare Pages deployment settings
3. Asset upload confirmation

---

**STATUS: Ready to deploy - run `npm run build` then upload dist folder**
