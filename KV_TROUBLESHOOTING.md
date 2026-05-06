# KV Storage Troubleshooting Guide

## Issue: Rules/Rates Not Loading

If you see "RULES NOT LOADING" or empty data in the admin dashboard, follow these steps:

---

## 🔍 **Step 1: Check KV Configuration**

Visit this debug endpoint to check if KV is properly configured:

```
https://www.glenugiekennels.co.uk/app/api/admin/debug-kv
```

**Expected Response:**
```json
{
  "success": true,
  "debug": {
    "hasKV": true,
    "kvType": "object"
  },
  "data": {
    "hasRules": true,
    "hasBookings": true,
    "hasRates": true
  }
}
```

**If `hasKV: false`:**
- KV namespace is not bound in Webflow Cloud
- Go to Webflow Cloud → Your App → Settings → Environment Variables
- Add KV binding: `BOOKINGS_KV` → Your KV namespace ID

---

## 🔧 **Step 2: Initialize KV Storage**

If KV is configured but data is missing (`hasRules: false`), initialize it:

### **Option A: Auto-Initialize (Recommended)**

1. Go to Admin Dashboard
2. Navigate to "Booking Rules" or "Rates" tab
3. The system will **automatically detect** missing data and initialize KV
4. Wait 2-3 seconds and refresh

### **Option B: Manual Initialize**

Call the initialization endpoint:

```bash
curl -X POST https://www.glenugiekennels.co.uk/app/api/admin/init-kv \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

Or visit in browser (while logged in as admin):
```
https://www.glenugiekennels.co.uk/app/api/admin/init-kv
```

---

## 📊 **Step 3: Verify Data**

After initialization, check the booking rules endpoint:

```
https://www.glenugiekennels.co.uk/app/api/admin/booking-rules
```

**Expected Response:**
```json
{
  "id": 1,
  "minAdvanceBookingDays": 1,
  "maxAdvanceBookingDays": 365,
  "minNights": 1,
  "maxNights": 90,
  "blockedDates": [],
  "blockedDateRanges": [
    {
      "start": "2026-12-24",
      "end": "2026-12-26",
      "reason": "Christmas Holiday"
    }
  ],
  ...
}
```

---

## 🚨 **Common Issues**

### **Issue: 401 Unauthorized**
- **Cause:** Not logged in or token expired
- **Fix:** Log in to admin dashboard first, then retry

### **Issue: 500 Internal Server Error**
- **Cause:** KV namespace not bound
- **Fix:** Check Webflow Cloud environment variables

### **Issue: Empty Response `{}`**
- **Cause:** KV initialized but data corrupted
- **Fix:** Re-initialize using Option B above

---

## 🔄 **Reset KV Storage**

If you need to completely reset the KV storage:

1. **Delete all data:**
   ```bash
   wrangler kv:key delete --binding=BOOKINGS_KV "bookings"
   wrangler kv:key delete --binding=BOOKINGS_KV "booking-rules"
   wrangler kv:key delete --binding=BOOKINGS_KV "rates"
   ```

2. **Re-initialize:**
   - Visit `/app/api/admin/init-kv` (POST)
   - Or let the admin dashboard auto-initialize

---

## 📝 **Default Values**

When KV is initialized, these defaults are created:

### **Booking Rules:**
- Min advance booking: 1 day
- Max advance booking: 365 days
- Min nights: 1
- Max nights: 90
- Christmas blocked: Dec 24-26, 2026

### **Rates:**
- Luxury Suites: £25/night (+£10 additional pet)
- Cattery: £15/night (+£7.50 additional pet)
- Ruff's Retreat: £20/night (+£10 additional pet)
- The Village: £20/night (+£10 additional pet)
- Deposit: £50
- Full payment due: 7 days before check-in

---

## 🆘 **Still Not Working?**

1. **Check Cloudflare Workers logs:**
   - Cloudflare Dashboard → Workers & Pages → Your App → Logs
   - Look for `[KVStorage]` or `[DB]` errors

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for network errors or failed API calls

3. **Verify KV namespace ID:**
   - In `wrangler.jsonc`: `"id": "4dd144b89325450b8949d8132a8ad02c"`
   - In Webflow Cloud: Must match exactly

---

## ✅ **Success Checklist**

- [ ] KV namespace created in Cloudflare
- [ ] KV bound in `wrangler.jsonc` as `BOOKINGS_KV`
- [ ] KV bound in Webflow Cloud environment variables
- [ ] `/api/admin/debug-kv` shows `hasKV: true`
- [ ] `/api/admin/init-kv` returns success
- [ ] Admin dashboard shows rules and rates
- [ ] Bookings can be created and saved

---

**Last Updated:** January 2025
