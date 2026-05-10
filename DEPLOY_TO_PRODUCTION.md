# 🚀 Deploy Glenugie Kennels to Production

## What You're Getting
✅ Full booking system with persistent storage  
✅ All bookings, rates, and rules saved to Cloudflare KV  
✅ Admin dashboard with import/export  
✅ Customer portal  
✅ Email notifications  
✅ Real-time availability calendar  

---

## Step-by-Step Deployment (15 minutes)

### Step 1: Create Production KV Storage (2 min)

```bash
# Create the KV namespace for production
wrangler kv:namespace create "GLENUGIE_KV"
```

**You'll see output like:**
```
{ binding = "GLENUGIE_KV", id = "abc123def456..." }
```

**Copy that ID!** You need it for the next step.

---

### Step 2: Update wrangler.jsonc (1 min)

Open `wrangler.jsonc` and update the KV namespace ID:

```jsonc
{
  "name": "glenugie-kennels",
  "compatibility_date": "2024-01-01",
  "kv_namespaces": [
    {
      "binding": "GLENUGIE_KV",
      "id": "PASTE_YOUR_KV_ID_HERE"  // ← Put the ID from Step 1 here
    }
  ]
}
```

---

### Step 3: Build and Deploy (2 min)

```bash
# Build the application
npm run build

# Deploy to Cloudflare Workers
wrangler deploy
```

**You'll get a URL like:** `https://glenugie-kennels.your-subdomain.workers.dev`

---

### Step 4: Add Environment Variables in Cloudflare (5 min)

1. Go to **Cloudflare Dashboard** → **Workers & Pages**
2. Click on your worker (**glenugie-kennels**)
3. Go to **Settings** → **Variables and Secrets**
4. Click **Add variable** and add these:

**Required Variables:**

| Variable Name | Type | Value |
|--------------|------|-------|
| `ADMIN_USERNAME` | Plain text | `admin` (or your choice) |
| `ADMIN_PASSWORD` | Secret | Your secure password |
| `RESEND_API_KEY` | Secret | Your Resend API key |
| `RESEND_FROM_EMAIL` | Plain text | `bookings@glenugiekennels.co.uk` |

**Optional (if using Stripe):**

| Variable Name | Type | Value |
|--------------|------|-------|
| `STRIPE_SECRET_KEY` | Secret | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Plain text | `pk_live_...` |

5. Click **Save and Deploy**

---

### Step 5: Initialize Production Data (5 min)

Now you have two options:

#### Option A: Start Fresh and Import Later

1. Visit: `https://your-worker.workers.dev/init-staging-data`
2. This creates the initial data structure
3. Then go to admin to import your data

#### Option B: Import Existing Data Immediately

1. Visit: `https://your-worker.workers.dev/admin`
2. Login with your credentials
3. Go to **Import** tab
4. Upload your bookings JSON file

---

## Verify Everything Works

### ✅ Test 1: Admin Dashboard
1. Visit: `https://your-worker.workers.dev/admin`
2. Login with your credentials
3. You should see the dashboard with all tabs

### ✅ Test 2: Storage Check
Visit: `https://your-worker.workers.dev/api/debug/storage-check`

**Should return:**
```json
{
  "storage": "file",
  "bookingsCount": 0,
  "ratesExist": true,
  "rulesExist": true,
  "kvAvailable": true
}
```

### ✅ Test 3: Create a Test Booking
1. Visit: `https://your-worker.workers.dev/booking`
2. Select dates and kennel type
3. Complete the booking
4. Check it appears in admin dashboard

### ✅ Test 4: Import Bookings
1. Go to admin → Import tab
2. Upload your bookings JSON
3. Verify they appear in the bookings list

---

## Your Data Files Format

### Bookings JSON Format
```json
[
  {
    "id": "booking-001",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "01779123456",
    "checkIn": "2026-06-01",
    "checkOut": "2026-06-07",
    "kennelType": "luxury-suite",
    "kennelNumber": 1,
    "numberOfPets": 1,
    "pets": [
      {
        "name": "Max",
        "breed": "Labrador",
        "age": 3,
        "specialNeeds": ""
      }
    ],
    "totalPrice": 150,
    "status": "confirmed",
    "createdAt": "2026-05-01T10:00:00Z"
  }
]
```

### Rates JSON Format
```json
{
  "luxury-suite": {
    "basePrice": 25,
    "additionalPetPrice": 10
  },
  "standard-kennel": {
    "basePrice": 20,
    "additionalPetPrice": 7.50
  },
  "cattery-suite": {
    "basePrice": 15,
    "additionalPetPrice": 7.50
  }
}
```

### Booking Rules JSON Format
```json
{
  "minimumStay": 1,
  "maximumStay": 30,
  "checkInTime": "14:00",
  "checkOutTime": "11:00",
  "blackoutDates": [],
  "advanceBookingDays": 365,
  "cancellationPolicy": "24 hours notice required"
}
```

---

## How Storage Works in Production

### Where Data is Saved
- **Primary:** Cloudflare KV (persistent, global)
- **Backup:** File system (temporary, per-request)

### What Gets Saved
1. **Bookings** → `GLENUGIE_KV` key: `bookings`
2. **Rates** → `GLENUGIE_KV` key: `rates`
3. **Booking Rules** → `GLENUGIE_KV` key: `booking-rules`
4. **Customer Sessions** → `GLENUGIE_KV` key: `customer-session-{email}`

### Data Persistence
- ✅ Survives deployments
- ✅ Available globally
- ✅ Backed up automatically by Cloudflare
- ✅ Can be exported anytime via admin

---

## Import Your Existing Data

### Method 1: Via Admin Dashboard (Recommended)

