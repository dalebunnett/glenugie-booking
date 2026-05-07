# ✅ Deployment Checklist - Critical Storage Fix

## Pre-Deployment

- [ ] Read `STORAGE_BUG_SUMMARY.md` (understand the issue)
- [ ] Review `CRITICAL_STORAGE_FIX.md` (technical details)
- [ ] Verify you have Wrangler access
- [ ] Backup current deployment ID: `97513df`

---

## Deployment Steps

### Step 1: Build
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] Check `dist/` folder is created

### Step 2: Deploy
```bash
npx wrangler deploy
```
- [ ] Deployment succeeds
- [ ] Note new deployment ID: `________________`
- [ ] Deployment URL shown

### Step 3: Verify Build Version
```bash
curl https://your-app.workers.dev/BUILD_VERSION.txt
```
- [ ] Shows: `CRITICAL_STORAGE_FIX_20260507_210302`
- [ ] Not showing old version: `97513df`

---

## Post-Deployment Testing

### API Endpoints

**Test 1: Bookings API**
```bash
curl https://your-app.workers.dev/api/bookings
```
- [ ] Returns `[]` or array of bookings
- [ ] No error messages
- [ ] Response time < 2 seconds

**Test 2: Admin Auth**
```bash
curl https://your-app.workers.dev/api/admin/auth \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"info@glenugiekennels.co.uk","password":"Peterhead2026!"}'
```
- [ ] Returns token
- [ ] Message: "Login successful"
- [ ] No errors

### Web Interface

**Test 3: Admin Dashboard**
1. Navigate to: `/admin`
2. Login with credentials
3. Check:
   - [ ] Page loads without errors
   - [ ] Bookings calendar displays
   - [ ] Can navigate tabs
   - [ ] No console errors (F12)

**Test 4: Customer Portal**
1. Navigate to: `/my-bookings`
2. Check:
   - [ ] Login form displays
   - [ ] No console errors
   - [ ] Page loads correctly

**Test 5: Booking Form**
1. Navigate to: `/booking`
2. Check:
   - [ ] Form displays correctly
   - [ ] Availability calendar works
   - [ ] Can select dates
   - [ ] No console errors

### Logs

**Test 6: Check Deployment Logs**
```bash
npx wrangler tail
```
Look for:
- [ ] `[Storage] ✅ BOOKINGS_KV binding found`
- [ ] `[Storage] ✅ Storage instance created successfully`
- [ ] `[DB] ✅ Initialized with runtime`
- [ ] No error messages about storage

---

## Functional Testing

### Test 7: Create Test Booking
1. Go to `/booking`
2. Fill out form with test data
3. Submit booking
4. Check:
   - [ ] Booking submits successfully
   - [ ] Confirmation page shows
   - [ ] No errors in console
   - [ ] Booking appears in admin dashboard

### Test 8: View Bookings in Admin
1. Go to `/admin`
2. Login
3. Check:
   - [ ] All bookings display
   - [ ] Calendar shows bookings
   - [ ] Can click on bookings
   - [ ] Details load correctly

### Test 9: Customer Portal
1. Go to `/my-bookings`
2. Login with test customer email
3. Check:
   - [ ] Customer bookings display
   - [ ] Details are correct
   - [ ] No errors

---

## Performance Check

### Test 10: Response Times
- [ ] Homepage loads < 2 seconds
- [ ] Admin dashboard loads < 3 seconds
- [ ] API responses < 1 second
- [ ] No timeout errors

### Test 11: Error Handling
Try these intentionally:
- [ ] Invalid admin login → Shows error message
- [ ] Invalid API request → Returns proper error
- [ ] Missing data → Handles gracefully

---

## Monitoring (First Hour)

### 15 Minutes After Deploy
- [ ] Check logs for errors: `npx wrangler tail`
- [ ] Test all major endpoints
- [ ] Verify no user complaints

### 30 Minutes After Deploy
- [ ] Check Cloudflare analytics
- [ ] Verify request success rate > 99%
- [ ] No spike in errors

### 60 Minutes After Deploy
- [ ] Final log check
- [ ] Verify all features working
- [ ] Mark deployment as successful

---

## Rollback Criteria

Rollback if:
- [ ] Storage errors persist
- [ ] Bookings don't load
- [ ] Admin dashboard broken
- [ ] Customer portal broken
- [ ] API errors > 5%

**Rollback Command:**
```bash
npx wrangler rollback 97513df
```

---

## Success Criteria

All must be ✅ to mark deployment successful:

- [ ] Build version: `CRITICAL_STORAGE_FIX_20260507_210302`
- [ ] API endpoints return data
- [ ] Admin dashboard loads bookings
- [ ] Customer portal works
- [ ] No console errors
- [ ] Logs show successful initialization
- [ ] Can create new bookings
- [ ] Can view existing bookings
- [ ] No performance degradation
- [ ] No user-reported issues

---

## Documentation

After successful deployment:

- [ ] Update deployment log
- [ ] Note new deployment ID
- [ ] Archive old deployment info
- [ ] Update team on fix

---

## Sign-Off

**Deployed By**: ________________  
**Date**: 2026-05-07  
**Time**: ________________  
**New Deployment ID**: ________________  
**Old Deployment ID**: 97513df  

**Status**: 
- [ ] ✅ Successful
- [ ] ⚠️ Issues (document below)
- [ ] ❌ Rolled back

**Notes**:
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## Quick Reference

**Deploy**: `npm run build && npx wrangler deploy`  
**Logs**: `npx wrangler tail`  
**Rollback**: `npx wrangler rollback 97513df`  
**Version**: `curl https://your-app.workers.dev/BUILD_VERSION.txt`  

---

**Print this checklist and check off items as you complete them!** ✅
