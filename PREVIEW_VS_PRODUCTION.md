# Preview vs Production Access Guide 🚀

## The Issue You're Experiencing

You're seeing this error:
```
AUTHENTICATION_REQUIRED
Authentication required for preview
```

This happens because you're accessing the site through a **Webflow preview URL** (e.g., `https://xxx.app.webflow.io`) which has platform-level authentication **before** your app code even runs.

## Two Types of URLs

### 1. **Preview URL** (Development/Testing)
- Format: `https://[random-id].app.webflow.io/app/admin`
- **Requires Webflow authentication** before your code runs
- Used for testing before going live
- Has additional security layer from Webflow

### 2. **Production URL** (Live Site)
- Format: `https://www.glenugiekennels.co.uk/app/admin`
- **No platform authentication** - goes directly to your app
- Your admin password authentication works here
- This is what customers/admins will use

## Solution: Use the Right URL

### For Admin Access (YOU)
✅ **Use Production URL**: `https://www.glenugiekennels.co.uk/app/admin`
- Enter your admin password (`Peterhead2026!`)
- Full access to admin dashboard
- No Webflow preview authentication required

### For Testing New Features
If you must use the preview URL:

1. **Option A: Bypass Preview Auth**
   - Contact Webflow support to disable preview authentication
   - Or request a preview access token

2. **Option B: Deploy to Production First**
   - Push changes to GitHub
   - Let Webflow Cloud auto-deploy
   - Test on production URL

## How to Access Your Admin Dashboard

### Step 1: Go to Production URL
```
https://www.glenugiekennels.co.uk/app/admin
```

### Step 2: Enter Admin Password
```
Password: Peterhead2026!
```

### Step 3: You're In!
The dashboard should load with:
- Bookings calendar
- Booking list
- Rates management
- Rules management
- Import tools

## Current Setup

### ✅ What's Working
- Admin authentication system
- KV database bindings
- All API endpoints
- Token generation and validation

### ⚠️ Preview URL Limitation
- Preview URLs (`*.webflow.io`) require Webflow platform auth
- This is a **Webflow security feature**, not a bug in your code
- Cannot be bypassed without Webflow support

## Deployment Checklist

To ensure everything works on production:

### 1. Environment Variables (Set in Webflow Cloud)
```bash
ADMIN_PASSWORD=Peterhead2026!
KV_BINDING=glenugie_kv  # Your KV namespace
```

### 2. GitHub Deploy
```bash
git add .
git commit -m "Fix admin authentication"
git push origin main
```

### 3. Verify in Webflow Cloud
- Check that auto-deploy triggered
- Wait for deployment to complete
- Check deployment logs for errors

### 4. Test Production URL
- Visit: `https://www.glenugiekennels.co.uk/app/admin`
- Login with password
- Verify all features work

## Troubleshooting

### "Invalid Password" on Production
1. Check environment variable is set in Webflow Cloud
2. Verify it matches exactly: `Peterhead2026!`
3. Redeploy if you just set it

### "Unauthorized" After Login
1. Check browser console for errors
2. Clear browser cache and cookies
3. Try logging in again

### API Endpoints Return 403
1. Make sure you're logged in
2. Check that token is in localStorage
3. Try logout and login again

### Preview URL Still Shows Auth Error
This is **expected behavior**. Use production URL instead.

## Production URLs for Reference

### Public Pages
- Home: `https://www.glenugiekennels.co.uk/`
- Booking: `https://www.glenugiekennels.co.uk/app/booking`
- My Bookings: `https://www.glenugiekennels.co.uk/app/my-bookings`

### Admin Only
- Admin Dashboard: `https://www.glenugiekennels.co.uk/app/admin`
- API Endpoints: `https://www.glenugiekennels.co.uk/app/api/admin/*`

## Next Steps

1. ✅ **Deploy to production** (push to GitHub)
2. ✅ **Set ADMIN_PASSWORD** in Webflow Cloud environment variables
3. ✅ **Access admin** at `https://www.glenugiekennels.co.uk/app/admin`
4. ✅ **Login with** `Peterhead2026!`
5. ✅ **Start managing bookings!**

---

**Important**: Always use the production URL (`www.glenugiekennels.co.uk`) for admin access, not the preview URL (`*.webflow.io`).
