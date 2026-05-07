# 🚀 DEPLOY BOOKING BLOCKING FIX NOW

## What Was Fixed
✅ Suites can now be properly blocked from double-booking  
✅ API checks availability before creating bookings  
✅ Frontend calendar shows blocked dates correctly  

## Deploy Steps

### Option 1: Deploy from Local Machine (Fastest)
```bash
# 1. Navigate to project
cd /path/to/glenugie-kennels

# 2. Pull latest changes
git pull origin main

# 3. Build and deploy
npm run build
npx wrangler deploy
```

### Option 2: Deploy via Webflow Dashboard
1. Changes are already pushed to GitHub
2. Go to: https://webflow.com/dashboard
3. Find your Glenugie Kennels app
4. Click **"Deploy"**
5. Wait 2-3 minutes for build

### Option 3: Deploy via Webflow CLI
```bash
# If you have Webflow CLI installed
webflow deploy
```

## Verify It's Working

### Test 1: Check Existing Booking Blocks New One
1. Go to your booking page
2. Select "Sniffany" suite
3. Try to book dates that overlap with existing booking
4. **Expected:** Those dates should be disabled/red in calendar
5. **Expected:** If you bypass UI, you get error message

### Test 2: Check API Rejects Double Booking
```bash
# Try to create a booking for already-booked dates
curl -X POST https://your-site.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "accommodationType": "luxury-suite",
    "specificSuite": "sniffany",
    "checkIn": "2026-05-10",
    "checkOut": "2026-05-15",
    ...
  }'

# Expected response:
# {
#   "error": "sniffany is not available for the selected dates..."
# }
```

## What Changed

### Backend (`src/pages/api/bookings.ts`)
- Added `isAvailable()` function
- Checks for date overlaps before creating booking
- Returns 400 error if suite unavailable

### Frontend (`src/components/BookingForm.tsx`)
- Fixed data access: `data.bookings` instead of `data`
- Fixed field names: `checkInDate`/`checkOutDate` instead of `checkIn`/`checkOut`
- Calendar now properly blocks booked dates

## Rollback Plan (If Needed)
```bash
# Revert to previous version
git revert HEAD
git push origin main

# Then deploy again
npm run build
npx wrangler deploy
```

## Support
If you see any issues after deployment:
1. Check browser console for errors
2. Check Cloudflare Workers logs
3. Test with a known booked suite

## Status
🟢 **READY TO DEPLOY**  
⚠️ **CRITICAL FIX** - Deploy ASAP to prevent double bookings

---

**Estimated Deploy Time:** 5 minutes  
**Downtime:** None (zero-downtime deployment)  
**Risk Level:** Low (only adds validation, doesn't break existing functionality)
