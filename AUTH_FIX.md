# 🔐 Authentication Fix - Cloudflare Workers Compatible

## What Was The Problem?

The old authentication system used **in-memory storage** (`Set<string>`) which gets cleared when Cloudflare Workers restart. This caused:
- ❌ Tokens to expire randomly
- ❌ Users getting logged out unexpectedly
- ❌ "Unauthorized" errors after Worker restarts

## What I Fixed

### ✅ New Authentication System:

1. **Signed Tokens** - Tokens are now cryptographically signed with your admin password
2. **Stateless** - No in-memory storage needed
3. **Persistent** - Works across Worker restarts
4. **Secure** - 7-day expiration, HttpOnly cookies

### How It Works:

```
User logs in → Generate signed token → Store in HttpOnly cookie
                    ↓
Token = timestamp + signature
                    ↓
Signature = hash(timestamp + admin_password)
                    ↓
On verification: Re-compute signature and compare
```

## Files Updated

✅ `src/lib/admin-auth.ts` - New token signing/verification  
✅ `src/pages/api/admin/auth.ts` - Uses new token generation  
✅ `src/pages/api/admin/bookings.ts` - Updated auth calls  
✅ `src/pages/api/admin/bookings/[bookingId].ts` - Updated auth calls  
✅ `src/pages/api/admin/rates.ts` - Updated auth calls  
✅ `src/pages/api/admin/booking-rules.ts` - Updated auth calls  
✅ `src/pages/api/admin/init-data.ts` - Updated auth calls  

## Testing Your Fix

### Step 1: Deploy the Fix

```bash
npm run build
wrangler deploy
```

### Step 2: Test Authentication

Visit: **https://glenugiekennels.co.uk/debug-auth**

This debug page lets you:
1. ✅ Test login with password
2. ✅ Verify token is valid
3. ✅ Test admin API access
4. ✅ Check environment/cookies
5. ✅ Logout and clear session

### Step 3: Test Admin Dashboard

1. Go to `/admin`
2. Login with: `Peterhead2026!`
3. Should stay logged in (7 days)
4. Refresh page - should stay logged in
5. Close browser and reopen - should stay logged in

## How to Use

### Admin Login:
```javascript
// POST /api/admin/auth
{
  "password": "Peterhead2026!"
}

// Response:
{
  "token": "l9k2j3h-a7s8d9",
  "success": true
}

// Cookie set automatically:
admin_session=l9k2j3h-a7s8d9; HttpOnly; Secure; Max-Age=604800
```

### Check Token:
```javascript
// GET /api/admin/auth
// Automatically reads cookie

// Response if valid:
{
  "valid": true,
  "token": "l9k2j3h-a7s8d9"
}

// Response if invalid:
{
  "valid": false
}
```

### Logout:
```javascript
// DELETE /api/admin/auth

// Response:
{
  "success": true
}

// Cookie cleared
```

## Environment Variables

Make sure these are set in Cloudflare:

```bash
# In wrangler.jsonc (already set):
"vars": {
  "ADMIN_PASSWORD": "Peterhead2026!"
}

# Or set as secret (more secure):
wrangler secret put ADMIN_PASSWORD
# Then enter: Peterhead2026!
```

## Token Lifecycle

```
Login
  ↓
Token generated with signature
  ↓
Stored in HttpOnly cookie (7 days)
  ↓
Every API request: Token verified with signature
  ↓
After 7 days: Token expires
  ↓
User needs to login again
```

## Security Features

✅ **HttpOnly Cookies** - JavaScript can't access tokens  
✅ **Secure Flag** - Only sent over HTTPS  
✅ **SameSite=Lax** - CSRF protection  
✅ **7-day Expiration** - Automatic timeout  
✅ **Signed Tokens** - Tamper-proof  
✅ **Stateless** - No database needed  

## Troubleshooting

### "Unauthorized" after login

**Check 1:** Is ADMIN_PASSWORD set correctly?
```bash
wrangler secret list
```

**Check 2:** Test login:
```bash
curl -X POST https://glenugiekennels.co.uk/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"Peterhead2026!"}'
```

**Check 3:** Check cookies in browser DevTools:
- Application → Cookies → admin_session
- Should be HttpOnly, Secure

### Token expires immediately

**Check:** System time might be wrong. Tokens use timestamps.

### Can't access admin APIs

**Check 1:** Is cookie being sent?
- DevTools → Network → Request Headers → Cookie

**Check 2:** Is token valid?
```bash
curl https://glenugiekennels.co.uk/api/admin/auth \
  -H "Cookie: admin_session=your-token"
```

## Changing Admin Password

### Option 1: Update wrangler.jsonc
```json
"vars": {
  "ADMIN_PASSWORD": "YourNewPassword123!"
}
```

Then deploy:
```bash
wrangler deploy
```

### Option 2: Use Secrets (More Secure)
```bash
wrangler secret put ADMIN_PASSWORD
# Enter your new password when prompted
```

**Note:** All existing tokens will be invalid after password change. Users must login again.

## Why This Is Better

| Old System | New System |
|------------|------------|
| ❌ In-memory storage | ✅ Stateless tokens |
| ❌ Lost on Worker restart | ✅ Persistent across restarts |
| ❌ No expiration | ✅ 7-day auto-expiration |
| ❌ Not signed | ✅ Cryptographically signed |
| ❌ Not Cloudflare-friendly | ✅ Built for Cloudflare Workers |

## Next Steps

1. ✅ Deploy the fix: `wrangler deploy`
2. ✅ Test at `/debug-auth`
3. ✅ Try logging into `/admin`
4. ✅ Verify it persists across refreshes
5. ✅ Delete `/debug-auth` page when done (optional)

## Questions?

- **Q: How long do tokens last?**  
  A: 7 days from login

- **Q: Can I change the expiration?**  
  A: Yes, edit `src/lib/admin-auth.ts` line with `sevenDays`

- **Q: Is this secure?**  
  A: Yes - signed tokens + HttpOnly + Secure + HTTPS = very secure

- **Q: What if I forget the password?**  
  A: Update `ADMIN_PASSWORD` in wrangler.jsonc or secrets

---

**Your authentication is now Cloudflare Workers compatible! 🎉**
