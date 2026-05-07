# 🚀 Deploy Storage Fix - Quick Checklist

## Critical Storage Bug Fixed ✅

The booking system had a critical storage initialization bug that prevented bookings from loading. This has been fixed.

---

## Pre-Deployment Checklist

### 1. Verify Configuration
```bash
# Check wrangler.jsonc has KV binding
cat wrangler.jsonc | grep -A 3 "kv_namespaces"
```

Should show:
```jsonc
"kv_namespaces": [
  {
    "binding": "BOOKINGS_KV",
    "id": "4dd144b89325450b8949d8132a8ad02c"
  }
]
```

### 2. Test Locally (Optional)
```bash
npm run dev
```

Then test:
- http://localhost:4321/api/bookings (should return array)
- http://localhost:4321/admin (should load dashboard)

### 3. Build for Production
```bash
npm run build
```

---

## Deployment Steps

### Option A: Deploy via Wrangler CLI
```bash
# Deploy to Cloudflare Workers
npx wrangler deploy

# Or if you have wrangler installed globally
wrangler deploy
```

### Option B: Deploy via Webflow Dashboard
1. Go to your Webflow Apps dashboard
2. Select your Glenugie Kennels app
3. Click "Deploy" or "Publish"
4. Wait for deployment to complete

---

## Post-Deployment Verification

### 1. Check Cloudflare Logs
```bash
# View real-time logs
wrangler tail
```

Look for these success messages:
```
[DB] initDB called
[Storage] ✅ BOOKINGS_KV binding found
[Storage] ✅ Storage instance created successfully
```

### 2. Test API Endpoints

**Test Bookings API:**
```bash
curl https://your-app.workers.dev/api/bookings
```
Expected: `[]` (empty array) or array of bookings

**Test Admin Auth:**
```bash
curl https://your-app.workers.dev/api/admin/auth \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"info@glenugiekennels.co.uk","password":"Peterhead2026!"}'
```
Expected: `{"token":"...","message":"Login successful"}`

### 3. Test Web Interface

**Admin Dashboard:**
1. Navigate to: `https://your-app.workers.dev/admin`
2. Login with credentials
3. Verify bookings calendar loads
4. Check for console errors (F12)

**Customer Portal:**
1. Navigate to: `https://your-app.workers.dev/my-bookings`
2. Try logging in with a test email
3. Verify no errors appear

**Booking Form:**
1. Navigate to: `https://your-app.workers.dev/booking`
2. Fill out a test booking
3. Verify availability calendar works
4. Check that form submits successfully

---

## Troubleshooting

### If Bookings Don't Load

**Check 1: KV Binding**
```bash
wrangler kv:namespace list
```
Should show your BOOKINGS_KV namespace.

**Check 2: Logs**
```bash
wrangler tail
```
Look for error messages about storage initialization.

**Check 3: Environment Variables**
```bash
wrangler secret list
```
Verify secrets are set (STRIPE_SECRET_KEY, RESEND_API_KEY, etc.)

### Common Issues

**Issue**: "Storage not initialized" error
**Fix**: Ensure all API routes call `initDB(locals.runtime)` before using `db`

**Issue**: "KV namespace is required" error  
**Fix**: Check `wrangler.jsonc` has correct KV binding

**Issue**: Empty bookings array when bookings exist
**Fix**: This was the bug we just fixed! Redeploy with the fix.

---

## Rollback Plan (If Needed)

If something goes wrong:

```bash
# Rollback to previous deployment
wrangler rollback

# Or deploy a specific version
wrangler deployments list
wrangler rollback [deployment-id]
```

---

## Success Criteria

✅ No console errors in browser  
✅ Admin dashboard loads bookings  
✅ Customer portal shows bookings  
✅ New bookings can be created  
✅ Availability calendar works  
✅ No "storage not initialized" errors in logs  

---

## Files Changed

- ✅ `src/lib/db.ts` - Fixed storage initialization
- ✅ `src/lib/storage.ts` - Improved error handling
- ✅ `CRITICAL_STORAGE_FIX.md` - Documentation

---

## Next Steps After Deployment

1. **Monitor for 24 hours**: Check Cloudflare analytics for errors
2. **Test booking flow**: Create a real test booking
3. **Verify emails**: Ensure confirmation emails are sent
4. **Check admin functions**: Test all admin dashboard features
5. **Customer testing**: Have a test customer try the portal

---

## Support

If issues persist after deployment:

1. Check Cloudflare Workers logs: `wrangler tail`
2. Review browser console errors (F12)
3. Verify KV namespace exists in Cloudflare dashboard
4. Ensure all environment variables are set
5. Check `CRITICAL_STORAGE_FIX.md` for detailed technical info

---

## Deployment Command (Quick)

```bash
# One-line deploy
npm run build && wrangler deploy
```

---

**Status**: Ready to deploy ✅  
**Risk Level**: Low (bug fix, no breaking changes)  
**Estimated Downtime**: None (hot deploy)  

---

*Deploy with confidence! This fix resolves the critical storage bug.* 🚀
