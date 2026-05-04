// Booking rules storage
export interface BookingRules {
  id: number;
  minAdvanceBookingDays: number;
  maxAdvanceBookingDays: number;
  minNights: number;
  maxNights: number;
  blockedDates: string[];
  blockedDateRanges: { start: string; end: string; reason?: string }[];
  allowedCheckInDays: number[];
  allowedCheckOutDays: number[];
  peakSeasonDates: { start: string; end: string; minNights?: number }[];
  allowSameDayCheckInOut: boolean;
  cutoffTimeForSameDayBooking: number;
}

// Default booking rules
let currentRules: BookingRules = {
  id: 1,
  minAdvanceBookingDays: 1,
  maxAdvanceBookingDays: 365,
  minNights: 1,
  maxNights: 90,
  blockedDates: [],
  blockedDateRanges: [
    {
      start: '2026-12-24',
      end: '2026-12-26',
      reason: 'Christmas Holiday'
    }
  ],
  allowedCheckInDays: [], // Empty = all days allowed
  allowedCheckOutDays: [], // Empty = all days allowed
  peakSeasonDates: [
    {
      start: '2026-07-01',
      end: '2026-08-31',
      minNights: 2
    },
    {
      start: '2026-12-20',
      end: '2027-01-05',
      minNights: 3
    }
  ],
  allowSameDayCheckInOut: false,
  cutoffTimeForSameDayBooking: 14
};

export const bookingRulesStore = {
  get: (): BookingRules => {
    return { ...currentRules };
  },

  update: (updates: Partial<BookingRules>): BookingRules => {
    currentRules = {
      ...currentRules,
      ...updates
    };
    return { ...currentRules };
  }
};

// Helper functions for date validation
export function isDateBlocked(date: Date, rules: BookingRules): boolean {
  const dateStr = date.toISOString().split('T')[0];
  
  // Check if date is in blockedDates array
  if (rules.blockedDates.includes(dateStr)) {
    return true;
  }
  
  // Check if date falls within any blocked range
  return rules.blockedDateRanges.some(range => {
    const rangeStart = new Date(range.start);
    const rangeEnd = new Date(range.end);
    return date >= rangeStart && date <= rangeEnd;
  });
}

export function getBlockedDateReason(date: Date, rules: BookingRules): string {
  // Check blocked ranges first (they have reasons)
  for (const range of rules.blockedDateRanges) {
    const rangeStart = new Date(range.start);
    const rangeEnd = new Date(range.end);
    if (date >= rangeStart && date <= rangeEnd) {
      return range.reason || 'Date not available';
    }
  }
  
  return 'Date not available';
}

export function getMinNightsForPeriod(checkInDate: Date, rules: BookingRules): number {
  // Check if date falls in peak season
  for (const peakSeason of rules.peakSeasonDates) {
    const seasonStart = new Date(peakSeason.start);
    const seasonEnd = new Date(peakSeason.end);
    
    if (checkInDate >= seasonStart && checkInDate <= seasonEnd) {
      return peakSeason.minNights || rules.minNights;
    }
  }
  
  return rules.minNights;
}

export function getDisabledDates(bookedDates: Date[], rules: BookingRules): Date[] {
  const disabledDates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Add past dates
  const pastDate = new Date(today);
  pastDate.setDate(pastDate.getDate() - 365);
  for (let d = new Date(pastDate); d < today; d.setDate(d.getDate() + 1)) {
    disabledDates.push(new Date(d));
  }
  
  // Add dates beyond max advance booking
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + rules.maxAdvanceBookingDays);
  const farFuture = new Date(maxDate);
  farFuture.setFullYear(farFuture.getFullYear() + 2);
  for (let d = new Date(maxDate); d < farFuture; d.setDate(d.getDate() + 1)) {
    disabledDates.push(new Date(d));
  }
  
  // Add blocked dates
  rules.blockedDates.forEach(dateStr => {
    disabledDates.push(new Date(dateStr));
  });
  
  // Add blocked date ranges
  rules.blockedDateRanges.forEach(range => {
    const start = new Date(range.start);
    const end = new Date(range.end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      disabledDates.push(new Date(d));
    }
  });
  
  // Add already booked dates
  disabledDates.push(...bookedDates);
  
  return disabledDates;
}

export function validateBooking(
  checkIn: Date,
  checkOut: Date,
  rules: BookingRules
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate nights
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check minimum advance booking
  const daysUntilCheckIn = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilCheckIn < rules.minAdvanceBookingDays) {
    errors.push(`Bookings must be made at least ${rules.minAdvanceBookingDays} day(s) in advance`);
  }
  
  // Check maximum advance booking
  if (daysUntilCheckIn > rules.maxAdvanceBookingDays) {
    errors.push(`Bookings cannot be made more than ${rules.maxAdvanceBookingDays} days in advance`);
  }
  
  // Check minimum nights (including peak season)
  const minNightsRequired = getMinNightsForPeriod(checkIn, rules);
  if (nights < minNightsRequired) {
    errors.push(`Minimum stay is ${minNightsRequired} night(s) for the selected dates`);
  }
  
  // Check maximum nights
  if (nights > rules.maxNights) {
    errors.push(`Maximum stay is ${rules.maxNights} nights`);
  }
  
  // Check if check-in date is blocked
  if (isDateBlocked(checkIn, rules)) {
    errors.push(`Check-in date is not available: ${getBlockedDateReason(checkIn, rules)}`);
  }
  
  // Check if check-out date is blocked
  if (isDateBlocked(checkOut, rules)) {
    errors.push(`Check-out date is not available: ${getBlockedDateReason(checkOut, rules)}`);
  }
  
  // Check allowed check-in days
  if (rules.allowedCheckInDays.length > 0) {
    const checkInDay = checkIn.getDay();
    if (!rules.allowedCheckInDays.includes(checkInDay)) {
      errors.push('Check-in is not allowed on this day of the week');
    }
  }
  
  // Check allowed check-out days
  if (rules.allowedCheckOutDays.length > 0) {
    const checkOutDay = checkOut.getDay();
    if (!rules.allowedCheckOutDays.includes(checkOutDay)) {
      errors.push('Check-out is not allowed on this day of the week');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

