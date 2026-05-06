# ✅ Quick Test Checklist

After you deploy the authentication fix, follow these steps:

## 1️⃣ Verify Deployment

Visit: `https://www.glenugiekennels.co.uk/app/api/admin/debug-auth`

**Expected**: JSON output with authentication diagnostics  
**If 404**: New code not deployed yet - wait and retry

## 2️⃣ Login

Go to: `https://www.glenugiekennels.co.uk/app/admin`  
Password: `Peterhead2026!`

**Expected**: Dashboard loads with bookings  
**If "Unauthorized"**: Clear browser data and try again

## 3️⃣ Check Token in Browser

Open DevTools Console (F12) and run:
```javascript
console.log(document.cookie);
```

**Expected**: Should show `admin_session=xxxxx-xxxxx`  
**If empty**: Login didn't work - check console for errors

## 4️⃣ Test API Access

In browser console:
```javascript
fetch('/app/api/admin/bookings', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
  },
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Bookings:', data));
```

**Expected**: Array of bookings (may be empty)  
**If "Unauthorized"**: Token not being sent correctly

## 5️⃣ Initialize Data (If No Bookings)

```javascript
fetch('/app/api/admin/init-data', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
  },
  credentials: 'include'
})
.then(r => r.json())
.then(data => {
  console.log('Initialized:', data);
  window.location.reload(); // Refresh to see bookings
});
```

## 6️⃣ Verify Persistence

1. Refresh the page
2. Check if you're still logged in (should be!)
3. Check if bookings still show (should be!)

**Expected**: No re-login required  
**If logged out**: Authentication still broken - share console errors

---

## Quick Fixes

### If Login Fails
```javascript
// Clear everything
localStorage.clear();
sessionStorage.clear();
// Then refresh page and try again
```

### If Bookings Don't Show
```javascript
// Check if API is accessible
fetch('/app/api/admin/bookings', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
  },
  credentials: 'include'
})
.then(r => r.text())
.then(text => console.log('Response:', text));
```

### If Getting 403 Errors
```javascript
// Check token validity
fetch('/app/api/admin/debug-auth', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
  },
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Auth status:', data));
```

---

## Success Criteria

✅ Can login without errors  
✅ Dashboard shows bookings and rules  
✅ Token persists after page refresh  
✅ No constant re-login required  
✅ API calls work without 403 errors  

If all checked, **authentication is working!** 🎉

---

## If Still Broken

Share these details:
1. Output from `/app/api/admin/debug-auth`
2. Browser console errors (screenshot)
3. Webflow deployment status
4. Which step failed above
