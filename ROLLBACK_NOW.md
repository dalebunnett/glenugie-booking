# 🚨 EMERGENCY ROLLBACK GUIDE

## Situation
- Production booking site is broken
- Customer has reverted to old site
- Need to rollback NOW

## Quick Rollback (Choose One)

### Option 1: Revert Last Changes (Safest)
```bash
cd /path/to/glenugie-booking
git checkout main
git revert HEAD --no-edit
git push origin main
```
Then deploy via Webflow dashboard.

### Option 2: Reset to Last Working Version
```bash
cd /path/to/glenugie-booking
git checkout main
git reset --hard 97513df
git push origin main --force
```
Then deploy via Webflow dashboard.

### Option 3: Deploy via Webflow Dashboard
1. Go to Webflow Apps dashboard
2. Find your app
3. Click "Deployments"
4. Find a previous working deployment
5. Click "Rollback" or "Redeploy"

## After Rollback

### Verify Production Works
1. Visit your live booking site
2. Test booking flow
3. Verify dates block correctly
4. Confirm with customer

### Set Up Staging
1. Create staging branch (already done)
2. Set up staging environment in Webflow
3. Test all fixes on staging first
4. Only deploy to production when confirmed working

## What Went Wrong

The booking blocking feature has been partially implemented but isn't working correctly:
- ✅ Backend stores bookings
- ✅ API returns bookings
- ✅ Calendar displays bookings
- ❌ Calendar doesn't block booked dates
- ❌ Form allows booking on blocked dates

## Moving Forward

**NEVER deploy to production again without:**
1. Testing on staging first
2. Verifying all functionality works
3. Getting customer approval

The staging branch is ready at: `origin/staging`
