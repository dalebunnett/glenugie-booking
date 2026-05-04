import type { Booking } from './booking-types';
import { parseISO, isWithinInterval, isSameDay } from 'date-fns';

/**
 * Automatically allocates a kennel number for standard kennels
 * Returns the next available kennel number or null if fully booked
 */
export function allocateKennelNumber(
  accommodationType: string,
  checkIn: string,
  checkOut: string,
  existingBookings: Booking[]
): number | null {
  // Only allocate for standard kennels
  if (accommodationType !== 'village' && accommodationType !== 'ruffs-retreat') {
    return null;
  }

  // Define capacity for each type
  const capacity = accommodationType === 'village' ? 6 : 12; // Village: 6, Ruff's Retreat: 12

  const checkInDate = parseISO(checkIn);
  const checkOutDate = parseISO(checkOut);

  // Check each kennel number to find an available one
  for (let kennelNum = 1; kennelNum <= capacity; kennelNum++) {
    const isAvailable = !existingBookings.some(booking => {
      // Skip cancelled bookings
      if (booking.status === 'cancelled') return false;

      // Only check bookings for the same accommodation type
      if (booking.accommodationType !== accommodationType) return false;

      // Only check bookings with the same kennel number
      if (booking.kennelNumber !== kennelNum) return false;

      // Check if dates overlap
      const bookingCheckIn = parseISO(booking.checkIn);
      const bookingCheckOut = parseISO(booking.checkOut);

      // Check for any date overlap
      const hasOverlap =
        isWithinInterval(checkInDate, { start: bookingCheckIn, end: bookingCheckOut }) ||
        isWithinInterval(checkOutDate, { start: bookingCheckIn, end: bookingCheckOut }) ||
        isWithinInterval(bookingCheckIn, { start: checkInDate, end: checkOutDate }) ||
        isWithinInterval(bookingCheckOut, { start: checkInDate, end: checkOutDate }) ||
        isSameDay(checkInDate, bookingCheckIn) ||
        isSameDay(checkInDate, bookingCheckOut) ||
        isSameDay(checkOutDate, bookingCheckIn) ||
        isSameDay(checkOutDate, bookingCheckOut);

      return hasOverlap;
    });

    if (isAvailable) {
      return kennelNum;
    }
  }

  // No available kennels
  return null;
}

/**
 * Check if a specific kennel number is available for the given dates
 */
export function isKennelAvailable(
  accommodationType: string,
  kennelNumber: number,
  checkIn: string,
  checkOut: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): boolean {
  const checkInDate = parseISO(checkIn);
  const checkOutDate = parseISO(checkOut);

  return !existingBookings.some(booking => {
    // Skip the booking being edited
    if (excludeBookingId && booking.id === excludeBookingId) return false;

    // Skip cancelled bookings
    if (booking.status === 'cancelled') return false;

    // Only check bookings for the same accommodation type
    if (booking.accommodationType !== accommodationType) return false;

    // Only check bookings with the same kennel number
    if (booking.kennelNumber !== kennelNumber) return false;

    // Check if dates overlap
    const bookingCheckIn = parseISO(booking.checkIn);
    const bookingCheckOut = parseISO(booking.checkOut);

    const hasOverlap =
      isWithinInterval(checkInDate, { start: bookingCheckIn, end: bookingCheckOut }) ||
      isWithinInterval(checkOutDate, { start: bookingCheckIn, end: bookingCheckOut }) ||
      isWithinInterval(bookingCheckIn, { start: checkInDate, end: checkOutDate }) ||
      isWithinInterval(bookingCheckOut, { start: checkInDate, end: checkOutDate }) ||
      isSameDay(checkInDate, bookingCheckIn) ||
      isSameDay(checkInDate, bookingCheckOut) ||
      isSameDay(checkOutDate, bookingCheckIn) ||
      isSameDay(checkOutDate, bookingCheckOut);

    return hasOverlap;
  });
}

/**
 * Get all occupied kennel numbers for a given accommodation type and date range
 */
export function getOccupiedKennels(
  accommodationType: string,
  checkIn: string,
  checkOut: string,
  existingBookings: Booking[]
): number[] {
  const checkInDate = parseISO(checkIn);
  const checkOutDate = parseISO(checkOut);

  const occupied = new Set<number>();

  existingBookings.forEach(booking => {
    // Skip cancelled bookings
    if (booking.status === 'cancelled') return;

    // Only check bookings for the same accommodation type
    if (booking.accommodationType !== accommodationType) return;

    // Skip if no kennel number
    if (!booking.kennelNumber) return;

    // Check if dates overlap
    const bookingCheckIn = parseISO(booking.checkIn);
    const bookingCheckOut = parseISO(booking.checkOut);

    const hasOverlap =
      isWithinInterval(checkInDate, { start: bookingCheckIn, end: bookingCheckOut }) ||
      isWithinInterval(checkOutDate, { start: bookingCheckIn, end: bookingCheckOut }) ||
      isWithinInterval(bookingCheckIn, { start: checkInDate, end: checkOutDate }) ||
      isWithinInterval(bookingCheckOut, { start: checkInDate, end: checkOutDate }) ||
      isSameDay(checkInDate, bookingCheckIn) ||
      isSameDay(checkInDate, bookingCheckOut) ||
      isSameDay(checkOutDate, bookingCheckIn) ||
      isSameDay(checkOutDate, bookingCheckOut);

    if (hasOverlap) {
      occupied.add(booking.kennelNumber);
    }
  });

  return Array.from(occupied).sort((a, b) => a - b);
}
