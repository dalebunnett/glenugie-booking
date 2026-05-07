# Customer Portal Debugging Guide

## Issue
Customer portal shows no bookings even though admin dashboard shows all bookings correctly.

## Root Cause Analysis
The issue is likely one of the following:

1. **Old deployment still running** - The storage fix hasn't been deployed yet
2. **Session/authentication issue** - Customer email doesn't match booking email
3. **Storage initialization** - KV namespace not properly initialized for customer requests

## Debug Steps

### 1. Check Current Deployment Version
Visit: `https://your-domain.com/BUILD_VERSION.txt`

Expected: Should show latest commit hash (not `97513df`)

### 2. Check Storage Initialization
Visit: `https://your-domain.com/debug-customer-bookings`

Click "Check Storage" button to verify:
- Runtime is available
- KV namespace is accessible
- DB can be initialized
- Bookings can be fetched

### 3. Check Bookings API
Click "Fetch Bookings" button to verify:
- API returns bookings
- Bookings have correct structure
- Customer emails are present

### 4. Check Customer Session
Click "Check Session" button to verify:
- Customer is logged in
- Email matches booking records

## Expected Behavior

### Admin Dashboard
✅ Shows all bookings (working)

### Customer Portal
Should show:
- Bookings filtered by customer email
- Only bookings belonging to logged-in customer

## Files Changed

### New Files
1. `src/pages/api/debug/storage-check.ts` - Storage diagnostic endpoint
2. `src/pages/debug-customer-bookings.astro` - Debug UI page

### Modified Files
1. `src/components/customer/CustomerPortal.tsx` - Added error handling and logging

## Deployment Required

**CRITICAL**: These changes must be deployed to production for the customer portal to work.

### Deploy via Webflow CLI
```bash
cd /path/to/glenugie-kennels
git pull origin main
npm run build
npx wrangler deploy
```

### Deploy via Webflow Dashboard
1. Go to Webflow Dashboard
2. Navigate to your app
3. Click "Deploy"
4. Wait for deployment to complete
5. Verify BUILD_VERSION.txt shows new commit

## Testing After Deployment

1. **Visit debug page**: `/debug-customer-bookings`
2. **Check storage**: Should show all checks passing
3. **Fetch bookings**: Should return all bookings
4. **Login as customer**: Use email that matches a booking
5. **Check My Bookings**: Should show filtered bookings

## Common Issues

### Issue: "Storage not initialized"
**Solution**: Ensure `initDB(locals.runtime)` is called in API routes

### Issue: "No bookings found"
**Solution**: Check that customer email exactly matches booking email (case-sensitive)

### Issue: "Old version still running"
**Solution**: Force redeploy or clear Cloudflare cache

## Quick Verification

Run this in browser console on customer portal:
```javascript
fetch('/api/bookings', { credentials: 'include' })
  .then(r => r.json())
  .then(bookings => {
    console.log('Total bookings:', bookings.length);
    console.log('Emails:', bookings.map(b => b.customerEmail));
  });
```

This will show all bookings and their emails to verify filtering logic.

## Next Steps

1. ✅ Deploy the changes
2. ✅ Visit `/debug-customer-bookings` to verify storage
3. ✅ Test customer login with known booking email
4. ✅ Verify bookings appear in customer portal
5. ✅ Remove debug page after verification (optional)

## Support

If issues persist after deployment:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify KV namespace binding in wrangler.jsonc
4. Ensure customer email exactly matches booking email
