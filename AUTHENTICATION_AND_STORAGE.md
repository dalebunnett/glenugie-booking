# Authentication & Storage Guide

## Overview

The Glenugie Kennels booking system now uses a simplified authentication and storage system optimized for Cloudflare Workers deployment.

## Authentication System

### How It Works

1. **Token-Based Authentication**: Admin sessions use simple tokens stored in global memory
2. **Session Persistence**: Tokens are stored in a global Set that survives across requests within the same worker instance
3. **Cookie Management**: Tokens are sent via both Authorization header and HTTP-only cookies
4. **7-Day Expiration**: Sessions last 7 days via cookie max-age

### Login Credentials

- **Password**: `Peterhead2026!` (hardcoded in `/src/pages/api/admin/auth.ts`)
- To change: Update `ADMIN_PASSWORD` constant in `src/pages/api/admin/auth.ts`

### API Endpoints

#### Login
```bash
POST /api/admin/auth
Content-Type: application/json

{
  "password": "Peterhead2026!"
}

Response:
{
  "token": "...",
  "success": true,
  "message": "Login successful"
}
```

#### Verify Session
```bash
GET /api/admin/auth
Authorization: Bearer <token>

Response:
{
  "valid": true,
  "token": "..."
}
```

#### Logout
```bash
DELETE /api/admin/auth
Authorization: Bearer <token>

Response:
{
  "success": true
}
```

### Protected Routes

All admin routes under `/api/admin/*` (except `/api/admin/auth`) require authentication:
- `/api/admin/bookings` - Booking management
- `/api/admin/bookings/[id]` - Individual booking operations
- `/api/admin/booking-rules` - Booking rules configuration
- `/api/admin/rates` - Rate management
- `/api/admin/init-data` - Data initialization

## Storage System

### Architecture

The system uses a **hybrid storage approach**:

1. **Global Memory Storage** (Primary)
   - Fast in-memory storage using `globalThis`
   - Survives across requests in the same worker instance
   - Automatically initialized with default data

2. **Cloudflare KV** (Optional, for persistence)
   - When KV namespace is bound to worker, data persists across deployments
   - Automatic fallback to global storage if KV is unavailable
   - Transparent read/write operations

### Data Storage Locations

```
Global Memory (globalThis.__GLENUGIE_STORAGE__)
  ├── bookings: Booking[]
  ├── bookingRules: BookingRules
  └── rates: Rates

Cloudflare KV (if configured)
  ├── key: "bookings" → value: JSON array
  ├── key: "booking-rules" → value: JSON object
  └── key: "rates" → value: JSON object
```

### Storage Class

Located at `/src/lib/storage.ts`:

```typescript
import { getStorage } from './storage';

const storage = getStorage();

// Read operations
const bookings = await storage.getBookings();
const rules = await storage.getBookingRules();
const rates = await storage.getRates();

// Write operations
await storage.saveBookings(bookings);
await storage.saveBookingRules(rules);
await storage.saveRates(rates);

// Initialize with data
await storage.initialize({
  bookings: [...],
  bookingRules: {...},
  rates: {...}
});
```

### Data Initialization

On first admin login, the system automatically initializes with data from `bookings-data.json`:

```bash
POST /api/admin/init-data
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Initialized with 123 bookings",
  "count": 123
}
```

This endpoint:
- Loads all bookings from `bookings-data.json`
- Stores them in global memory
- Attempts to persist to KV if available
- Called automatically by AdminDashboard on mount

## Database Layer

### API (`/src/lib/db.ts`)

The database layer provides async methods for all operations:

```typescript
import { db } from './db';

// Bookings
const bookings = await db.bookings.getAll();
const booking = await db.bookings.getById(id);
const created = await db.bookings.create(booking);
const updated = await db.bookings.update(id, changes);
const deleted = await db.bookings.delete(id);

// Rules
const rules = await db.bookingRules.get();
const updated = await db.bookingRules.update(changes);

// Rates
const rates = await db.rates.get();
const updated = await db.rates.update(changes);
```

### Automatic Kennel Allocation

