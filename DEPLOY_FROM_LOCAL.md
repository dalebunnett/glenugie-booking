# 🚀 Deploy from Your Local Machine

## Why Deploy Locally?

The sandbox environment doesn't have Cloudflare credentials, so you need to deploy from your local machine where you have Wrangler authenticated.

---

## Quick Deploy (3 Steps)

### Step 1: Pull Latest Code
```bash
# If using Git
git pull origin main

# Or download the latest code from the sandbox
```

### Step 2: Build
```bash
npm run build
```

### Step 3: Deploy
```bash
npx wrangler deploy
```

**Done!** Your fix will be live in ~2 minutes.

---

## Detailed Instructions

### Prerequisites

1. **Wrangler Installed**
   ```bash
   npm install -g wrangler
   # or use npx wrangler
   ```

2. **Authenticated with Cloudflare**
   ```bash
   npx wrangler login
   # Follow the browser authentication flow
   ```

3. **Latest Code**
   - Make sure you have the latest code with the storage fix
   - Files changed: `src/lib/db.ts`, `src/lib/storage.ts`, `public/BUILD_VERSION.txt`

---

## Deployment Process

### 1. Verify You Have the Fix

Check that these files have the latest changes:

**src/lib/db.ts** should have:
```typescript
const ensureStorage = () => {
  if (!storageInstance) {
    throw new Error('[DB] Storage not initialized. Call init() first.');
  }
  if (!storageInstance.kv) {
    throw new Error('[DB] Storage KV namespace not available.');
  }
  return storageInstance;
};
```

**public/BUILD_VERSION.txt** should show:
```
CRITICAL_STORAGE_FIX_20260507_210302
```

### 2. Clean Build (Optional but Recommended)
```bash
# Remove old build artifacts
rm -rf dist node_modules/.astro

# Fresh install (if needed)
npm install

# Build
npm run build
```

### 3. Test Build Locally (Optional)
```bash
# Preview the build
npm run preview

# Or with Wrangler
npx wrangler dev
```

### 4. Deploy to Production
```bash
npx wrangler deploy
```

Expected output:
```
⛅️ wrangler 4.26.1
─────────────────────────────────────────────
Total Upload: ~4000 KiB / gzip: ~633 KiB
Uploaded astro (X.XX sec)
Published astro (X.XX sec)
  https://your-app.workers.dev
Current Deployment ID: [new-id]
```

### 5. Verify Deployment
```bash
# Check version
curl https://your-app.workers.dev/BUILD_VERSION.txt

# Should show: CRITICAL_STORAGE_FIX_20260507_210302
```

---

## Troubleshooting

### Issue: "Not authenticated"
**Solution:**
```bash
npx wrangler login
```

### Issue: "KV namespace not found"
**Check wrangler.jsonc:**
```jsonc
"kv_namespaces": [
  {
    "binding": "BOOKINGS_KV",
    "id": "4dd144b89325450b8949d8132a8ad02c"
  }
]
```

### Issue: Build fails
**Solution:**
```bash
# Clean and rebuild
rm -rf dist node_modules/.astro
npm install
npm run build
```

### Issue: "Old deployment still showing"
**Wait 2-3 minutes for CDN cache to clear, then:**
```bash
# Hard refresh in browser (Ctrl+Shift+R or Cmd+Shift+R)
# Or check directly
curl https://your-app.workers.dev/BUILD_VERSION.txt
```

---

## Alternative: Deploy via Webflow Dashboard

If Wrangler isn't working:

1. Go to your Webflow Apps dashboard
2. Find the Glenugie Kennels app
3. Click "Deploy" or "Publish"
4. Wait for deployment to complete

**Note**: This requires the code to be pushed to your Git repository first.

---

## Verification Checklist

After deployment:

- [ ] Build version shows: `CRITICAL_STORAGE_FIX_20260507_210302`
- [ ] `/api/bookings` returns data (not error)
- [ ] Admin dashboard loads without errors
- [ ] Customer portal works
- [ ] No console errors in browser
- [ ] Logs show successful storage initialization

---

## Quick Test Commands

```bash
# Check version
curl https://your-app.workers.dev/BUILD_VERSION.txt

# Test bookings API
curl https://your-app.workers.dev/api/bookings

# Watch logs
npx wrangler tail

# Check deployment status
npx wrangler deployments list
```

---

## If You Don't Have the Latest Code

### Option 1: Download from Sandbox

The sandbox has the latest code with the fix. You can:

1. Download the changed files:
   - `src/lib/db.ts`
   - `src/lib/storage.ts`
   - `public/BUILD_VERSION.txt`

2. Copy them to your local project

3. Build and deploy

### Option 2: Apply the Fix Manually

If you want to apply the fix yourself:

**In src/lib/db.ts**, add this function at the top:
```typescript
const ensureStorage = () => {
  if (!storageInstance) {
    throw new Error('[DB] Storage not initialized. Call init() first.');
  }
  if (!storageInstance.kv) {
    throw new Error('[DB] Storage KV namespace not available.');
  }
  return storageInstance;
};
```

Then replace all instances of:
```typescript
if (!storageInstance) storageInstance = getStorage();
```

With:
```typescript
const storage = ensureStorage();
```

**In public/BUILD_VERSION.txt**:
```
CRITICAL_STORAGE_FIX_20260507_210302
```

---

## Support

If you encounter issues:

1. **Check Wrangler auth**: `npx wrangler whoami`
2. **Check logs**: `npx wrangler tail`
3. **Review docs**: See `CRITICAL_STORAGE_FIX.md`
4. **Check Cloudflare dashboard**: Workers & Pages section

---

## Deploy Command (Copy & Paste)

```bash
npm run build && npx wrangler deploy && curl https://your-app.workers.dev/BUILD_VERSION.txt
```

This will:
1. Build the application
2. Deploy to Cloudflare
3. Verify the new version is live

---

## Timeline

- **Old Deployment**: `97513df` (BROKEN)
- **Fix Ready**: 2026-05-07 21:03
- **Waiting for**: Local deployment from your machine

---

**Deploy from your local machine now to fix the critical storage bug!** 🚀

---

*The fix is ready in the sandbox. Deploy from your authenticated local environment.*
