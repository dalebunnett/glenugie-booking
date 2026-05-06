# 🚀 Deploy with File Storage - Quick Start

## What Changed?

**No more KV binding needed!** The booking system now uses simple file-based storage.

## Deploy in 3 Steps

### 1. Commit & Push

```bash
git add .
git commit -m "Switch to file-based storage - no KV needed"
git push origin main
```

### 2. Deploy in Webflow Cloud

Your GitHub integration will automatically deploy the changes.

**That's it!** No configuration needed. 🎉

### 3. Test Your Site

Visit your deployed site:
- Make a test booking
- Check the admin dashboard
- Verify everything works

## What Happens on First Deploy?

The system automatically:
1. Creates the `data/` directory
2. Initializes with default booking rules
3. Sets up default pricing
4. Creates an empty bookings list

## Optional: Remove Old KV Binding

In Webflow Cloud app settings:
1. Go to your app settings
2. Find "Bindings" or "Environment"
3. Remove `BOOKINGS_KV` if it exists
4. Save changes

**Note:** This is optional - the app will work fine even if the binding exists.

## Verify Everything Works

✅ **Booking System**
- Go to `/app/booking`
- Make a test booking
- Should see confirmation

✅ **Admin Dashboard**
- Go to `/app/admin`
- View bookings list
- Update rates/rules

✅ **Customer Portal**
- Go to `/app/my-bookings`
- Enter booking reference
- View booking details

## Data Location

All data is stored in:
```
data/
├── bookings.json       # All bookings
├── booking-rules.json  # Rules & restrictions
└── rates.json          # Pricing
```

## Backup Your Data

### Option 1: Commit Data Files
```bash
git add -f data/*.json
git commit -m "Backup bookings $(date +%Y-%m-%d)"
git push
```

### Option 2: Download from Admin
1. Go to `/app/admin`
2. Export bookings to CSV
3. Save the file

## Restore Data

### From Git Commit
```bash
git checkout <commit-hash> -- data/
git push
```

### From CSV Export
1. Go to `/app/admin`
2. Use the import feature
3. Upload your CSV file

## Troubleshooting

### "No bookings showing"
- Check that `data/bookings.json` exists
- Verify file permissions
- Check deployment logs

### "Rules not updating"
- Clear browser cache
- Check `data/booking-rules.json`
- Verify changes were deployed

### "Rates not changing"
- Check `data/rates.json`
- Ensure deployment completed
- Refresh the page

## Need Help?

Check these files:
- `FILE_STORAGE_GUIDE.md` - Complete guide
- `STORAGE_MIGRATION_COMPLETE.md` - What changed
- `data/README.md` - Data directory info

---

**That's it!** Much simpler than KV. 🎉

Your booking system is now:
- ✅ Easier to deploy
- ✅ Simpler to maintain
- ✅ Easier to backup
- ✅ Version controlled
- ✅ Works everywhere
