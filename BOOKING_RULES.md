# Glenugie Kennels - Booking Rules System

## Overview

The booking rules system provides centralized configuration and validation for all booking restrictions at Glenugie Kennels. This ensures consistent enforcement of business rules across the customer booking form, admin booking creation, and calendar displays.

## Features

### 1. **Advance Booking Requirements**
- **Minimum Advance Booking**: Customers must book at least 1 day in advance
- **Maximum Advance Booking**: Bookings can be made up to 365 days (1 year) in advance
- **Same-Day Cutoff**: Same-day bookings blocked after 2:00 PM (14:00)

### 2. **Stay Length Restrictions**
- **Minimum Stay**: 1 night (standard)
- **Maximum Stay**: 90 nights (3 months)
- **Peak Season Minimums**: Dynamically adjusted based on dates (see Peak Seasons below)

### 3. **Blocked Dates**
#### Specific Blocked Dates
- **Christmas Day** (December 25) - Facility closed
  - Pre-configured for 2025, 2026, and 2027

#### Blocked Date Ranges
- Configurable ranges for:
  - Annual maintenance periods
  - Renovation closures
  - Extended holiday closures
  - Emergency closures

### 4. **Peak Season Rules**

The system automatically detects peak seasons and applies enhanced restrictions:

| Period | Dates | Minimum Stay |
|--------|-------|--------------|
| **Christmas/New Year** | Dec 20 - Jan 5 | 3 nights |
| **Easter** | Apr 1 - Apr 15 | 2 nights |
| **Summer Holiday** | Jul 1 - Aug 31 | 2 nights |

Peak season dates are pre-configured for multiple years and can be easily updated.

### 5. **Day of Week Restrictions**
- **Check-in Days**: Currently all days allowed (configurable)
- **Check-out Days**: Currently all days allowed (configurable)
- Can be restricted to specific days (e.g., check-in only on weekends)

### 6. **Same-Day Restrictions**
- Same-day check-in and check-out: **Not allowed**
- Same-day booking: **Blocked after 2:00 PM**

## Technical Implementation

### Core File
All booking rules are defined in: `src/lib/booking-rules.ts`

### Default Configuration

```typescript
export const DEFAULT_BOOKING_RULES: BookingRules = {
  minAdvanceBookingDays: 1,
  maxAdvanceBookingDays: 365,
  minNights: 1,
  maxNights: 90,
  blockedDates: [
    new Date(2025, 11, 25), // Christmas 2025
    new Date(2026, 11, 25), // Christmas 2026
    new Date(2027, 11, 25), // Christmas 2027
  ],
  blockedDateRanges: [],
  allowedCheckInDays: [],
  allowedCheckOutDays: [],
  peakSeasonDates: [
    {
      start: new Date(2025, 11, 20),
      end: new Date(2026, 0, 5),
      minNights: 3
    },
    // ... more peak seasons
  ],
  allowSameDayCheckInOut: false,
  cutoffTimeForSameDayBooking: 14
};
```

## Validation Functions

### 1. `validateBooking(checkInDate, checkOutDate, rules)`
Comprehensive validation that checks:
- ✅ Dates are not in the past
- ✅ Check-out is after check-in
- ✅ Advance booking requirements met
- ✅ No blocked dates in range
- ✅ Day of week restrictions (if any)
- ✅ Minimum/maximum stay length
- ✅ Peak season minimum stays
- ✅ Same-day restrictions

**Returns**: `{ valid: boolean, errors: string[] }`

**Example**:
```typescript
const validation = validateBooking(checkIn, checkOut, DEFAULT_BOOKING_RULES);
if (!validation.valid) {
  console.log(validation.errors);
  // ["Minimum stay of 3 night(s) required for peak season dates"]
}
```

### 2. `isDateBlocked(date, rules)`
Checks if a specific date is blocked due to:
- Facility closure (Christmas, etc.)
- Blocked date ranges (maintenance, etc.)

**Returns**: `boolean`

### 3. `getMinNightsForPeriod(checkInDate, rules)`
Returns the minimum nights requirement for a given check-in date, accounting for peak seasons.

**Returns**: `number`

**Example**:
```typescript
const minNights = getMinNightsForPeriod(new Date(2025, 11, 23));
// Returns 3 (Christmas peak season)

const minNights2 = getMinNightsForPeriod(new Date(2025, 5, 15));
// Returns 1 (standard)
```

### 4. `getDisabledDates(bookedDates, rules)`
Combines blocked dates, blocked ranges, and booked dates into a single array for calendar display.

**Returns**: `Date[]`

### 5. `areDatesAvailable(checkInDate, checkOutDate, bookedDates, rules)`
Checks if a date range is completely available (no blocked or booked dates).

**Returns**: `boolean`

### 6. `getBlockedDateReason(date, rules)`
Returns a human-readable reason for why a date is blocked.

**Returns**: `string | null`

**Example**:
```typescript
const reason = getBlockedDateReason(new Date(2025, 11, 25));
// Returns "Closed for Christmas Day"
```

## Usage Examples

### Customer Booking Form
```typescript
import { validateBooking, getMinNightsForPeriod } from '../lib/booking-rules';

// Validate on date selection
useEffect(() => {
  if (checkIn && checkOut) {
    const validation = validateBooking(checkIn, checkOut);
    setValidationErrors(validation.errors);
  }
  
  if (checkIn) {
    const minNights = getMinNightsForPeriod(checkIn);
    setMinNightsRequired(minNights);
  }
}, [checkIn, checkOut]);
```

