# Data Directory

This directory contains the booking system's data files.

## Files

- **bookings.json** - All booking records (auto-created)
- **booking-rules.json** - Booking rules and restrictions (auto-created)
- **rates.json** - Pricing information (auto-created)

## Important

These files are **gitignored** to prevent conflicts. They will be automatically created on first run with default values.

## Backup

To backup your data, copy these files to a safe location or temporarily commit them:

```bash
# Backup
cp -r data/ ../data-backup-$(date +%Y%m%d)/

# Or commit temporarily
git add -f data/*.json
git commit -m "Backup data"
```

## Restore

To restore from backup:

```bash
# From backup directory
cp ../data-backup-20250202/* data/

# Or from Git commit
git checkout <commit-hash> -- data/
```
