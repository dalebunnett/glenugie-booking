# File-Based Storage Guide

## Overview

The booking system now uses **file-based storage** instead of Cloudflare KV. This is much simpler for Webflow Cloud deployment and doesn't require any special bindings or configuration.

## How It Works

All data is stored in JSON files in the `data/` directory:

- **`data/bookings.json`** - All booking records
- **`data/booking-rules.json`** - Booking rules and restrictions
- **`data/rates.json`** - Pricing information

## Benefits

✅ **No KV binding required** - Works out of the box  
✅ **Version controlled** - Data is in your Git repository  
✅ **Easy to backup** - Just commit and push  
✅ **Simple to edit** - Can manually edit JSON files if needed  
✅ **Fast** - In-memory caching for performance  

## Data Directory Structure

```
data/
├── .gitkeep          # Ensures directory exists in Git
├── bookings.json     # Booking records (gitignored)
├── booking-rules.json # Rules configuration (gitignored)
└── rates.json        # Pricing data (gitignored)
```

## Important Notes

### Data Persistence

The `data/*.json` files are **gitignored** to prevent conflicts when multiple bookings are made. However, the directory structure is preserved with `.gitkeep`.

### Initial Setup

On first deployment, the system will automatically create default files if they don't exist:

1. Empty bookings array
2. Default booking rules (Christmas blocked, peak seasons defined)
3. Default rates (£25 luxury suites, £15 cattery, etc.)

### Backups

To backup your data:

```bash
# Copy data files to a backup location
cp -r data/ data-backup-$(date +%Y%m%d)/

# Or commit them temporarily
git add data/*.json
git commit -m "Backup: $(date)"
```

### Restoring Data

To restore from backup:

```bash
# Copy backup files back
cp data-backup-20250202/* data/

# Or pull from a specific commit
git checkout <commit-hash> -- data/
```

## Migration from KV

If you had data in KV, you can export it:

1. Go to Cloudflare Dashboard → Workers & Pages → KV
2. Export your namespace data
3. Copy the JSON to the appropriate files in `data/`

## Manual Data Editing

You can manually edit the JSON files if needed:

### Example: Add a blocked date

Edit `data/booking-rules.json`:

```json
{
  "blockedDates": ["2026-05-01", "2026-05-02"],
  ...
}
```

### Example: Update pricing

Edit `data/rates.json`:

```json
{
  "luxurySuites": {
    "basePrice": 30,
    "additionalPet": 12
  },
  ...
}
```

## Performance

The system uses **in-memory caching** for fast reads:

- First request: Reads from file
- Subsequent requests: Returns cached data
- Writes: Updates both cache and file

## Deployment

### Webflow Cloud

1. Push your code to GitHub
2. Webflow Cloud will automatically deploy
3. Data files are created on first run
4. No additional configuration needed! 🎉

### Local Development

```bash
npm run dev
```

Data files are created automatically in the `data/` directory.

## Troubleshooting

### "Cannot find module 'fs'"

This error occurs in browser context. The file storage system automatically handles this by:
- Using file system in server-side code (API routes)
- Skipping file operations in browser code

### Data not persisting

Check that:
1. The `data/` directory exists
2. Files have write permissions
3. You're not in a read-only environment

### Bookings disappearing

If bookings disappear after deployment:
1. Check if `data/bookings.json` exists
2. Verify the file isn't being overwritten by Git
3. Consider committing a backup before major deployments

## Best Practices

1. **Regular backups**: Commit data files periodically
2. **Test locally**: Always test changes locally first
3. **Monitor logs**: Check console for storage errors
4. **Gradual updates**: Update rules/rates during low-traffic periods

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check server logs in Webflow Cloud
3. Verify file permissions
4. Ensure `data/` directory exists

---

**That's it!** No KV bindings, no complex setup. Just simple file-based storage that works everywhere. 🚀