### Admin Dashboard
```typescript
import { getDisabledDates } from '../lib/booking-rules';

// Get all disabled dates for calendar
const disabledDates = getDisabledDates(bookedDates, DEFAULT_BOOKING_RULES);

// Use in calendar component
<Calendar
  disabled={(date) => {
    return disabledDates.some(d => 
      d.toDateString() === date.toDateString()
    );
  }}
/>
```

### Calendar Display
```typescript
import { isDateBlocked, getBlockedDateReason } from '../lib/booking-rules';

// Check if date is blocked
const blocked = isDateBlocked(date, DEFAULT_BOOKING_RULES);

// Show reason
if (blocked) {
  const reason = getBlockedDateReason(date, DEFAULT_BOOKING_RULES);
  console.log(reason); // "Closed for Christmas Day"
}
```

## User Experience

### Visual Indicators

**In Booking Form:**
- 🔴 **Red/Destructive**: Blocked dates (Christmas, maintenance)
- 🔵 **Blue/Primary**: Selected dates
- ⚪ **White/Default**: Available dates
- ⚠️ **Warning Messages**: Display specific reasons for restrictions

**Error Messages:**
- Clear, actionable messages
- Specific reasons (e.g., "Minimum stay of 3 night(s) required for peak season dates")
- Real-time validation feedback

### Information Display

**Minimum Nights:**
- Standard: "Minimum 1 night required"
- Peak Season: "Minimum 3 nights required" (with indicator)

**Blocked Dates:**
- Hover/tooltip shows reason
- Visual distinction in calendar
- Cannot be selected

## Customization Guide

### Adding a Blocked Date

```typescript
// In src/lib/booking-rules.ts
export const DEFAULT_BOOKING_RULES: BookingRules = {
  // ... other rules
  blockedDates: [
    new Date(2025, 11, 25), // Christmas
    new Date(2026, 0, 1),   // New Year's Day 2026 (NEW)
  ],
};
```

### Adding a Blocked Date Range

```typescript
blockedDateRanges: [
  {
    start: new Date(2026, 0, 10),
    end: new Date(2026, 0, 17),
    reason: 'Annual facility maintenance'
  }
],
```

### Adding a Peak Season

```typescript
peakSeasonDates: [
  {
    start: new Date(2026, 9, 20), // October 20, 2026
    end: new Date(2026, 10, 3),   // November 3, 2026
    minNights: 2,
    reason: 'Halloween peak season' // Optional
  }
],
```

### Restricting Check-in to Specific Days

```typescript
// Only allow check-in on Mondays (1) and Fridays (5)
allowedCheckInDays: [1, 5],

// Day numbers: 0=Sunday, 1=Monday, 2=Tuesday, etc.
```

### Changing Minimum Stay

```typescript
// Increase minimum stay to 2 nights year-round
minNights: 2,
```

### Changing Advance Booking Window

```typescript
// Require 7 days advance booking
minAdvanceBookingDays: 7,

// Allow bookings up to 2 years in advance
maxAdvanceBookingDays: 730,
```

## Integration Points

### Files Using Booking Rules

1. **`src/components/BookingForm.tsx`**
   - Customer-facing booking form
   - Real-time validation
   - Date selection

2. **`src/components/admin/CreateBookingForm.tsx`**
   - Admin manual booking creation
   - Same validation rules
   - Calendar date picker

3. **`src/components/KennelAvailabilityCalendar.tsx`** (recommended)
   - Individual kennel calendars
   - Blocked date display

4. **`src/pages/api/bookings.ts`** (recommended)
   - Server-side validation
   - Prevent invalid bookings

## Future Enhancements

### Potential Additions
- ✨ Dynamic pricing based on peak seasons
- ✨ Early bird discounts for advance bookings
- ✨ Last-minute booking premiums
- ✨ Capacity-based restrictions (e.g., max bookings per day)
- ✨ Kennel-specific rules (different rules for luxury vs. standard)
- ✨ Automated peak season detection (bank holidays, school holidays)

### Database Integration
Consider storing rules in database for:
- Runtime updates without code deployment
- Historical rule tracking
- A/B testing different rule sets
- Per-branch or per-location rules

## Testing

### Test Scenarios

1. **Basic Validation**
   - ✅ Book 1 night in normal period → Allow
   - ❌ Book same-day check-in/out → Block
   - ❌ Book Christmas Day → Block

2. **Peak Season**
   - ❌ Book 1 night Dec 23-24 → Block (3 night minimum)
   - ✅ Book 3 nights Dec 23-26 → Allow
   - ✅ Book 2 nights Jul 15-17 → Allow (summer 2 night minimum)

3. **Advance Booking**
   - ❌ Book for today after 2 PM → Block
   - ✅ Book for tomorrow → Allow
   - ❌ Book for 2 years from now → Block (365 day max)

4. **Blocked Dates**
   - ❌ Check-in on Christmas → Block
   - ❌ Check-out on Christmas → Block
   - ❌ Any night overlapping Christmas → Block

## Support

For questions or customization requests, contact the development team.

## Changelog

### Version 1.0 (Current)
- Initial implementation
- Peak season support
- Blocked dates and ranges
- Advance booking validation
- Day of week restrictions
- Comprehensive validation functions
