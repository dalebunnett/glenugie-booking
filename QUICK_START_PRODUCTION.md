# ⚡ Quick Start - Production Deployment

## 5-Minute Production Setup

### 1️⃣ Create KV Storage
```bash
wrangler kv:namespace create "GLENUGIE_KV"
```
Copy the ID from the output.

### 2️⃣ Update wrangler.jsonc
Replace `YOUR_KV_ID` with the ID from step 1:
```jsonc
{
  "kv_namespaces": [
    {
      "binding": "GLENUGIE_KV",
      "id": "YOUR_KV_ID"
    }
  ]
}
```

### 3️⃣ Deploy
```bash
npm run build
wrangler deploy
```

### 4️⃣ Add Environment Variables
Go to **Cloudflare Dashboard** → **Workers & Pages** → **Your Worker** → **Settings** → **Variables**

Add these:
- `ADMIN_USERNAME` = `admin`
- `ADMIN_PASSWORD` = `your-secure-password` (as Secret)
- `RESEND_API_KEY` = `re_your_key` (as Secret)
- `RESEND_FROM_EMAIL` = `bookings@glenugiekennels.co.uk`

Click **Save and Deploy**

### 5️⃣ Initialize & Import Data
1. Visit: `https://your-worker.workers.dev/admin`
2. Login with your credentials
3. Go to **Import** tab
4. Upload your `bookings.json` file

---

## ✅ Verify It's Working

Visit: `https://your-worker.workers.dev/api/debug/storage-check`

Should show:
```json
{
  "storage": "file",
  "kvAvailable": true,
  "bookingsCount": X,
  "ratesExist": true
}
```

---

## 🎯 Your URLs

- **Main Site:** `https://your-worker.workers.dev`
- **Booking Page:** `https://your-worker.workers.dev/booking`
- **Admin Dashboard:** `https://your-worker.workers.dev/admin`
- **Customer Portal:** `https://your-worker.workers.dev/my-bookings`

---

## 📦 What Gets Saved to KV

All of these persist permanently:
- ✅ All bookings
- ✅ Rates configuration
- ✅ Booking rules
- ✅ Customer sessions

---

## 🔄 Import Your Data

### Bookings Format
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
    "pets": [{"name": "Max", "breed": "Labrador", "age": 3}],
    "totalPrice": 150,
    "status": "confirmed"
  }
]
```

Upload via: **Admin** → **Import** tab

---

## 🆘 Quick Troubleshooting

**Can't login to admin?**
- Check environment variables in Cloudflare Dashboard
- Clear browser cookies
- Try incognito mode

**Bookings not saving?**
- Visit `/api/debug/storage-check`
- Check KV namespace is bound
- Verify KV ID in `wrangler.jsonc`

**Import fails?**
- Check JSON format
- Verify dates are YYYY-MM-DD
- Ensure kennel numbers are valid

---

## 📚 Full Documentation

- **Complete Guide:** `DEPLOY_TO_PRODUCTION.md`
- **Detailed Checklist:** `PRE_DEPLOYMENT_CHECKLIST.md`
- **Admin Guide:** `ADMIN_COMPLETE.md`

---

**That's it! You're live! 🚀**
