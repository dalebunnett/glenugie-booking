# 🚀 Deploy Debug Version - URGENT

## What Changed
Added extensive console logging to help diagnose why calendar dates aren't being blocked even though 498 bookings exist in the system.

## Deploy Now

### Via Webflow (Recommended)
1. Go to your Webflow Apps dashboard
2. Find your Glenugie Kennels app
3. Click **Deploy** or **Publish**
4. Wait for deployment to complete (usually 2-3 minutes)

## After Deployment - Testing

### Step 1: Open Booking Page
1. Go to: `https://glenugiekennels.co.uk/booking`
2. Press **F12** to open DevTools
3. Click on the **Console** tab

### Step 2: Make a Test Booking
1. Select "Luxury Suite"
2. Select "Sniffany Suite" (or any suite)
3. **Watch the console output**

### Step 3: What You Should See

The console will show detailed debug information:

```
=== FETCH AVAILABILITY DEBUG ===
accommodationType: luxury-suite
specificSuite: sniffany-suite
step: 2
Fetching availability for slug: sniffany-suite
Full URL: /api/availability/sniffany-suite
Response status: 200
Number of bookings returned: X
```

### Step 4: Report Back

Please copy and paste the **entire console output** and send it to me. This will tell us:
- ✅ Is the API being called?
- ✅ What slug is being used?
- ✅ How many bookings are returned?
- ✅ Are dates being blocked?
- ✅ Why dates might not be showing as disabled

## What This Will Tell Us

With 498 bookings in the system, we should see:
- **Many bookings returned** for popular suites
- **Dates being blocked** in the console
- **Calendar showing disabled dates**

If we don't see this, the console output will tell us exactly where the problem is:
- Wrong slug format?
- Date parsing issue?
- State update problem?
- API filtering issue?

## Timeline
⏰ **Deploy immediately** - This is critical for diagnosing the issue
🔍 **Test within 5 minutes** of deployment
📊 **Report console output** so we can fix the root cause

---

**Current Status:** ✅ Code built and pushed to GitHub
**Next Step:** 🚀 Deploy via Webflow and test
