# Accommodation Display Fix

## Problem
When displaying bookings with `accommodationType: 'luxury-suite'`, the system was showing "luxury-suite" instead of the actual suite name (e.g., "Sniffany Suite", "Woofdorf", etc.).

## Solution
Created a centralized `formatAccommodationDisplay()` function that properly displays:
- **Specific suite names** when `specificSuite` is set (e.g., "Sniffany Suite", "Woofdorf")
- **Formatted accommodation types** when no specific suite is selected (e.g., "Luxury Dog Suite", "The Village")

## Changes Made

### 1. Core Function (`src/lib/booking-types.ts`)
Added `formatAccommodationDisplay()` function that:
- Checks for `specificSuite` first
- Looks up the proper label from `LUXURY_SUITES` or `CATTERY_SUITES`
- Falls back to formatting the slug nicely if not found
- Formats accommodation types properly when no specific suite is set

### 2. Admin Components Updated
- **BookingsList.tsx**: Replaced local `formatAccommodation()` with shared function
- **BookingsCalendar.tsx**: Replaced local `formatAccommodation()` with shared function
- Both now show proper suite names in:
  - Table listings
  - Detail views
  - CSV exports
  - Calendar views

### 3. Customer Portal Updated
- **CustomerPortal.tsx**: Replaced `getAccommodationName()` with shared function
- Customers now see proper suite names in their booking list

### 4. API Endpoint Updated
- **bookings.ts**: Updated Stripe checkout session to use proper suite names
- Payment descriptions now show "Glenugie Kennels - Sniffany Suite" instead of "luxury-suite"

## Examples

### Before
- "luxury-suite" (generic)
- "cattery" (generic)

### After
- "Sniffany Suite" (specific)
- "Woofdorf" (specific)
- "Clawrence House" (specific)
- "Luxury Dog Suite" (when no specific suite selected)
- "Cattery Suite" (when no specific suite selected)
- "Ruff's Retreat" (standard kennel)
- "The Village" (standard kennel)

## Testing
All changes have been tested and the build completes successfully with no errors.

## Benefits
1. **Consistency**: All parts of the system now display accommodation names the same way
2. **User-friendly**: Shows actual suite names instead of technical slugs
3. **Maintainable**: Single source of truth for formatting logic
4. **Extensible**: Easy to add new suites or change formatting in one place
