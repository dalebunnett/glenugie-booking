# Kennel Number Auto-Allocation System

## Overview
The system now automatically allocates kennel numbers for **The Village** and **Ruff's Retreat** bookings. Each kennel is numbered and tracked individually to prevent double-bookings.

## Kennel Capacity
- **The Village**: 6 kennels (numbered 1-6)
- **Ruff's Retreat**: 12 kennels (numbered 1-12)

## How It Works

### Automatic Allocation
1. When a booking is created for The Village or Ruff's Retreat, the system automatically finds the first available kennel number
2. The system checks for date overlaps with existing bookings
3. Only kennels that are free during the entire stay are considered available
4. The lowest available kennel number is assigned

### Manual Override
Administrators can manually assign a specific kennel number when:
- Editing a booking in the admin dashboard
- Creating a new booking through the admin panel

### Migration
All existing Village and Ruff's Retreat bookings without kennel numbers are automatically assigned numbers on system startup.

## Display

### Admin Dashboard - Bookings List
Kennel numbers are displayed in the accommodation column:
- "The Village #3"
- "Ruff's Retreat #7"

### Admin Dashboard - Individual Kennel Calendar
- Each kennel now has its own calendar row
- Shows availability and bookings per individual kennel
- Makes it easy to see which specific kennels are occupied

### CSV Export
Kennel numbers are included in a dedicated "Kennel Number" column in exported booking reports.

### Booking Details
When viewing booking details, kennel numbers are shown alongside the accommodation type for Village and Ruff's Retreat bookings.

## Implementation Details

### Database Changes
Added `kennelNumber?: number` field to the Booking interface in `src/lib/booking-types.ts`

### Auto-Allocation Logic
Located in `src/lib/db.ts`:
- `allocateKennelNumber()` function finds the next available kennel
- Checks for date overlaps with existing bookings
- Returns `null` if no kennels are available (fully booked)
- Automatically called on `create()` and `update()` operations

### Admin Components Updated
1. **BookingsList.tsx**
   - Shows kennel numbers in table
   - Shows kennel numbers in detail view
   - Allows manual kennel number selection in edit mode
   - Includes kennel numbers in CSV export

2. **IndividualKennelCalendar.tsx**
   - Standard Kennels tab now shows individual kennels
   - Each kennel (1-6 for Village, 1-12 for Ruff's Retreat) has its own calendar
   - Easy to see availability per specific kennel

3. **CreateBookingForm.tsx**
   - Automatically assigns kennel numbers (no UI changes needed)
   - Works seamlessly in the background

## Future Enhancements
Possible improvements for the future:
- Preference tracking (customers who prefer specific kennels)
- Kennel-specific notes or features
- Reporting by kennel utilization rates
- Block specific kennels for maintenance
