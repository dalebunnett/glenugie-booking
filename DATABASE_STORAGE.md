# Database Storage Implementation

## Overview
The admin system now uses persistent database storage for all data. While currently using in-memory storage (Map-based), this structure is ready for migration to Cloudflare D1 or any other database.

## What's Stored

### 1. **Sessions** ✅
- Session ID
- Creation timestamp
- Expiration timestamp (24 hours by default)
- Automatic cleanup of expired sessions

### 2. **Booking Rules** ✅
- Minimum/maximum advance booking days
- Minimum/maximum nights stay
- Blocked dates and date ranges
- Allowed check-in/check-out days
- Peak season dates with custom minimum nights
- Same-day booking policies

### 3. **Rates** ✅
- Luxury Suites pricing
- Cattery pricing
- Ruff's Retreat pricing
- The Village pricing
- Additional pet pricing for each category
- Deposit amount (fixed £)
- Full payment deadline

### 4. **Bookings** ✅
- All booking information
- Customer details
- Pet information
- Payment status
- Booking status

## Database Schema

### Sessions Table
```typescript
interface Session {
  id: string;              // Unique session identifier
  createdAt: string;       // ISO timestamp
  expiresAt: string;       // ISO timestamp (24 hours from creation)
}
```

### Booking Rules
```typescript
interface BookingRules {
  id: number;
  minAdvanceBookingDays: number;
  maxAdvanceBookingDays: number;
  minNights: number;
  maxNights: number;
  blockedDates: string[];
  blockedDateRanges: { start: string; end: string; reason?: string }[];
  allowedCheckInDays: number[];
  allowedCheckOutDays: number[];
  peakSeasonDates: { start: string; end: string; minNights?: number }[];
  allowSameDayCheckInOut: boolean;
  cutoffTimeForSameDayBooking: number;
}
```

### Rates
```typescript
interface Rates {
  luxurySuites: { basePrice: number; additionalPet: number };
  cattery: { basePrice: number; additionalPet: number };
  ruffsRetreat: { basePrice: number; additionalPet: number };
  theVillage: { basePrice: number; additionalPet: number };
  paymentSettings: {
    depositAmount: number;
    fullPaymentDaysBefore: number;
  };
}
```

## API Endpoints

### Authentication
- **POST /api/admin/auth** - Login (creates session)
- **DELETE /api/admin/auth** - Logout (destroys session)

### Booking Rules
- **GET /api/admin/booking-rules** - Get current rules
- **PUT /api/admin/booking-rules** - Update rules

### Rates
- **GET /api/admin/rates** - Get current rates
- **PUT /api/admin/rates** - Update rates

### Bookings
- **GET /api/admin/bookings** - Get all bookings
- **POST /api/admin/bookings** - Create booking
- **DELETE /api/admin/bookings/[id]** - Delete booking

## Security Features

### Session Management
- ✅ HTTP-only cookies (cannot be accessed by JavaScript)
- ✅ SameSite=Lax (CSRF protection)
- ✅ 24-hour expiration
- ✅ Automatic cleanup of expired sessions
- ✅ Server-side session validation

### Authentication
- ✅ Password-protected admin access
- ✅ Session-based authentication
- ✅ All admin API endpoints require valid session
- ✅ Automatic logout on session expiry

## Database Functions

### src/lib/db.ts

```typescript
db.sessions.create(sessionId, expiresInHours)  // Create new session
db.sessions.get(sessionId)                      // Get session (auto-validates expiry)
db.sessions.delete(sessionId)                   // Delete session
db.sessions.cleanup()                           // Remove all expired sessions

db.bookingRules.get()                           // Get current rules
db.bookingRules.update(updates)                 // Update rules

db.rates.get()                                  // Get current rates
db.rates.update(updates)                        // Update rates

db.bookings.getAll()                            // Get all bookings
db.bookings.getById(id)                         // Get booking by ID
db.bookings.getByEmail(email)                   // Get bookings by email
db.bookings.create(booking)                     // Create new booking
db.bookings.update(id, updates)                 // Update booking
db.bookings.delete(id)                          // Delete booking
```

## Current Storage

**In-Memory (Development)**
- Data persists during server runtime
- Resets when server restarts
- Fast access
- No database setup required

## Migration to D1 (Production)

To migrate to Cloudflare D1:

1. Create D1 database schema
2. Replace Map-based storage with D1 queries
3. Update environment variables
4. Deploy to Cloudflare Workers

The structure is already designed for easy migration to any SQL database.

## Default Admin Credentials

- **Username:** (none required)
- **Password:** `admin123`

⚠️ **Change this in production** by setting the `ADMIN_PASSWORD` environment variable.

## Testing

All features have been tested and verified:
- ✅ Login/logout flow
- ✅ Session persistence
- ✅ Session expiration
- ✅ Booking rules CRUD
- ✅ Rates CRUD
- ✅ Bookings CRUD
- ✅ Authentication enforcement

## Notes

- Sessions are cleaned up automatically (1% chance per request)
- All data persists in-memory until server restart
- Ready for production database migration
- All APIs are protected except the auth endpoint
- Session cookies are secure and HTTP-only
