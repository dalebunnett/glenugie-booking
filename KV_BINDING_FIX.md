# KV Binding Name Fix

## Issue
The code was using `BOOKINGS_KV` as the KV namespace binding name, but the actual Cloudflare KV namespace is named `booking_kv` (lowercase with underscore).

## Changes Made

### 1. Updated wrangler.jsonc
Changed the KV binding from:
```json
"binding": "BOOKINGS_KV"
```
to:
```json
"binding": "booking_kv"
```

### 2. Updated All Code References
Changed all references from `BOOKINGS_KV` to `booking_kv` in:
- `src/lib/storage.ts` - Core storage initialization
- `src/lib/db.ts` - Database initialization logs
- `src/pages/api/admin/debug-kv.ts` - Debug endpoint
- `src/pages/api/admin/fix-suite-slugs.ts` - Suite slug fixer
- `src/pages/api/admin/init-staging.ts` - Staging initialization
- `src/pages/api/admin/debug-kv-bookings.ts` - KV bookings debug
- `src/pages/api/debug/kv-test.ts` - KV test endpoint
- `src/pages/api/debug/kv-bookings.ts` - KV bookings debug
- `src/pages/api/debug/clear-kv.ts` - Clear KV endpoint
- `src/pages/api/debug/kv-direct.ts` - Direct KV access
- `src/pages/test-calendar.astro` - Test calendar page

### 3. Regenerated TypeScript Types
Ran `npm run cf-typegen` to regenerate the worker configuration types with the correct binding name.

## Verification
All files now correctly reference `booking_kv` instead of `BOOKINGS_KV`:
- ✅ 0 references to `BOOKINGS_KV` remain
- ✅ All code now uses `booking_kv`
- ✅ TypeScript types updated

## Next Steps
1. **Deploy the changes** - The app needs to be redeployed for these changes to take effect
2. **Test the admin dashboard** - After deployment:
   - Go to `/app/admin`
   - Click "Debug KV" to verify KV connection
   - Click "Load Test Data" to load bookings into KV
   - Check the availability calendar

## Important Notes
- This fix ensures the code matches the actual Cloudflare KV namespace binding name
- The KV namespace ID remains the same: `4dd144b89325450b8949d8132a8ad02c`
- No data will be lost - this only changes how the code references the KV namespace
- After deployment, you'll need to reload test data using the "Load Test Data" button
