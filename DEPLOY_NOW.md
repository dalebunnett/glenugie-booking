# Deploy Latest Availability Fix

## What Was Fixed
✅ Dates are now properly blocked when accommodations are booked  
✅ Fixed slug matching for luxury suites and cattery suites  
✅ Fixed multi-kennel detection for Ruff's Retreat and The Village  
✅ Added debugging logs to help troubleshoot issues  

## Changes Committed
All changes have been committed and pushed to GitHub:
- Commit: `7e48803` - "Fix availability blocking - dates now properly disabled when accommodations are booked"
- Branch: `main`

## Files Changed
1. `src/pages/api/availability/[slug].ts` - Fixed slug matching
2. `src/components/BookingForm.tsx` - Fixed multi-kennel detection and added logging
3. `src/components/admin/BookingsCalendar.tsx` - Admin calendar fixes
4. `src/components/admin/MonthlyAvailabilityCalendar.tsx` - Admin calendar fixes
5. `src/components/admin/BookingRulesManager.tsx` - Fixed baseUrl import
6. `src/components/admin/RatesManager.tsx` - Fixed baseUrl import
7. `src/lib/email.ts` - Fixed email header styling
8. Other admin component fixes

## How to Deploy via Webflow

### Option 1: Webflow Dashboard (Recommended)
1. Go to your Webflow project
2. Navigate to the Apps section
3. Find your Glenugie Kennels app
4. Click "Deploy" or "Redeploy"
5. Webflow will pull the latest code from GitHub and deploy it

### Option 2: Manual Deployment (If you have Cloudflare access)
If you have the Cloudflare API token:
```bash
# Set your token
export CLOUDFLARE_API_TOKEN=your_token_here

# Deploy
npx wrangler deploy
```

## After Deployment - Testing Checklist

### 1. Test Luxury Dog Suites
- [ ] Go to booking page
- [ ] Select "Dog" → "Luxury Suite" → "Sniffany Suite"
- [ ] Open browser console (F12)
- [ ] Look for logs: `Availability fetch for slug: sniffany-suite returned: [...]`
- [ ] Check if dates with existing bookings are blocked (grayed out)
- [ ] Try to select a blocked date - should not be selectable

### 2. Test Cattery Suites
- [ ] Select "Cat" → Choose any cattery suite
- [ ] Check console logs
- [ ] Verify dates are blocked for that specific suite

### 3. Test Ruff's Retreat (12 kennels)
- [ ] Select "Dog" → "Standard Kennel" → "Ruff's Retreat"
- [ ] Should only block dates when ALL 12 kennels are booked
- [ ] Console should show: `Multi-kennel dates blocked: X dates`

### 4. Test The Village (6 kennels)
- [ ] Select "Dog" → "Standard Kennel" → "The Village"
- [ ] Should only block dates when ALL 6 kennels are booked
- [ ] Console should show: `Multi-kennel dates blocked: X dates`

### 5. Test Admin Calendar
- [ ] Go to `/admin`
- [ ] Check Monthly Availability Calendar
- [ ] Verify kennel counts are correct:
  - Ruff's Retreat: Shows "X of 12 Available"
  - The Village: Shows "X of 6 Available"
- [ ] Check Individual Kennel Calendar
- [ ] Verify kennel numbers are correct:
  - Ruff's Retreat: Kennels 1-12
  - The Village: Kennels 1-6

## Debugging

If dates still aren't blocking:

1. **Check Console Logs**
   - Open browser console (F12)
   - Look for: `Availability fetch for slug: [slug] returned: [...]`
   - Check: `Single suite dates blocked: X dates` or `Multi-kennel dates blocked: X dates`
   - Verify: `Booked dates set: [...]` shows the dates

2. **Check API Response**
   - In console, look at the data returned from `/api/availability/[slug]`
   - Should show bookings with checkIn, checkOut, kennelNumber

3. **Check Booking Data**
   - Go to Admin → Bookings
   - Verify bookings have:
     - Correct `accommodationType`
     - Correct `specificSuite` (for luxury/cattery)
     - Correct `kennelNumber` (for multi-kennel)

4. **Clear Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

## Expected Behavior After Fix

### Single Suites (Luxury & Cattery)
- ✅ Dates are blocked when that specific suite is booked
- ✅ Other suites remain available
- ✅ Calendar shows blocked dates in red/strikethrough

### Multi-Kennel (Ruff's Retreat & The Village)
- ✅ Dates only blocked when ALL kennels are booked
- ✅ Partial bookings still allow new bookings
- ✅ Calendar shows "X of Y Available"
- ✅ Each booking gets a specific kennel number

## Need Help?

If you encounter issues after deployment:
1. Check the console logs (F12)
2. Take a screenshot of any errors
3. Note which accommodation type is having issues
4. Check if the issue is on front-end booking or admin calendar

The debugging logs will help identify exactly where the issue is occurring.
