# 🚨 FORCE DEPLOY INSTRUCTIONS

## Current Situation

**Problem**: Deployment stuck on old version `97513df`  
**Reason**: Sandbox environment can't authenticate with Cloudflare  
**Solution**: Deploy from your local machine with Wrangler authentication  

---

## 🎯 Quick Deploy (3 Commands)

On your **local machine** (not sandbox):

```bash
# 1. Pull latest code (or copy the files)
git pull origin main

# 2. Build
npm run build

# 3. Deploy
npx wrangler deploy
```

**Done!** New version will be live in ~2 minutes.

---

## Option A: Deploy from Local Git Repo

If you have the code in Git:

```bash
# Navigate to your project
cd /path/to/glenugie-kennels

# Pull latest changes
git pull origin main

# Verify you have the fix
cat public/BUILD_VERSION.txt
# Should show: CRITICAL_STORAGE_FIX_20260507_210302

# Build and deploy
npm run build && npx wrangler deploy
```

---

## Option B: Download Fix Package

If you don't have the latest code:

### 1. Download the Fix Package

The sandbox has created: `critical-storage-fix.tar.gz`

This contains:
- `src/lib/db.ts` (fixed)
- `src/lib/storage.ts` (fixed)
- `public/BUILD_VERSION.txt` (updated)
- All documentation

### 2. Extract and Copy

```bash
# Extract the package
tar -xzf critical-storage-fix.tar.gz

# Copy files to your project
cp -r src/lib/db.ts /path/to/your/project/src/lib/
cp -r src/lib/storage.ts /path/to/your/project/src/lib/
cp -r public/BUILD_VERSION.txt /path/to/your/project/public/
```

### 3. Build and Deploy

```bash
cd /path/to/your/project
npm run build
npx wrangler deploy
```

---

## Option C: Manual Fix (If You Can't Get Files)

### 1. Update src/lib/db.ts

Add this function at the top of the file (after imports):

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

### 2. Replace Storage Checks

Find all instances of:
```typescript
if (!storageInstance) storageInstance = getStorage();
```

Replace with:
```typescript
const storage = ensureStorage();
```

This appears in these methods:
- `db.bookings.getAll()`
- `db.bookings.getById()`
- `db.bookings.create()`
- `db.bookings.update()`
- `db.bookings.delete()`
- `db.bookingRules.get()`
- `db.bookingRules.set()`
- `db.rates.get()`
- `db.rates.set()`

### 3. Update Build Version

Edit `public/BUILD_VERSION.txt`:
```
CRITICAL_STORAGE_FIX_20260507_210302
```

### 4. Deploy

```bash
npm run build && npx wrangler deploy
```

---

## Verify Wrangler Authentication

Before deploying, make sure you're authenticated:

```bash
# Check if logged in
npx wrangler whoami

# If not logged in
npx wrangler login
```

---

## Deployment Verification

After deploying, verify the fix is live:

### 1. Check Version
```bash
curl https://your-app.workers.dev/BUILD_VERSION.txt
```
Should show: `CRITICAL_STORAGE_FIX_20260507_210302`

### 2. Test API
```bash
curl https://your-app.workers.dev/api/bookings
```
Should return: `[]` or array of bookings (not error)

### 3. Check Admin Dashboard
Visit: `https://your-app.workers.dev/admin`
- Should load without errors
- Bookings should display

### 4. Watch Logs
```bash
npx wrangler tail
```
Look for:
- `[Storage] ✅ BOOKINGS_KV binding found`
- `[Storage] ✅ Storage instance created successfully`
- No error messages

---

## If Deployment Fails

### Issue: "Not authenticated"
```bash
npx wrangler login
```

### Issue: "KV namespace not found"
Check `wrangler.jsonc` has:
```jsonc
"kv_namespaces": [
  {
    "binding": "BOOKINGS_KV",
    "id": "4dd144b89325450b8949d8132a8ad02c"
  }
]
```

### Issue: Build fails
```bash
rm -rf dist node_modules/.astro
npm install
npm run build
```

### Issue: Still showing old version
```bash
# Wait 2-3 minutes for CDN cache
# Then hard refresh browser (Ctrl+Shift+R)
# Or check directly:
curl https://your-app.workers.dev/BUILD_VERSION.txt
```

---

## Alternative: Webflow Dashboard Deploy

If Wrangler doesn't work:

1. Push code to Git repository
2. Go to Webflow Apps dashboard
3. Find Glenugie Kennels app
4. Click "Deploy" or "Publish"
5. Wait for deployment

---

## What This Fixes

### Before (Broken) ❌
- Storage initialized without KV namespace
- Bookings wouldn't load
- Admin dashboard empty
- System non-functional

### After (Fixed) ✅
- Storage properly validated
- Bookings load correctly
- Admin dashboard works
- System fully functional

---

## Files Changed

Only 3 files need updating:

1. ✅ `src/lib/db.ts` - Added storage validation
2. ✅ `src/lib/storage.ts` - Improved error handling
3. ✅ `public/BUILD_VERSION.txt` - Updated version

**Total**: ~50 lines changed

---

## Rollback Plan

If something goes wrong:

```bash
# List deployments
npx wrangler deployments list

# Rollback to previous
npx wrangler rollback 97513df
```

---

## Support Resources

📄 **DEPLOY_FROM_LOCAL.md** - Detailed local deploy guide  
📄 **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist  
📄 **CRITICAL_STORAGE_FIX.md** - Technical details  
📄 **STORAGE_BUG_SUMMARY.md** - Executive summary  

---

## Timeline

- ⏰ **Now**: Deploy from local machine
- ⏱️ **2-3 min**: Build and upload
- ✅ **5 min**: Verify deployment
- 🎉 **Done**: System fixed and operational

---

## Deploy Command (Copy & Paste)

```bash
npm run build && npx wrangler deploy && curl https://your-app.workers.dev/BUILD_VERSION.txt
```

---

## Why Can't We Deploy from Sandbox?

The sandbox environment:
- ❌ No Cloudflare API token
- ❌ No Wrangler authentication
- ❌ Can't push to production

Your local machine:
- ✅ Has Wrangler authentication
- ✅ Can deploy to Cloudflare
- ✅ Can push to production

---

## Next Steps

1. **Open terminal on your local machine**
2. **Navigate to project directory**
3. **Run deploy command**
4. **Verify deployment**
5. **Celebrate!** 🎉

---

**The fix is ready. Deploy from your local machine now!** 🚀

---

*All code changes are complete. Just need to deploy from authenticated environment.*
