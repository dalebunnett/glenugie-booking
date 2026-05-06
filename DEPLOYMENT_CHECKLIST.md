# 📋 Deployment Checklist - File Storage Migration

## Pre-Deployment

- [x] File storage system created (`src/lib/file-storage.ts`)
- [x] Storage adapter updated (`src/lib/storage.ts`)
- [x] Data directory created (`data/`)
- [x] Default data files created
  - [x] `data/bookings.json`
  - [x] `data/booking-rules.json`
  - [x] `data/rates.json`
- [x] KV binding removed from `wrangler.jsonc`
- [x] `.gitignore` updated
- [x] Documentation created
- [x] Build tested successfully

## Deployment Steps

### 1. Commit Changes
```bash
git add .
git commit -m "Migrate to file-based storage - no KV required"
git push origin main
```

### 2. Verify GitHub Push
- [ ] Check GitHub repository shows latest commit
- [ ] Verify all files are present

### 3. Deploy in Webflow Cloud
- [ ] Webflow Cloud detects new commit
- [ ] Deployment starts automatically
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors

### 4. Post-Deployment Testing

#### Test Booking System
- [ ] Visit `/app/booking`
- [ ] Fill out booking form
- [ ] Submit booking
- [ ] Verify confirmation page shows
- [ ] Check booking appears in admin

#### Test Admin Dashboard
- [ ] Visit `/app/admin`
- [ ] View bookings list
- [ ] Check booking details
- [ ] Update rates
- [ ] Modify booking rules
- [ ] Verify changes persist

#### Test Customer Portal
- [ ] Visit `/app/my-bookings`
- [ ] Enter booking reference
- [ ] View booking details
- [ ] Test cancellation (if applicable)

#### Test Availability Calendar
- [ ] Visit `/app/booking`
- [ ] Check calendar loads
- [ ] Verify blocked dates show
- [ ] Test date selection

### 5. Data Verification
- [ ] Confirm `data/` directory exists on server
- [ ] Verify `bookings.json` contains test booking
- [ ] Check `booking-rules.json` has correct rules
- [ ] Verify `rates.json` has correct pricing

### 6. Optional Cleanup
- [ ] Remove `BOOKINGS_KV` binding from Webflow Cloud (if exists)
- [ ] Update any documentation referencing KV
- [ ] Archive old KV data (if needed)

## Rollback Plan (If Needed)

If something goes wrong:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <previous-commit-hash>
git push --force origin main
```

Then redeploy in Webflow Cloud.

## Success Criteria

✅ **All tests pass**
- Bookings can be created
- Admin dashboard works
- Customer portal functions
- Data persists correctly

✅ **No errors in logs**
- Check Webflow Cloud deployment logs
- Check browser console
- Verify no 500 errors

✅ **Performance is good**
- Pages load quickly
- No timeout errors
- Smooth user experience

## Post-Deployment

### Backup Strategy
- [ ] Set up regular data backups
- [ ] Document backup process
- [ ] Test restore procedure

### Monitoring
- [ ] Monitor for errors in first 24 hours
- [ ] Check booking submissions
- [ ] Verify email notifications work

### Documentation
- [ ] Update team on new system
- [ ] Share backup procedures
- [ ] Document any issues encountered

## Notes

**Date Deployed:** _________________

**Deployed By:** _________________

**Issues Encountered:** 
_________________________________________________
_________________________________________________
_________________________________________________

**Resolution:**
_________________________________________________
_________________________________________________
_________________________________________________

## Support Resources

- `FILE_STORAGE_GUIDE.md` - Complete guide
- `STORAGE_COMPARISON.md` - Before/after comparison
- `DEPLOY_FILE_STORAGE.md` - Quick deploy guide
- `README_FILE_STORAGE.md` - Overview

---

**Ready to deploy!** 🚀

Follow this checklist step-by-step for a smooth migration to file-based storage.
