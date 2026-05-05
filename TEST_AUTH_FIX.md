# Testing the Authentication Fix

## 🔧 What Was Fixed

1. ✅ **Cookie path changed** from `/` to `/app`
2. ✅ **Token error fixed** in all admin endpoints
3. ✅ **Dashboard stats calculation** added
4. ✅ **Test pages created** for debugging

## 🧪 Step-by-Step Testing Guide

### Before You Start
- Make sure you've **pushed to GitHub** and Webflow has **deployed the latest build**
- Clear your browser cache and cookies for the site
- Open browser in **Incognito/Private mode** for cleanest test

### Test 1: Authentication Test Page

**URL**: `https://glenugiekennels.webflow.io/app/api/debug/test-auth`

**Expected Before Login**:
```
❌ Not Authenticated
Token Found: ✗ No
Token Source: Not found
```

**Expected After Login** (after logging in at `/app/admin`):
```
✅ Authentication Successful  
Token Found: ✓ Yes
Token Source: Cookie (admin_session)
Token Valid: ✓ Yes
```

**What This Tests**: Whether the authentication cookie is being set and sent correctly

---

### Test 2: Environment Check Page

**URL**: `https://glenugiekennels.webflow.io/app/api/debug/env-check`

**Expected Results**:
```
✅ Runtime Environment: Available
✅ KV Storage (BOOKINGS_KV): Bound
✅ Read Test: ✓ Success
✅ Write Test: ✓ Success
✅ ADMIN_PASSWORD: ✓ Set
✅ DB Initialization: ✓ Success
✅ Bookings Query: ✓ X bookings found
```

**What This Tests**: Whether your environment is configured correctly

---

### Test 3: Admin Login Flow

1. **Visit**: `https://glenugiekennels.webflow.io/app/admin`

2. **Expected**: Login form appears

3. **Enter**: Password `Peterhead2026!`

4. **Click**: "Login" button

5. **Expected**: 
   - Success message appears
   - Dashboard loads
   - **NO console errors**
   - Stats show correct numbers
   - Bookings list appears

6. **Open DevTools** → Application → Cookies

7. **Expected Cookie**:
   ```
   Name: admin_session
   Value: [long token string]
   Path: /app
   Secure: ✓
   HttpOnly: ✓
   SameSite: Lax
   Expires: [7 days from now]
   ```

---

### Test 4: Session Persistence

1. **After logging in**, close the browser completely

2. **Reopen browser** and visit: `https://glenugiekennels.webflow.io/app/admin`

3. **Expected**: 
   - Dashboard loads immediately
   - NO login screen
   - You're still authenticated

4. **What This Tests**: Cookie persistence across browser sessions

---

### Test 5: API Requests (Browser Console)

**While logged into admin dashboard**, open browser console and run:

```javascript
// Test bookings endpoint
fetch('/app/api/admin/bookings', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Bookings:', data));

// Test rules endpoint
fetch('/app/api/admin/booking-rules', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Rules:', data));

// Test rates endpoint  
fetch('/app/api/admin/rates', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Rates:', data));
```

**Expected**: All three should return data, **NO 403 errors**

---

### Test 6: Create a Test Booking

1. Go to **Create tab** in admin dashboard

2. Fill out a test booking:
   - Customer: Test User
   - Email: test@example.com
   - Pet: Test Dog
   - Dates: Any available dates
   - Accommodation: Any type

3. **Click**: "Create Booking"

4. **Expected**:
   - Success message
   - Booking appears in Bookings tab
   - Refresh page → booking still there (saved to KV)

---

## 🚨 If Tests Fail

### If Auth Test Shows "Not Authenticated" After Login:

1. Check browser DevTools → Application → Cookies
2. Is `admin_session` cookie present?
   - **No**: Cookie not being set (check server logs)
   - **Yes, but Path=/**: Old cached build, need to redeploy
   - **Yes, Path=/app**: Token might be invalid

3. Run in console:
   ```javascript
   document.cookie
   ```
   Look for `admin_session` in output

### If Environment Check Shows "KV Not Bound":

1. Go to Webflow project settings
2. Add KV namespace binding:
   - Name: `BOOKINGS_KV`
   - Type: KV Namespace
3. Redeploy

### If You See 403 Errors:

1. Check that you deployed the **latest code**
2. Clear browser cache completely
3. Try in Incognito/Private window
4. Check server logs for authentication errors

### If Dashboard Won't Load:

1. Open browser console
2. Look for specific error message
3. Check Network tab for failed requests
4. Visit `/app/api/debug/env-check` to verify environment

---

## ✅ Success Checklist

After deployment, confirm:

- [ ] `/app/api/debug/test-auth` shows auth status correctly
- [ ] `/app/api/debug/env-check` shows all green checkmarks
- [ ] Can log in at `/app/admin` without errors
- [ ] Dashboard loads with stats and bookings
- [ ] Cookie is set with Path=/app
- [ ] No 403 errors in console
- [ ] Session persists after closing browser
- [ ] Can create test bookings
- [ ] Bookings appear in admin dashboard
- [ ] Data persists after page refresh

---

## 📞 Need Help?

If tests fail:

1. Take screenshots of:
   - `/app/api/debug/test-auth` page
   - `/app/api/debug/env-check` page
   - Browser console errors
   - DevTools → Application → Cookies

2. Share the screenshots for debugging

3. Check that:
   - Latest code is deployed
   - Environment variables are set
   - KV namespace is bound
   - Browser cache is cleared
