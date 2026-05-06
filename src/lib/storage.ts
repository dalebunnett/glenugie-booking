
/**
 * Storage adapter for Cloudflare Workers
 * Uses Cloudflare KV for persistent storage
 */

import type { Booking } from './booking-types';
import { KVStorage } from './kv-storage';

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
  private kvStorage: KVStorage;

  constructor(kv: KVNamespace) {
    this.kvStorage = new KVStorage(kv);
  }

  async getBookings(): Promise<Booking[]> {
    return await this.kvStorage.getBookings();
  }

  async saveBookings(bookings: Booking[]): Promise<void> {
    await this.kvStorage.saveBookings(bookings);
  }

  async getBookingRules(): Promise<BookingRules> {
    return await this.kvStorage.getBookingRules();
  }

  async saveBookingRules(rules: BookingRules): Promise<void> {
    await this.kvStorage.saveBookingRules(rules);
  }

  async getRates(): Promise<Rates> {
    return await this.kvStorage.getRates();
  }

  async saveRates(rates: Rates): Promise<void> {
    await this.kvStorage.saveRates(rates);
  }

  async initialize(initialData?: StorageData): Promise<void> {
    await this.kvStorage.initialize(initialData);
  }
}

// Storage instance cache per request
let storageInstance: Storage | null = null;

export const getStorage = (kv?: KVNamespace): Storage => {
  if (!kv) {
    throw new Error('[Storage] KV namespace is required');
  }
  
  // Create new instance for each request (stateless)
  storageInstance = new Storage(kv);
  return storageInstance;
};

/**
 * Initialize storage with KV namespace from runtime
 */
export const initializeStorage = (runtime: any): Storage => {
  const kv = runtime?.env?.BOOKINGS_KV;
  
  if (!kv) {
    console.error('[Storage] BOOKINGS_KV not found in runtime.env');
    throw new Error('KV namespace BOOKINGS_KV is not configured');
  }
  
  console.log('[Storage] Initialized KV storage');
  return getStorage(kv);
};

/**
 * Delete all bookings from storage
 */
export const deleteAllBookings = async (locals: any): Promise<number> => {
  const storage = initializeStorage(locals.runtime);
  const bookings = await storage.getBookings();
  const count = bookings.length;
  
  // Save empty array
  await storage.saveBookings([]);
  
  return count;
};

