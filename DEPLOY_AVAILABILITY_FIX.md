# 🚀 Quick Deploy: Availability Calendar Fix

## The Problem
Availability calendars on kennel pages show all dates as available (green), even when bookings exist.

## The Cause
**Same root issue as customer portal**: Production is running old code with the storage bug. The availability API is already fixed but not deployed.

## The Solution
Deploy the latest code that includes the storage fix.

## Deploy Now (Choose One)

### ⚡ Fastest: Local Deploy
```bash
cd /path/to/glenugie-kennels
git pull origin main
npm run build && npx wrangler deploy
```

### 🌐 Via Webflow Dashboard
1. Open Webflow dashboard
2. Go to your site → Apps
3. Click "Deploy" on Glenugie Kennels app
4. Wait 2-3 minutes

## Test After Deploy

### Quick Test
Visit any kennel page (e.g., `/kennels/sniffany`) and check if booked dates show in red.

### Debug Test
Visit: `/api/debug/availability-check?slug=luxury-suite`

Should show:
```json
{
  "checks": {
    "totalBookings": { "count": X },
    "kennelBookings": { "count": Y }
  }
}
```

## What's Included in This Fix

✅ **Better Error Handling**: Calendar shows errors instead of failing silently
✅ **Debug Logging**: Console logs help identify issues
✅ **Debug Endpoint**: `/api/debug/availability-check` for testing
✅ **Error Display**: UI shows errors with retry button
✅ **Storage Fix**: Uses `initDB(locals.runtime)` correctly

## Expected Result

### Before Fix
- All dates show green (available)
- No bookings visible on calendar
- No errors shown

### After Fix
- Booked dates show red (fully booked)
- Partially booked dates show yellow (multi-kennel types)
- Available dates show green
- Clicking dates shows booking details
- Errors are displayed if they occur

## Files Changed
```
src/components/KennelAvailabilityCalendar.tsx
src/pages/api/debug/availability-check.ts
src/pages/debug-customer-bookings.astro
```

## Verification Steps

1. ✅ Deploy using one of the methods above
2. ✅ Visit `/api/debug/availability-check?slug=luxury-suite`
3. ✅ Verify bookings are returned
4. ✅ Visit a kennel page (e.g., `/kennels/sniffany`)
5. ✅ Check calendar shows booked dates in red
6. ✅ Click a booked date to see details

## Troubleshooting

**Still showing all green?**
- Clear browser cache
- Check deployment version
- Verify `/api/debug/availability-check` returns bookings

**API returns empty array?**
- Check slug matches booking data
- Use debug endpoint to see available slugs

**Console shows errors?**
- Check if storage fix is deployed
- Verify KV namespace is bound

---

**Ready to Deploy**: ✅ Yes
**Time Required**: 2-3 minutes
**Risk Level**: Low (only improves existing functionality)
