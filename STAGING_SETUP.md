# 🚨 STAGING ENVIRONMENT SETUP

## Current Situation
- **Production site is broken** - booking blocking not working
- **Customer has reverted to old site**
- **Need staging environment to test fixes before deploying**

## Immediate Actions Required

### 1. Rollback Production (NOW)
```bash
# Option A: Rollback to last known working commit
git checkout main
git revert HEAD --no-edit
git push origin main

# Option B: Hard reset to working version (if you know which commit)
git checkout main
git reset --hard 97513df  # Or whatever commit was working
git push origin main --force
```

### 2. Set Up Staging Environment

#### In Webflow Dashboard:
1. Go to your Webflow Apps dashboard
2. Create a **new deployment** or **preview environment**
3. Point it to the `staging` branch instead of `main`
4. This gives you a separate URL to test on

#### Or Use Wrangler Locally:
```bash
# Test locally before deploying
npm run dev

# Or deploy to a staging worker
npx wrangler deploy --env staging
```

### 3. Proper Development Workflow Going Forward

```
staging branch (test here first)
     ↓
   Test thoroughly
     ↓
   Merge to main (production)
     ↓
   Deploy to live site
```

## What's Broken and Why

### The Issue
The booking blocking logic has multiple problems:

1. **API returns data** ✅ Working
2. **Calendar shows bookings** ✅ Working  
3. **Dates don't block in booking form** ❌ BROKEN

### Root Cause
The `BookingForm.tsx` is fetching availability data but the date comparison logic isn't working correctly. Possible reasons:

1. **Date timezone mismatch** - API returns UTC, calendar uses local time
2. **Date format mismatch** - Comparing Date objects vs strings
3. **State not updating** - React state not triggering re-render
4. **Calendar component issue** - react-day-picker not respecting disabled dates

## Testing Checklist (Use on Staging)

- [ ] Visit `/debug-booking` - verify bookings exist
- [ ] Visit `/test-blocking` - verify API returns correct dates
- [ ] Visit `/booking` - select a suite with bookings
- [ ] Open browser console - check logs
- [ ] Try to select a booked date - should be disabled
- [ ] Try to book a booked date - should show error

## Files That Need Investigation

1. `src/components/BookingForm.tsx` - Date blocking logic
2. `src/pages/api/availability/[slug].ts` - API response format
3. `src/pages/api/bookings.ts` - Booking creation validation

## Next Steps

1. **Rollback production immediately**
2. **Set up staging environment**
3. **Fix the issue on staging**
4. **Test thoroughly on staging**
5. **Only then deploy to production**

## Contact
If you need help with Webflow staging setup, check:
- Webflow Apps documentation
- Cloudflare Workers environments
- Or deploy locally with `npm run preview`
