/**
 * Storage adapter for Cloudflare Workers
 * Uses file-based storage (JSON files in repository)
 * This is simpler and works perfectly with Webflow Cloud deployment
 */

import type { Booking } from './booking-types';
import { getFileStorage, FileStorage } from './file-storage';

interface BookingRules {
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

interface Rates {
  luxurySuites: { basePrice: number; additionalPet: number };
  cattery: { basePrice: number; additionalPet: number };
  ruffsRetreat: { basePrice: number; additionalPet: number };
  theVillage: { basePrice: number; additionalPet: number };
  paymentSettings: { depositAmount: number; fullPaymentDaysBefore: number };
}

interface StorageData {
  bookings: Booking[];
  bookingRules: BookingRules;
  rates: Rates;
}

export class Storage {
  private fileStorage: FileStorage;

  constructor() {
    this.fileStorage = getFileStorage();
  }

  async getBookings(): Promise<Booking[]> {
    return await this.fileStorage.getBookings();
  }

  async saveBookings(bookings: Booking[]): Promise<void> {
    await this.fileStorage.saveBookings(bookings);
  }

  async getBookingRules(): Promise<BookingRules> {
    return await this.fileStorage.getBookingRules();
  }

  async saveBookingRules(rules: BookingRules): Promise<void> {
    await this.fileStorage.saveBookingRules(rules);
  }

  async getRates(): Promise<Rates> {
    return await this.fileStorage.getRates();
  }

  async saveRates(rates: Rates): Promise<void> {
    await this.fileStorage.saveRates(rates);
  }

  async initialize(initialData?: StorageData): Promise<void> {
    await this.fileStorage.initialize(initialData);
  }
}

// Create a singleton storage instance
let storageInstance: Storage | null = null;

export const getStorage = (): Storage => {
  if (!storageInstance) {
    storageInstance = new Storage();
    console.log('[Storage] Initialized file-based storage');
  }
  return storageInstance;
};

/**
 * Initialize storage (no runtime needed for file storage)
 */
export const initializeStorage = (): Storage => {
  console.log('[Storage] Using file-based storage (no KV required)');
  return getStorage();
};
