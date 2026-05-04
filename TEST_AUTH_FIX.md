# 🔐 Admin Authentication Fix

## What Was Fixed

### **Problem:**
1. Login worked but logout didn't properly clear the session
2. After logout, couldn't log back in
3. Token mismatch between login response (`token`) and what the component was looking for (`sessionId`)

### **Solution:**
1. ✅ Fixed token storage - now using `data.token` instead of `data.sessionId`
2. ✅ Added proper logout that clears everything and reloads the page
3. ✅ Created `AdminLoginWrapper` component to handle authentication state
4. ✅ Added authentication check on page load

---

## Files Changed

1. **`src/components/admin/AdminLogin.tsx`**
   - Fixed: Now stores `data.token` instead of `data.sessionId`
   - Cookie is set by server via `Set-Cookie` header

2. **`src/components/admin/AdminDashboard.tsx`**
   - Fixed: Logout now reloads the page after clearing session
   - Clears: localStorage, sessionStorage, and cookies

3. **`src/components/admin/AdminLoginWrapper.tsx`** ✨ NEW
   - Handles authentication state
   - Checks token validity on mount
   - Shows login or dashboard based on auth status

4. **`src/pages/admin/index.astro`**
   - Now uses `AdminLoginWrapper` instead of direct dashboard

---

## How It Works Now

### **Login Flow:**
1. User enters password
2. POST to `/api/admin/auth`
3. Server returns `{ token: "..." }`
4. Token stored in localStorage
5. Server sets HttpOnly cookie
6. Dashboard shown

### **Logout Flow:**
1. User clicks "Logout"
2. DELETE to `/api/admin/auth`
3. Server clears cookie
4. Client clears localStorage & sessionStorage
5. **Page reloads** → forces re-authentication
6. Login screen shown

### **Authentication Check:**
1. Page loads
2. Check for token in localStorage
3. GET to `/api/admin/auth` with token
4. Server validates token signature & expiry
5. If valid → show dashboard
6. If invalid → clear token, show login

---

## Testing Steps

### **1. Test Login**
```bash
# Navigate to admin
https://www.glenugiekennels.co.uk/app/admin

# Should see login screen
# Enter password: Peterhead2026!
# Should redirect to dashboard
```

### **2. Test Session Persistence**
```bash
# Refresh the page
# Should stay logged in (no login prompt)
```

### **3. Test Logout**
```bash
# Click "Logout" button
# Page should reload
# Should see login screen again
```

### **4. Test Re-Login**
```bash
# Enter password again
# Should successfully log in
# Dashboard should load
```

---

## Deploy Instructions

### **Option 1: Push to GitHub (Automatic Deploy)**
```bash
cd /app
git add .
git commit -m "Fix admin authentication and logout"
git push https://YOUR_TOKEN@github.com/dalebunnett/glenugie-booking.git main
```

### **Option 2: Deploy to Webflow Cloud**
Your Webflow deployment will automatically pick up the changes from GitHub!

---

## Environment Variables Required

Make sure these are set in Webflow Cloud:

```
ADMIN_PASSWORD=Peterhead2026!
```

---

## Security Notes

✅ Tokens are signed and expire after 7 days
✅ HttpOnly cookies prevent XSS attacks
✅ Tokens stored in localStorage as fallback
✅ Server validates token signature on every request
✅ Logout clears all session data

---

## Troubleshooting

### **Still can't logout?**
1. Check browser console for errors
2. Clear browser cache
3. Check Webflow Runtime Logs

### **Can't login after logout?**
1. Clear localStorage manually: `localStorage.clear()`
2. Clear all cookies for the domain
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### **Token not persisting?**
1. Check if `ADMIN_PASSWORD` env var is set in Webflow
2. Check browser console for cookie errors
3. Ensure site is served over HTTPS

---

## Next Steps

1. ✅ Test locally (if needed)
2. 🚀 Push to GitHub
3. ⏱️ Wait for Webflow deployment
4. 🧪 Test on production
5. 🎉 Done!

