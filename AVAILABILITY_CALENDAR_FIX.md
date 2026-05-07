# 🗓️ Availability Calendar Fix - Deployment Guide

## Issue
The availability calendar on kennel detail pages is not showing bookings, even though bookings exist in the system.

## Root Cause
**Same as the customer portal issue**: The production deployment is still running the old version with the storage initialization bug. The availability API endpoint (`/api/availability/[slug].ts`) is already fixed to use `initDB(locals.runtime)`, but the fix hasn't been deployed yet.

## What Was Fixed

### 1. **Availability Calendar Component** (`src/components/KennelAvailabilityCalendar.tsx`)
- ✅ Added comprehensive error handling
- ✅ Added detailed console logging for debugging
- ✅ Added error display in the UI
- ✅ Added retry functionality

### 2. **Debug Endpoint** (`src/pages/api/debug/availability-check.ts`)
- ✅ Created new debug endpoint to test availability API
- ✅ Shows all bookings and how they're filtered
- ✅ Displays accommodation types and specific suites
- ✅ Helps identify why bookings might not match

### 3. **Debug Page** (`src/pages/debug-customer-bookings.astro`)
- ✅ Added availability testing section
- ✅ Dropdown to test different kennel slugs
- ✅ Shows detailed debug information

## How to Deploy

### Option 1: Deploy from Local Machine (Fastest)
```bash
# Navigate to your project directory
cd /path/to/glenugie-kennels

# Pull latest changes
git pull origin main

# Install dependencies (if needed)
npm install

# Build and deploy
npm run build && npx wrangler deploy
```

### Option 2: Deploy via Webflow Dashboard
1. Go to your Webflow dashboard
2. Navigate to your site's Apps section
3. Find the Glenugie Kennels app
4. Click "Deploy" or "Redeploy"
5. Wait for deployment to complete

### Option 3: Deploy via GitHub + Webflow
1. Changes are already pushed to GitHub
2. Go to Webflow dashboard
3. Trigger a new deployment from the latest commit

## Testing After Deployment

### 1. Test Availability API Directly
Visit: `https://your-site.com/api/debug/availability-check?slug=luxury-suite`

This should show:
- Total bookings in system
- Active bookings
- Bookings filtered for the specific kennel
- All available accommodation types

### 2. Test on Kennel Detail Pages
1. Go to any kennel detail page (e.g., `/kennels/sniffany`)
2. Check the browser console for logs:
   ```
   [AvailabilityCalendar] Fetching bookings for: sniffany
   [AvailabilityCalendar] Response status: 200
   [AvailabilityCalendar] Bookings loaded: X
   ```
3. The calendar should now show:
   - Red dates for fully booked days
   - Yellow dates for partially booked days (multi-kennel types)
   - Green dates for available days

### 3. Test Debug Page
Visit: `https://your-site.com/debug-customer-bookings`

1. Select a kennel from the dropdown
2. Click "Check Availability"
3. Review the debug output to see:
   - How many bookings match
   - What accommodation types exist
   - How the filtering works

## Expected Behavior After Fix

### Single Suites (Luxury Dog Suites, Cattery Suites)
- Calendar shows dates as **fully booked** (red) when a booking exists
- Calendar shows dates as **available** (green) when no booking exists
- Clicking a date shows booking details if booked

### Multi-Kennel Types (Ruff's Retreat, The Village)
- Calendar shows **partially booked** (yellow) when some kennels are occupied
- Calendar shows **fully booked** (red) when all kennels are occupied
- Calendar shows **available** (green) when all kennels are free
- Clicking a date shows:
  - How many kennels are available
  - Which kennel numbers are occupied
  - Details of each booking

## Verification Checklist

After deployment, verify:

- [ ] Availability API returns bookings: `/api/debug/availability-check?slug=luxury-suite`
- [ ] Calendar shows booked dates in red
- [ ] Calendar shows available dates in green
- [ ] Clicking a booked date shows booking details
- [ ] Multi-kennel types show partial availability correctly
- [ ] No errors in browser console
- [ ] Debug page shows correct booking counts

## Common Issues

### Calendar Still Shows All Green
**Cause**: Old deployment still active
**Solution**: Force a new deployment and clear browser cache

### API Returns Empty Array
**Cause**: Slug mismatch between booking and calendar
**Solution**: Check debug endpoint to see what slugs exist in bookings

### Console Shows 500 Error
**Cause**: Storage not initialized
**Solution**: Verify deployment includes the storage fix from `CRITICAL_STORAGE_FIX.md`

## Related Files Changed

```
src/components/KennelAvailabilityCalendar.tsx
src/pages/api/debug/availability-check.ts
src/pages/debug-customer-bookings.astro
```

## Next Steps

1. **Deploy immediately** using one of the methods above
2. **Test the availability API** using the debug endpoint
3. **Verify calendar display** on kennel detail pages
4. **Check browser console** for any errors
5. **Test different kennel types** (luxury, standard, cattery)

## Support

If issues persist after deployment:
1. Check `/api/debug/availability-check?slug=YOUR_SLUG`
2. Check browser console for detailed logs
3. Verify the deployment version matches the latest commit
4. Clear browser cache and cookies

---

**Status**: ✅ Ready to Deploy
**Priority**: High (affects customer booking experience)
**Estimated Deploy Time**: 2-3 minutes
