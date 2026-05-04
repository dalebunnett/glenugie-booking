# Booking Import & Payment Tracking Update

## Summary
Updated the booking system to properly save imported bookings and track payment details including paid amount and total due.

## Changes Made

### 1. Enhanced Booking Types (`src/lib/booking-types.ts`)
- Added `paidAmount?: number` - tracks how much has been paid
- Added `totalDue?: number` - tracks remaining balance
- Extended `paymentStatus` to include `'paid'` and `'partial'` statuses

### 2. Updated Bookings Importer (`src/components/admin/BookingsImporter.tsx`)
- **Fixed flexible header mapping** - Now properly uses case-insensitive header matching
- **Added getValue helper** - Automatically finds columns by multiple possible names
- **Enhanced payment parsing**:
  - Extracts `Paid` amount from CSV
  - Extracts `Total` amount from CSV
  - Calculates `Total Due` automatically
  - Sets correct payment status based on amounts

### 3. Import API Updates (`src/pages/api/admin/bookings/import.ts`)
- Added support for `paidAmount` field
- Added support for `totalDue` field
- Calculates total due if not provided: `totalDue = totalAmount - paidAmount`
- Sets payment status to `'paid'` if totalDue <= 0, otherwise `'partial'`

### 4. Bookings List Enhancement (`src/components/admin/BookingsList.tsx`)
- **New Table Columns**:
  - `Paid` - shows amount paid in green
  - `Due` - shows remaining balance in orange
- **Updated Booking Details**:
  - Shows Total, Paid, and Total Due in the view mode
  - Edit mode includes all three payment fields
  - Auto-calculates Total Due when editing paid amount
- **CSV Export**:
  - Includes `Paid Amount` column
  - Includes `Total Due` column

### 5. Database Updates (`src/lib/db.ts`)
- Added `paidAmount` and `totalDue` to sample bookings
- Updated seed data with realistic payment scenarios

### 6. Booking Creation API (`src/pages/api/bookings.ts`)
- New bookings start with:
  - `paidAmount: 0`
  - `totalDue: data.totalPrice`
  - `paymentStatus: 'pending'`

## CSV Import Format

The importer now accepts these payment-related columns:
- `Paid` / `Amount Paid` / `Deposit` - amount already paid
- `Total` / `Total Price` / `Total Amount` / `Total Due` / `Balance` - total booking price

### Example CSV Headers:
```
Check-in, Check-out, Accommodation, First Name, Last Name, Email, Phone, 
Full Guest Name, breed, sex, age, Total, Paid, Status
```

## Payment Status Logic

| Condition | Payment Status |
|-----------|---------------|
| totalDue <= 0 | `paid` or `fully-paid` |
| 0 < paidAmount < totalPrice | `partial` or `deposit-paid` |
| paidAmount = 0 | `pending` |

## Admin Dashboard Features

### Bookings Table
- Quick view of payment status at a glance
- Green text for paid amounts
- Orange text for amounts still due
- Color-coded payment status badges

### Booking Details
- Full payment breakdown
- Edit capabilities for all payment fields
- Automatic calculation of remaining balance

### CSV Export
- Complete payment information included
- Ready for accounting and reconciliation

## Testing

To test the import functionality:

1. Go to **Admin Dashboard** → **Import Bookings**
2. Copy data from Excel with the following columns (minimum):
   - Check-in, Check-out, Accommodation
   - First Name, Last Name, Email, Phone
   - Pet name (Full Guest Name)
   - Total, Paid
3. Paste into the text area
4. Click **Import Bookings**

The system will:
- Parse the data with flexible header matching
- Calculate total due automatically
- Set appropriate payment status
- Create all bookings in the database

## Notes

- All payment amounts are in GBP (£)
- The system automatically handles various column name formats
- Payment calculations are performed server-side for accuracy
- Empty or malformed rows are skipped with warnings
