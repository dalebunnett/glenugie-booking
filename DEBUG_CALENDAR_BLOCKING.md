# 🔍 Calendar Blocking Debug Guide

## Current Status
- **498 bookings** exist in the system
- Calendar blocking logic has been updated with extensive debugging
- Need to verify why dates aren't being blocked on the front end

## Debug Steps

### 1. Deploy the Latest Changes
The code has been updated with extensive console logging. Deploy via Webflow to push these changes to production.

### 2. Test on Front End
1. Go to the booking page: `https://your-site.com/booking`
2. Open browser DevTools (F12) and go to the **Console** tab
3. Select an accommodation type (e.g., "Luxury Suite")
4. Select a specific suite (e.g., "Sniffany Suite")
5. Watch the console output

### 3. What to Look For in Console

You should see output like this:

```
=== FETCH AVAILABILITY DEBUG ===
accommodationType: luxury-suite
specificSuite: sniffany-suite
step: 2
Fetching availability for slug: sniffany-suite
Full URL: /api/availability/sniffany-suite
Response status: 200
Availability fetch for slug: sniffany-suite returned: [...]
Number of bookings returned: X
Single suite dates blocked: Y dates
=== BOOKED DATES SET ===
Total dates blocked: Y
Blocked dates: 2026-05-01, 2026-05-02, 2026-05-03, ...
========================
```

### 4. Common Issues to Check

#### Issue A: No bookings returned
**Console shows:** `Number of bookings returned: 0`

**Possible causes:**
- Slug mismatch between front end and database
- Bookings stored with different accommodation type
- All bookings are cancelled

**Solution:** Check the database to see how bookings are stored:
- Go to Admin Dashboard → Bookings
- Look at a few bookings and note the `accommodationType` and `specificSuite` values
- Compare with the slug being used in the API call

#### Issue B: Bookings returned but no dates blocked
**Console shows:** `Number of bookings returned: 5` but `Total dates blocked: 0`

**Possible causes:**
- Date parsing issue
- Timezone mismatch
- Invalid date format in database

**Solution:** Check the booking data structure in the console output

#### Issue C: Dates blocked but calendar not showing them as disabled
**Console shows:** Dates are blocked, but calendar allows selection

**Possible causes:**
- React state not updating
- Calendar component not re-rendering
- Date comparison issue

**Solution:** Look for "Date blocked: YYYY-MM-DD is in booked dates" messages when hovering over dates

### 5. Test Different Accommodation Types

Test each type to see which ones work and which don't:

1. **Luxury Suites** (single occupancy):
   - Sniffany Suite
   - Woofdorf
   - Barkingham Palace
   - etc.

2. **Multi-Kennel** (should only block when ALL kennels full):
   - Ruff's Retreat (12 kennels)
   - The Village (6 kennels)

3. **Cattery Suites** (single occupancy):
   - Clawrence House
   - Twitcher
   - etc.

### 6. API Direct Test

You can also test the API directly:

```bash
# Test a specific suite
curl https://your-site.com/api/availability/sniffany-suite

# Test Ruff's Retreat
curl https://your-site.com/api/availability/ruffs-retreat

# Test The Village
curl https://your-site.com/api/availability/the-village
```

This should return JSON with all active bookings for that accommodation.

### 7. Expected Behavior

#### For Single Suites (Luxury/Cattery):
- If there's ANY booking for that suite, those dates should be blocked
- Example: Sniffany Suite booked May 1-5 → May 1, 2, 3, 4 should be disabled

#### For Multi-Kennel (Ruff's Retreat/Village):
- Dates only blocked when ALL kennels are occupied
- Example: Ruff's Retreat has 12 kennels
  - If 11 kennels booked on May 1 → May 1 is still available
  - If 12 kennels booked on May 1 → May 1 is blocked

### 8. Report Back

After testing, please report:
1. What accommodation type you tested
2. What the console output showed
3. Whether dates were blocked correctly
4. Any error messages

## Quick Fix Checklist

If dates still aren't blocking after deployment:

- [ ] Deployed latest changes via Webflow
- [ ] Cleared browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- [ ] Checked console for debug output
- [ ] Verified API returns bookings
- [ ] Checked booking data structure matches expected format
- [ ] Tested both single suites and multi-kennel accommodations

## Files Changed
- `src/components/BookingForm.tsx` - Added extensive debug logging
- Build completed successfully

## Next Steps
1. **Deploy via Webflow** (push latest build to production)
2. **Test on live site** with console open
3. **Report console output** so we can identify the exact issue
