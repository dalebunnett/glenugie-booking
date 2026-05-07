# 🚀 QUICK TEST GUIDE - 5 Minutes

## What I Fixed
**Date blocking now works!** Booked dates are properly blocked in the calendar.

## Test It Right Now

### Option 1: Use Existing Bookings (Fastest)

1. **Visit test page**: `/test-date-blocking`
   - Shows all Sniffany Suite bookings
   - Click the blue button to go to booking form

2. **Try to book those dates**:
   - Select "Sniffany Suite"
   - Try clicking the booked dates
   - ✅ **Should be disabled/red**

### Option 2: Create New Test Booking

1. **Make a test booking**:
   ```
   /booking
   → Select any suite
   → Book tomorrow
   → Complete booking
   ```

2. **Try to book same dates**:
   ```
   /booking
   → Select SAME suite
   → Try to select tomorrow
   → ✅ Should be blocked
   ```

## What You Should See

### ✅ Working Correctly:
- Booked dates have **red background**
- Clicking booked dates **does nothing**
- Cursor shows **"not-allowed"** on hover
- Console shows **"🚫 BLOCKING"** messages

### ❌ Still Broken:
- Can click and select booked dates
- Dates don't appear red
- No console blocking messages
- Can proceed to next step with booked dates

## Quick Console Check

Press **F12** → Console tab → Look for:
```
🔴 BOOKED DATES STATE CHANGED 🔴
Number of booked dates: 3
🚫 BLOCKING CHECK-IN DATE: 2026-05-15
```

## Deploy to Production?

### ✅ YES - If you see:
- Dates properly blocked
- Console shows blocking messages
- Can't select booked dates

### ❌ NO - If you see:
- Can still select booked dates
- No console messages
- Dates not appearing red

## Deploy Command

```bash
cd /path/to/glenugie-booking
git checkout staging
git pull origin staging
npm run build
npx wrangler deploy
```

Or use Webflow dashboard to deploy `staging` branch.

---

**Time to test**: 5 minutes
**Risk level**: Low (only affects date blocking)
**Rollback**: Easy (revert commit)
