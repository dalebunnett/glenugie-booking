# 🧪 Test Plan: Booking Date Blocking

## Quick Test (2 minutes)

### Test 1: Single Suite Blocking
1. Go to `/booking`
2. Select "Dog" → "Luxury Suite" → "Sniffany"
3. Click "Continue to Dates"
4. **EXPECTED**: Any dates with existing bookings should be:
   - Red/pink background
   - Line-through text
   - Not clickable
   - Cursor shows "not-allowed"

### Test 2: Console Verification
1. Open DevTools (F12) → Console tab
2. Perform Test 1 above
3. **EXPECTED**: See messages like:
   ```
   🔴 BOOKED DATES STATE CHANGED 🔴
   Number of booked dates: 5
   Booked dates: 2025-02-01, 2025-02-02, 2025-02-03...
   ✅ Date BLOCKED in calendar: 2025-02-01
   ```

### Test 3: Multi-Kennel Partial Booking
1. Go to `/booking`
2. Select "Dog" → "Ruff's Retreat"
3. Click "Continue to Dates"
4. **EXPECTED**: 
   - Dates with partial bookings should be AVAILABLE (not blocked)
   - Only dates with ALL 12 kennels booked should be blocked

### Test 4: Try to Select Blocked Date
1. Perform Test 1
2. Try to click on a red/blocked date
3. **EXPECTED**: 
   - Date should NOT be selectable
   - No change to selected date
   - Cursor shows "not-allowed"

## Detailed Test Cases

### Case 1: Luxury Dog Suite (Single Occupancy)
**Setup**: Create a test booking for "Sniffany" from Feb 1-5, 2025

**Test**:
```
1. Select: Dog → Luxury Suite → Sniffany
2. Go to dates
3. Check Feb 1, 2, 3, 4 (should be blocked)
4. Check Feb 5 (should be available - checkout date)
5. Try to select Feb 2 (should fail)
6. Select Feb 6 (should succeed)
```

**Expected Result**:
- ✅ Feb 1-4 blocked (red, line-through)
- ✅ Feb 5+ available (normal)
- ✅ Cannot select Feb 1-4
- ✅ Can select Feb 6+

### Case 2: Cattery Suite (Single Occupancy)
**Setup**: Create a test booking for "Clawrence House" from Feb 10-15, 2025

**Test**:
```
1. Select: Cat → Clawrence House
2. Go to dates
3. Check Feb 10-14 (should be blocked)
4. Check Feb 15 (should be available)
```

**Expected Result**:
- ✅ Feb 10-14 blocked
- ✅ Feb 15+ available

### Case 3: Ruff's Retreat (Multi-Kennel - 12 kennels)
**Setup**: 
- Booking 1: Kennels 1-5, Feb 20-25
- Booking 2: Kennels 6-10, Feb 20-25
- (Only 10/12 kennels occupied)

**Test**:
```
1. Select: Dog → Ruff's Retreat
2. Go to dates
3. Check Feb 20-24 (should be AVAILABLE - only 10/12 occupied)
4. Try to select Feb 21 (should succeed)
```

**Expected Result**:
- ✅ Feb 20-24 NOT blocked (still 2 kennels available)
- ✅ Can select these dates

### Case 4: The Village (Multi-Kennel - 6 kennels)
**Setup**: 
- Booking 1: Kennels 1-3, Mar 1-5
- Booking 2: Kennels 4-6, Mar 1-5
- (All 6/6 kennels occupied)

**Test**:
```
1. Select: Dog → The Village
2. Go to dates
3. Check Mar 1-4 (should be BLOCKED - all 6 occupied)
4. Try to select Mar 2 (should fail)
```

**Expected Result**:
- ✅ Mar 1-4 blocked (red, line-through)
- ✅ Cannot select these dates

### Case 5: Date Range Spanning Booking
**Setup**: Booking from Feb 15-20

**Test**:
```
1. Select any single suite
2. Try to select check-in: Feb 10, check-out: Feb 25
3. Should see validation error about dates being unavailable
```

**Expected Result**:
- ✅ Feb 15-19 blocked in calendar
- ✅ Cannot complete booking spanning blocked dates

## Browser Testing

Test in these browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Console Log Checklist

When testing, you should see these logs:

```javascript
// When accommodation is selected:
"=== FETCH AVAILABILITY DEBUG ==="
"accommodationType: luxury-suite"
"specificSuite: sniffany"
"Fetching availability for slug: sniffany"

// When data is received:
"Availability fetch for slug: sniffany returned: [...]"
"Number of bookings returned: 2"
"🔍 RAW BOOKING DATA: [...]"

// When dates are processed:
"Single suite dates blocked: 10 dates"
"=== BOOKED DATES SET ==="
"Total dates blocked: 10"
"Blocked dates: 2025-02-01, 2025-02-02, ..."

// When hovering over dates:
"✅ Date BLOCKED in calendar: 2025-02-01"
```

## Visual Checklist

Blocked dates should have:
- [ ] Red/pink background (`bg-destructive/30`)
- [ ] Line-through text
- [ ] Reduced opacity (`opacity-50`)
- [ ] Not-allowed cursor
- [ ] Cannot be clicked

Available dates should have:
- [ ] Normal white background
- [ ] Normal text
- [ ] Normal cursor
- [ ] Can be clicked

## Regression Testing

Ensure these still work:
- [ ] Booking rules (min nights, peak season)
- [ ] Date validation
- [ ] Price calculation
- [ ] Multi-pet selection
- [ ] Form submission
- [ ] Stripe payment flow

## Performance Testing

- [ ] Calendar loads within 2 seconds
- [ ] Date selection is responsive
- [ ] No lag when switching months
- [ ] Console logs don't spam excessively

## Edge Cases

### Edge Case 1: Same-day check-in/check-out
**Test**: Booking from Feb 1 00:00 to Feb 1 23:59
**Expected**: Feb 1 should be blocked

### Edge Case 2: Midnight boundary
**Test**: Booking from Feb 1 23:59 to Feb 2 00:01
**Expected**: Both Feb 1 and Feb 2 blocked

### Edge Case 3: Timezone differences
**Test**: Create booking in different timezone
**Expected**: Dates still block correctly in local timezone

### Edge Case 4: No bookings
**Test**: Select suite with no bookings
**Expected**: All future dates available

## Acceptance Criteria

✅ All single suite bookings block dates correctly  
✅ Multi-kennel only blocks when fully occupied  
✅ Visual indicators are clear and obvious  
✅ Console logs confirm blocking logic  
✅ Cannot select blocked dates  
✅ Can select available dates  
✅ Works across all browsers  
✅ No performance issues  

## Sign-off

- [ ] Developer tested: ___________
- [ ] QA tested: ___________
- [ ] Product owner approved: ___________
- [ ] Ready for production: ___________

---

**Test Status**: ⏳ PENDING  
**Last Updated**: 2025-01-XX  
**Tester**: ___________
