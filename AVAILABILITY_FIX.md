# Availability Blocking Fix

## Issue
No dates were being blocked on the front-end booking form, even when accommodations showed as fully booked.

## Root Causes

### 1. Slug Matching Issue in Availability API
**Problem**: The availability API was trying to transform `specificSuite` values (which are already stored as slugs like "sniffany-suite") by converting them from labels to slugs. This caused a mismatch.

**Example**:
- Booking stored: `specificSuite: "sniffany-suite"`
- API was doing: `booking.specificSuite.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-')`
- This would try to convert "sniffany-suite" → "sniffany-suite" (no change, but unnecessary)
- The real issue was it wasn't matching correctly

**Fix**: Removed the transformation and directly compare the slug values:
```typescript
// Before
if (booking.accommodationType === 'luxury-suite' && booking.specificSuite) {
  const suiteSlug = booking.specificSuite.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
  return suiteSlug === slug;
}

// After
if (booking.accommodationType === 'luxury-suite' && booking.specificSuite) {
  return booking.specificSuite === normalizedSlug;
}
```

### 2. Village Slug Normalization
**Problem**: The Village could be accessed via two different slugs: 'village' and 'the-village', but the multi-kennel detection only checked for 'village'.

**Fix**: 
- Normalized the slug in the API to always use 'village'
- Updated the multi-kennel detection in BookingForm to check for both variants

```typescript
// In availability API
const normalizedSlug = slug === 'the-village' ? 'village' : slug;

// In BookingForm
const isMultiKennel = slug === 'ruffs-retreat' || slug === 'village' || slug === 'the-village';
const totalCapacity = (slug === 'village' || slug === 'the-village') ? 6 : slug === 'ruffs-retreat' ? 12 : 1;
```

## Files Changed

1. **src/pages/api/availability/[slug].ts**
   - Fixed slug matching for luxury suites and cattery suites
   - Added slug normalization for 'the-village' → 'village'
   - Removed unnecessary string transformations

2. **src/components/BookingForm.tsx**
   - Fixed multi-kennel detection to handle both 'village' and 'the-village'
   - Fixed totalCapacity calculation for both village slug variants
   - Added console logging for debugging

## Testing Steps

After deployment, test the following:

1. **Luxury Dog Suites** (e.g., Sniffany Suite, Woofdorf)
   - Create a booking for a specific suite
   - Try to book the same suite for overlapping dates
   - ✅ Should see dates blocked in the calendar

2. **Cattery Suites** (e.g., Clawrence House, Twitcher)
   - Create a booking for a specific cattery suite
   - Try to book the same suite for overlapping dates
   - ✅ Should see dates blocked in the calendar

3. **Ruff's Retreat** (12 kennels)
   - Create bookings for some kennels
   - ✅ Should still be able to book if not all 12 are occupied
   - Create bookings for all 12 kennels on the same dates
   - ✅ Should see dates blocked when all 12 are booked

4. **The Village** (6 kennels)
   - Create bookings for some kennels
   - ✅ Should still be able to book if not all 6 are occupied
   - Create bookings for all 6 kennels on the same dates
   - ✅ Should see dates blocked when all 6 are booked

## Debugging

Console logs have been added to help debug:
- Open browser console (F12)
- Navigate to booking page
- Select an accommodation
- Look for logs like:
  - `Availability fetch for slug: sniffany-suite returned: [...]`
  - `Single suite dates blocked: X dates`
  - `Booked dates set: [...]`

## Deployment

Deploy via Webflow or manually:
```bash
npm run build
wrangler deploy
```

After deployment, clear browser cache and test thoroughly.
