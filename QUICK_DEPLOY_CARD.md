# 🎯 Quick Deploy Card - Availability Calendar Fix

## The Problem
Availability calendars not showing bookings (all dates show green).

## The Cause
Same storage bug as customer portal - production running old code.

## The Fix
Already in code, just needs deployment.

---

## 🚀 Deploy Now (Pick One)

### ⚡ Option 1: Local (2 min)
```bash
cd /path/to/glenugie-kennels
git pull origin main
npm run build && npx wrangler deploy
```

### 🌐 Option 2: Webflow (5 min)
Dashboard → Apps → Deploy

---

## ✅ Test After Deploy

1. **API Test**: Visit `/api/debug/availability-check?slug=luxury-suite`
   - Should show bookings count

2. **Calendar Test**: Visit `/kennels/sniffany`
   - Booked dates should be RED
   - Available dates should be GREEN

3. **Debug Page**: Visit `/debug-customer-bookings`
   - Select kennel from dropdown
   - Click "Check Availability"
   - Should show booking data

---

## 📊 What Gets Fixed

| Feature | Before | After |
|---------|--------|-------|
| Calendar Colors | All green | Red/yellow/green |
| Booked Dates | Not shown | Shown correctly |
| Date Details | No info | Shows booking info |
| Error Messages | Silent fail | Shows errors |

---

## 🔍 Troubleshooting

**Still all green?**
- Clear browser cache
- Check `/api/debug/availability-check`

**API returns empty?**
- Verify deployment completed
- Check slug matches booking data

**Console errors?**
- Verify storage fix deployed
- Check KV namespace binding

---

## 📚 Full Docs

- `DEPLOY_AVAILABILITY_FIX.md` - Quick guide
- `AVAILABILITY_CALENDAR_FIX.md` - Detailed guide
- `COMPLETE_DEPLOYMENT_STATUS.md` - Full status

---

**Status**: ✅ Ready to Deploy
**Time**: 2-5 minutes
**Risk**: Low
**Priority**: High
