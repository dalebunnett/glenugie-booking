# 🚀 Production Deployment Guide

## Overview
This guide will help you deploy Glenugie Kennels to production with full functionality including:
- ✅ File-based storage (bookings, rates, rules)
- ✅ Booking imports
- ✅ Customer portal
- ✅ Admin dashboard
- ✅ Email notifications
- ✅ Real-time availability

---

## Pre-Deployment Checklist

### 1. Environment Variables Required

Create a `.env` file with these production values:

```env
# Admin Authentication
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# Email Configuration (Resend)
RESEND_API_KEY=re_your_production_key
RESEND_FROM_EMAIL=bookings@glenugiekennels.co.uk

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional: Webflow CMS (if using)
WEBFLOW_CMS_SITE_API_TOKEN=your_token
WEBFLOW_API_HOST=https://api.webflow.com
```

### 2. Cloudflare Workers KV Setup

You need to create KV namespaces in Cloudflare:

```bash
# Create production KV namespace
wrangler kv:namespace create "GLENUGIE_KV"

# This will output something like:
# { binding = "GLENUGIE_KV", id = "abc123..." }
```

### 3. Update `wrangler.jsonc`

Update your `wrangler.jsonc` with the production KV namespace ID:

```jsonc
{
  "name": "glenugie-kennels",
  "compatibility_date": "2024-01-01",
  "kv_namespaces": [
    {
      "binding": "GLENUGIE_KV",
      "id": "YOUR_PRODUCTION_KV_ID_HERE"
    }
  ]
}
```

---

## Deployment Steps

### Step 1: Initialize Production Data

Before deploying, you need to initialize the production storage with your data.

**Option A: Start Fresh**
1. Deploy the app first
2. Visit `/init-staging-data` to create initial data structure
3. Use the admin dashboard to:
   - Configure rates at `/admin` → Rates tab
   - Set booking rules at `/admin` → Rules tab
   - Import bookings at `/admin` → Import tab

**Option B: Import Existing Data**
1. Prepare your data files in the `data/` directory:
   - `data/rates.json` - Your pricing structure
   - `data/booking-rules.json` - Your booking rules
   - `data/bookings.json` - Existing bookings

2. Deploy the app
3. Visit `/admin` and use the Import feature

### Step 2: Deploy to Cloudflare Workers

```bash
# Build and deploy
npm run build
wrangler deploy

# Or use the deploy script
./deploy.sh
```

### Step 3: Configure Cloudflare Dashboard

1. **Go to Cloudflare Dashboard** → Workers & Pages
2. **Select your worker** (glenugie-kennels)
3. **Settings** → **Variables and Secrets**
4. **Add all environment variables** from your `.env` file

**Important:** Add these as **encrypted secrets**:
- `ADMIN_PASSWORD`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Add these as **plain text variables**:
- `ADMIN_USERNAME`
- `RESEND_FROM_EMAIL`
- `STRIPE_PUBLISHABLE_KEY`

### Step 4: Verify KV Namespace Binding

In Cloudflare Dashboard:
1. **Workers & Pages** → Your worker
2. **Settings** → **Bindings**
3. Verify `GLENUGIE_KV` is bound to your production namespace

---

## Post-Deployment Verification

### 1. Test Storage System

Visit these endpoints to verify storage:

```bash
# Check storage health
curl https://your-domain.com/api/debug/storage-check

# Should return:
# {
#   "storage": "file",
#   "bookingsCount": X,
#   "ratesExist": true,
#   "rulesExist": true
# }
```

### 2. Test Admin Access

1. Visit `https://your-domain.com/admin`
2. Login with your credentials
3. Verify all tabs work:
   - ✅ Bookings list loads
   - ✅ Calendar displays
   - ✅ Rates can be edited
   - ✅ Rules can be configured
   - ✅ Import works

### 3. Test Booking Flow

1. Visit `https://your-domain.com/booking`
2. Select dates and kennel type
3. Complete a test booking
4. Verify:
   - ✅ Booking appears in admin
   - ✅ Email confirmation sent
   - ✅ Availability updates

### 4. Test Customer Portal

1. Visit `https://your-domain.com/my-bookings`
2. Enter email from test booking
3. Verify:
   - ✅ Booking displays
   - ✅ Can edit booking
   - ✅ Can cancel booking

---

## Data Migration (If Needed)

### Migrate from Staging to Production

If you have staging data to migrate:

