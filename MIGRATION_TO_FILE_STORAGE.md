# Migration to File-Based Storage ✅

## What Changed?

We've switched from **Cloudflare KV** to **file-based storage** for a simpler, more reliable deployment on Webflow Cloud.

## Benefits

✅ **No KV binding required** - Works immediately  
✅ **Simpler deployment** - No Cloudflare configuration needed  
✅ **Version controlled** - Data in Git repository  
✅ **Easy backups** - Just commit your data  
✅ **Works everywhere** - Local dev, Webflow Cloud, anywhere  

## What You Need to Do

### 1. Commit and Push

```bash
git add .
git commit -m "Switch to file-based storage"
git push origin main
```

### 2. Deploy to Webflow Cloud

Your next deployment will automatically:
- Create the `data/` directory
- Initialize with default rules and rates
- Start with an empty bookings list

### 3. Remove KV Binding (Optional)

In Webflow Cloud app settings, you can remove the `BOOKINGS_KV` binding if it exists. It's no longer needed.

## Data Location

All data is now stored in:

```
data/
├── bookings.json       # All booking records
├── booking-rules.json  # Booking rules
└── rates.json          # Pricing
```

## Migrating Existing Data

If you have existing bookings in KV:

### Option 1: Export from Admin Dashboard

1. Go to `/app/admin`
2. Export bookings to CSV
3. Use the import feature to re-import them

### Option 2: Manual Export from Cloudflare

1. Go to Cloudflare Dashboard → KV
2. Export your namespace
3. Copy the JSON to `data/bookings.json`
4. Commit and push

## Testing

Test locally before deploying:

```bash
npm run dev
```

Visit:
- `http://localhost:4321/app/` - Home page
- `http://localhost:4321/app/booking` - Make a test booking
- `http://localhost:4321/app/admin` - Check admin dashboard

## Rollback (if needed)

If you need to rollback:

```bash
git revert HEAD
git push origin main
```

Then redeploy in Webflow Cloud.

## Support

Everything should work exactly the same as before, just without the KV dependency!

If you encounter any issues:
1. Check the browser console
2. Check Webflow Cloud logs
3. Verify the `data/` directory exists

---

**You're all set!** 🎉 The system is now simpler and more reliable.