For "The Village" and "Ruff's Retreat":
- System automatically assigns kennel numbers (1-6 for Village, 1-12 for Ruff's)
- Prevents double-booking by checking overlapping dates
- Finds first available kennel number
- Updates on booking creation or date changes

## Deployment Considerations

### Webflow Cloud Deployment

**Current Setup (Works Immediately)**:
- Authentication: ✅ Token-based, stored in worker memory
- Storage: ✅ Global memory, survives during worker lifetime
- Data Persistence: ⚠️ Lost on worker restart/redeploy
- Auto-init: ✅ Loads from bookings-data.json on admin login

**Limitations**:
- Bookings created after deployment are lost if worker restarts
- No data backup between deployments
- Recommended for testing only

### Adding Persistent Storage (Optional)

To enable Cloudflare KV for true persistence:

1. **Create KV Namespace**:
```bash
wrangler kv:namespace create "GLENUGIE_STORAGE"
```

2. **Update `wrangler.jsonc`**:
```json
{
  "kv_namespaces": [
    {
      "binding": "GLENUGIE_STORAGE",
      "id": "your-namespace-id"
    }
  ]
}
```

3. **Configure in Webflow**:
   - Go to Webflow deployment settings
   - Add KV namespace binding
   - Binding name: `GLENUGIE_STORAGE`
   - Namespace ID: from step 1

4. **Update API Routes** (if needed):
```typescript
export default {
  async fetch(request, env) {
    const storage = getStorage(env.GLENUGIE_STORAGE);
    // ... rest of handler
  }
};
```

Once KV is configured:
- ✅ Data persists across deployments
- ✅ Automatic backup on every write
- ✅ No code changes needed (storage layer handles it)

## Security Notes

### Current Setup
- Password is hardcoded (change in `src/pages/api/admin/auth.ts`)
- Tokens stored in worker memory (not encrypted)
- Sessions last 7 days
- HTTP-only cookies prevent XSS attacks

### Production Recommendations
1. Use environment variable for password
2. Implement token encryption
3. Add rate limiting for login attempts
4. Enable HTTPS-only cookies
5. Add session refresh mechanism
6. Implement audit logging

## Troubleshooting

### "Unauthorized" errors
- Check that you're logged in via `/admin`
- Verify token is being sent in requests
- Check browser cookies for `admin_session`

### Bookings disappear after deployment
- This is expected without KV configured
- Use `/api/admin/init-data` to reload from JSON
- Or configure KV for persistence

### Can't log in
- Verify password: `Peterhead2026!`
- Check browser console for errors
- Try clearing cookies and logging in again

### Data not saving
- Check that API requests succeed (200 status)
- Verify token is valid
- Look at server logs for storage errors

## Testing

### Test Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"Peterhead2026!"}'

# Verify (use token from login response)
curl -X GET http://localhost:3000/api/admin/auth \
  -H "Authorization: Bearer <token>"
```

### Test Storage
```bash
# Get bookings (authenticated)
curl -X GET http://localhost:3000/api/admin/bookings \
  -H "Authorization: Bearer <token>"

# Initialize data
curl -X POST http://localhost:3000/api/admin/init-data \
  -H "Authorization: Bearer <token>"
```

## Files Modified

### New Files
- `/src/lib/storage.ts` - Storage abstraction layer
- `/src/lib/admin-auth.ts` - Authentication helpers
- `/src/pages/api/admin/init-data.ts` - Data initialization endpoint
- `/AUTHENTICATION_AND_STORAGE.md` - This file

### Modified Files
- `/src/lib/db.ts` - Updated to use async storage
- `/src/pages/api/admin/auth.ts` - Simplified token auth
- `/src/pages/api/admin/*.ts` - Added auth checks
- `/src/pages/api/bookings.ts` - Async storage calls
- `/src/pages/api/availability/[slug].ts` - Async storage calls
- `/src/components/admin/AdminDashboard.tsx` - Auto-initialization

## Next Steps

For production deployment:
1. ✅ Deploy current code to Webflow
2. ✅ Test admin login
3. ✅ Verify bookings load from JSON
4. ⏳ Configure Cloudflare KV for persistence
5. ⏳ Change admin password
6. ⏳ Enable production security features
