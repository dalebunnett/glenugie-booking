



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
    console.error('[Storage] ❌ KV namespace is required but not provided');
    console.error('[Storage] This usually means:');
    console.error('[Storage] 1. The runtime binding is not configured in wrangler.jsonc');
    console.error('[Storage] 2. locals.runtime is not being passed correctly');
    console.error('[Storage] 3. The booking_kv binding is missing from Cloudflare');
    throw new Error('[Storage] KV namespace (booking_kv) is required but not provided. Check your Cloudflare Workers bindings.');
  }
  
  // Create new instance for each request (stateless)
  storageInstance = new Storage(kv);
  console.log('[Storage] ✅ Storage instance created successfully');
  return storageInstance;
};

/**
 * Initialize storage with KV namespace from runtime
 */
export const initializeStorage = (runtime: any): Storage => {
  console.log('[Storage] 🔧 Initializing storage...');
  console.log('[Storage] Runtime provided:', !!runtime);
  console.log('[Storage] Runtime.env:', !!runtime?.env);
  
  if (!runtime || !runtime.env) {
    console.error('[Storage] ❌ Runtime or runtime.env is missing');
    console.error('[Storage] Make sure you are calling initDB(locals.runtime) in your API route');
    throw new Error('[Storage] Runtime environment is required. Pass locals.runtime to initDB()');
  }
  
  const kv = runtime.env.booking_kv;
  
  if (!kv) {
    console.error('[Storage] ❌ booking_kv not found in runtime.env');
    console.error('[Storage] Available env keys:', Object.keys(runtime.env || {}));
    console.error('[Storage] Please ensure the KV namespace is bound in wrangler.jsonc');
    throw new Error('[Storage] KV namespace booking_kv is not configured. Please check your Cloudflare Workers bindings in wrangler.jsonc');
  }
  
  console.log('[Storage] ✅ booking_kv binding found');
  console.log('[Storage] ✅ Initialized KV storage successfully');
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




