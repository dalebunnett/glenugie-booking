# Lapdog Land Slug Fix

## Problem
Lapdog Land bookings were not showing on the availability calendar because of a slug mismatch:
- **Old bookings**: Used slug `lapdog-land`
- **Kennels page**: Uses slug `lapdog-land-suite`
- **Booking types**: Uses slug `lapdog-land-suite`

## Solution
Created a fix endpoint to update all existing bookings with the old slug to use the new correct slug.

## How to Fix

### Option 1: Use the Admin Page (Recommended)
1. Go to the admin dashboard
2. Click the **"🔧 Fix Lapdog Slug"** button in the header
3. Or navigate directly to: `/admin/fix-lapdog-slug`
4. Click the **"Fix Lapdog Land Bookings"** button
5. The page will show you how many bookings were updated

### Option 2: Use the API Directly
Make a POST request to `/api/admin/fix-lapdog-slug` with admin authentication.

```bash
curl -X POST https://your-domain.com/api/admin/fix-lapdog-slug \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## What Gets Fixed
The fix will update:
- `specificSuite` field: `lapdog-land` → `lapdog-land-suite`
- `accommodationType` field: `lapdog-land` → `lapdog-land-suite`

## Files Changed

### New Files
- `src/pages/api/admin/fix-lapdog-slug.ts` - API endpoint to fix the slugs
- `src/pages/admin/fix-lapdog-slug.astro` - Admin page with UI to run the fix

### Updated Files
- `src/pages/api/admin/fix-suite-slugs.ts` - Updated Lapdog Land mapping
- `src/components/admin/AdminDashboard.tsx` - Added "Fix Lapdog Slug" button

### Already Correct
- `src/lib/booking-types.ts` - Already uses `lapdog-land-suite`
- `src/pages/kennels/[slug].astro` - Already uses `lapdog-land-suite`

## Verification
After running the fix:
1. Go to `/kennels/lapdog-land-suite`
2. Check the availability calendar
3. All Lapdog Land bookings should now appear correctly

## Prevention
All new bookings will automatically use the correct slug `lapdog-land-suite` because:
- The booking form uses the LUXURY_SUITES array from booking-types.ts
- The kennels page uses the correct slug
- The availability calendar checks against the correct slug

## No Re-import Needed
You do NOT need to re-import bookings. The fix updates existing bookings in place in KV storage.