```bash
# 1. Export from staging
# Visit staging admin and export bookings

# 2. Save to data/bookings.json

# 3. Deploy to production

# 4. Import via admin dashboard
```

### Booking Import Format

Your `bookings.json` should follow this structure:

```json
[
  {
    "id": "unique-id",
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

---

## Monitoring & Maintenance

### 1. Monitor Logs

```bash
# View real-time logs
wrangler tail

# View logs in Cloudflare Dashboard
# Workers & Pages → Your worker → Logs
```

### 2. Backup Data

**Important:** Regularly backup your KV data:

```bash
# List all KV keys
wrangler kv:key list --namespace-id=YOUR_KV_ID

# Get specific data
wrangler kv:key get "bookings" --namespace-id=YOUR_KV_ID > backup-bookings.json
wrangler kv:key get "rates" --namespace-id=YOUR_KV_ID > backup-rates.json
wrangler kv:key get "booking-rules" --namespace-id=YOUR_KV_ID > backup-rules.json
```

### 3. Scheduled Backups

Set up a cron job to backup data weekly:

```bash
# Add to crontab
0 2 * * 0 /path/to/backup-script.sh
```

---

## Troubleshooting

### Storage Not Working

**Symptom:** Bookings not saving, rates not loading

**Solution:**
1. Check KV namespace is bound correctly
2. Verify environment variables are set
3. Check logs: `wrangler tail`
4. Visit `/api/debug/storage-check`

### Bookings Not Importing

**Symptom:** Import fails or data doesn't appear

**Solution:**
1. Verify JSON format is correct
2. Check date formats (YYYY-MM-DD)
3. Ensure kennel numbers are valid (1-10 for luxury, 1-13 for cattery)
4. Check browser console for errors

### Email Not Sending

**Symptom:** No confirmation emails

**Solution:**
1. Verify `RESEND_API_KEY` is set correctly
2. Check `RESEND_FROM_EMAIL` is verified in Resend
3. Test email endpoint: `/api/emails/test`
4. Check Resend dashboard for delivery status

### Admin Login Not Working

**Symptom:** Can't login to admin

**Solution:**
1. Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
2. Clear browser cookies
3. Check environment variables in Cloudflare Dashboard
4. Try incognito/private browsing

---

## Production URLs

After deployment, your app will be available at:

- **Main Site:** `https://your-worker.workers.dev` or custom domain
- **Booking:** `/booking`
- **Customer Portal:** `/my-bookings`
- **Admin Dashboard:** `/admin`

---

## Custom Domain Setup

To use your own domain (e.g., glenugiekennels.co.uk):

1. **Cloudflare Dashboard** → **Workers & Pages**
2. Select your worker
3. **Triggers** → **Custom Domains**
4. **Add Custom Domain**
5. Enter your domain
6. Cloudflare will automatically configure DNS

---

## Security Checklist

- ✅ Admin password is strong and unique
- ✅ All secrets are encrypted in Cloudflare
- ✅ HTTPS is enforced (automatic with Cloudflare)
- ✅ API endpoints are protected
- ✅ Customer data is validated
- ✅ Email addresses are verified

---

## Support & Next Steps

### Immediate Actions:
1. ✅ Set up environment variables
2. ✅ Create KV namespace
3. ✅ Deploy to production
4. ✅ Initialize data
5. ✅ Test all features

### Ongoing:
- Monitor bookings daily
- Backup data weekly
- Update rates seasonally
- Review booking rules monthly

---

## Quick Deploy Commands

```bash
# 1. Create KV namespace
wrangler kv:namespace create "GLENUGIE_KV"

# 2. Update wrangler.jsonc with KV ID

# 3. Build and deploy
npm run build
wrangler deploy

# 4. Set environment variables in Cloudflare Dashboard

# 5. Initialize data
# Visit: https://your-domain.com/init-staging-data

# 6. Configure admin
# Visit: https://your-domain.com/admin
```

---

## Success Criteria

Your deployment is successful when:

- ✅ Admin dashboard loads and shows data
- ✅ Bookings can be created and saved
- ✅ Rates display correctly
- ✅ Rules are enforced
- ✅ Emails are sent
- ✅ Customer portal works
- ✅ Calendar shows availability
- ✅ Import/export functions work

---

## Need Help?

If you encounter issues:

1. Check the logs: `wrangler tail`
2. Verify environment variables
3. Test storage: `/api/debug/storage-check`
4. Review this guide
5. Check individual feature documentation

---

**Ready to go live? Follow the steps above and your Glenugie Kennels booking system will be fully operational! 🎉**