1. **Prepare your bookings file** (`bookings.json`)
2. **Visit admin** → Import tab
3. **Upload the file**
4. **Verify** bookings appear in the list

### Method 2: Via API (Advanced)

```bash
# Import bookings
curl -X POST https://your-worker.workers.dev/api/admin/bookings/import \
  -H "Content-Type: application/json" \
  -H "Cookie: admin-token=YOUR_TOKEN" \
  -d @bookings.json
```

### Method 3: Direct KV Upload (Advanced)

```bash
# Upload directly to KV
wrangler kv:key put "bookings" --path=bookings.json --namespace-id=YOUR_KV_ID
wrangler kv:key put "rates" --path=rates.json --namespace-id=YOUR_KV_ID
wrangler kv:key put "booking-rules" --path=booking-rules.json --namespace-id=YOUR_KV_ID
```

---

## Configure Your System

### 1. Set Rates
1. Admin → **Rates** tab
2. Set prices for:
   - Luxury Suites: £25/night
   - Standard Kennels: £20/night
   - Cattery Suites: £15/night
   - Additional pets: £7.50-£10/night
3. Click **Save**

### 2. Configure Booking Rules
1. Admin → **Rules** tab
2. Set:
   - Minimum stay: 1 night
   - Maximum stay: 30 nights
   - Check-in time: 14:00
   - Check-out time: 11:00
   - Advance booking: 365 days
3. Click **Save**

### 3. Import Existing Bookings
1. Admin → **Import** tab
2. Upload your bookings JSON
3. Review imported bookings
4. Verify dates and kennel assignments

---

## Custom Domain Setup (Optional)

To use `glenugiekennels.co.uk` instead of `workers.dev`:

1. **Cloudflare Dashboard** → **Workers & Pages**
2. Click your worker
3. **Triggers** → **Custom Domains**
4. Click **Add Custom Domain**
5. Enter: `glenugiekennels.co.uk` or `booking.glenugiekennels.co.uk`
6. Cloudflare automatically configures DNS

---

## Backup Your Data

### Manual Backup (Anytime)

```bash
# Backup all data from KV
wrangler kv:key get "bookings" --namespace-id=YOUR_KV_ID > backup-bookings.json
wrangler kv:key get "rates" --namespace-id=YOUR_KV_ID > backup-rates.json
wrangler kv:key get "booking-rules" --namespace-id=YOUR_KV_ID > backup-rules.json
```

### Via Admin Dashboard

1. Admin → **Bookings** tab
2. Click **Export** (if available)
3. Save the JSON file

---

## Troubleshooting

### Problem: "Storage not available"
**Solution:**
1. Check KV namespace is bound in `wrangler.jsonc`
2. Verify environment variables are set in Cloudflare Dashboard
3. Redeploy: `wrangler deploy`

### Problem: "Bookings not saving"
**Solution:**
1. Visit `/api/debug/storage-check`
2. Check browser console for errors
3. Verify KV namespace ID is correct
4. Check Cloudflare logs: `wrangler tail`

### Problem: "Import fails"
**Solution:**
1. Verify JSON format is correct
2. Check dates are in YYYY-MM-DD format
3. Ensure kennel numbers are valid (1-10 for luxury, 1-13 for cattery)
4. Check file size (max 25MB)

### Problem: "Admin login not working"
**Solution:**
1. Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` in Cloudflare Dashboard
2. Clear browser cookies
3. Try incognito mode
4. Check environment variables are saved and deployed

---

## Production Checklist

Before going live, verify:

- [ ] KV namespace created and bound
- [ ] Environment variables set in Cloudflare
- [ ] Application deployed successfully
- [ ] Admin login works
- [ ] Rates configured
- [ ] Booking rules set
- [ ] Test booking created successfully
- [ ] Bookings save to KV storage
- [ ] Email notifications working
- [ ] Customer portal accessible
- [ ] Import functionality tested
- [ ] Calendar shows correct availability

---

## Quick Commands Reference

```bash
# Create KV namespace
wrangler kv:namespace create "GLENUGIE_KV"

# Deploy to production
npm run build && wrangler deploy

# View logs
wrangler tail

# Backup data
wrangler kv:key get "bookings" --namespace-id=YOUR_KV_ID > backup.json

# List all KV keys
wrangler kv:key list --namespace-id=YOUR_KV_ID

# Check deployment
curl https://your-worker.workers.dev/api/debug/storage-check
```

---

## What Happens After Deployment

1. **Your app is live** at `https://your-worker.workers.dev`
2. **All data persists** in Cloudflare KV
3. **Bookings are saved** permanently
4. **Emails are sent** for confirmations
5. **Admin can manage** everything via dashboard
6. **Customers can access** their bookings via portal

---

## Next Steps After Going Live

1. **Test thoroughly** - Create test bookings, verify emails
2. **Import your data** - Upload existing bookings, rates, rules
3. **Set up monitoring** - Watch logs for errors
4. **Configure domain** - Add custom domain if desired
5. **Train staff** - Show them the admin dashboard
6. **Backup regularly** - Export data weekly

---

## Support

If you need help:
1. Check logs: `wrangler tail`
2. Test storage: `/api/debug/storage-check`
3. Review environment variables in Cloudflare Dashboard
4. Check the detailed guides in the repo

---

**Ready to deploy? Run these commands:**

```bash
# 1. Create KV
wrangler kv:namespace create "GLENUGIE_KV"

# 2. Update wrangler.jsonc with the KV ID

# 3. Deploy
npm run build && wrangler deploy

# 4. Add environment variables in Cloudflare Dashboard

# 5. Initialize data
# Visit: https://your-worker.workers.dev/init-staging-data

# 6. Access admin
# Visit: https://your-worker.workers.dev/admin
```

**You're ready to go live! 🎉**
