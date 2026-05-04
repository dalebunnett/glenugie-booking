

/**
 * Storage adapter for Cloudflare Workers
 * Uses KV when available, falls back to global in-memory storage
 */

import type { Booking } from './booking-types';

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

// Global storage that persists across requests in the same worker instance
// This is better than Map because it survives module reloads
const GLOBAL_STORAGE_KEY = '__GLENUGIE_STORAGE__';

declare global {
  var __GLENUGIE_STORAGE__: StorageData | undefined;
}

const getGlobalStorage = (): StorageData => {
  if (!globalThis[GLOBAL_STORAGE_KEY]) {
    // Initialize with default data
    globalThis[GLOBAL_STORAGE_KEY] = {
      bookings: [],
      bookingRules: {
        id: 1,
        minAdvanceBookingDays: 1,
        maxAdvanceBookingDays: 365,
        minNights: 1,
        maxNights: 90,
        blockedDates: [],
        blockedDateRanges: [
          { start: '2026-12-24', end: '2026-12-26', reason: 'Christmas Holiday' }
        ],
        allowedCheckInDays: [],
        allowedCheckOutDays: [],
        peakSeasonDates: [
          { start: '2026-07-01', end: '2026-08-31', minNights: 2 },
          { start: '2026-12-20', end: '2027-01-05', minNights: 3 }
        ],
        allowSameDayCheckInOut: false,
        cutoffTimeForSameDayBooking: 14
      },
      rates: {
        luxurySuites: { basePrice: 25, additionalPet: 10 },
        cattery: { basePrice: 15, additionalPet: 7.5 },
        ruffsRetreat: { basePrice: 20, additionalPet: 10 },
        theVillage: { basePrice: 20, additionalPet: 10 },
        paymentSettings: { depositAmount: 50, fullPaymentDaysBefore: 7 }
      }
    };
  }
  return globalThis[GLOBAL_STORAGE_KEY]!;
};

export class Storage {
  private kv: any;

  constructor(kv?: any) {
    this.kv = kv;
  }

  async getBookings(): Promise<Booking[]> {
    if (this.kv) {
      try {
        const data = await this.kv.get('bookings', 'json');
        if (data) return data;
      } catch (error) {
        console.error('[Storage] KV read error:', error);
      }
    }
    
    return getGlobalStorage().bookings;
  }

  async saveBookings(bookings: Booking[]): Promise<void> {
    // Always update global storage
    getGlobalStorage().bookings = bookings;

    // Try to persist to KV
    if (this.kv) {
      try {
        await this.kv.put('bookings', JSON.stringify(bookings));
        console.log(`[Storage] Saved ${bookings.length} bookings to KV`);
      } catch (error) {
        console.error('[Storage] KV write error:', error);
      }
    }
  }

  async getBookingRules(): Promise<BookingRules> {
    if (this.kv) {
      try {
        const data = await this.kv.get('booking-rules', 'json');
        if (data) return data;
      } catch (error) {
        console.error('[Storage] KV read error:', error);
      }
    }
    
    return getGlobalStorage().bookingRules;
  }

  async saveBookingRules(rules: BookingRules): Promise<void> {
    getGlobalStorage().bookingRules = rules;

    if (this.kv) {
      try {
        await this.kv.put('booking-rules', JSON.stringify(rules));
        console.log('[Storage] Saved booking rules to KV');
      } catch (error) {
        console.error('[Storage] KV write error:', error);
      }
    }
  }

  async getRates(): Promise<Rates> {
    if (this.kv) {
      try {
        const data = await this.kv.get('rates', 'json');
        if (data) return data;
      } catch (error) {
        console.error('[Storage] KV read error:', error);
      }
    }
    
    return getGlobalStorage().rates;
  }

  async saveRates(rates: Rates): Promise<void> {
    getGlobalStorage().rates = rates;

    if (this.kv) {
      try {
        await this.kv.put('rates', JSON.stringify(rates));
        console.log('[Storage] Saved rates to KV');
      } catch (error) {
        console.error('[Storage] KV write error:', error);
      }
    }
  }

  async initialize(initialData?: StorageData): Promise<void> {
    if (initialData) {
      console.log(`[Storage] Initializing with ${initialData.bookings.length} bookings`);
      globalThis[GLOBAL_STORAGE_KEY] = initialData;
      
      // Try to persist to KV
      if (this.kv) {
        try {
          await this.kv.put('bookings', JSON.stringify(initialData.bookings));
          await this.kv.put('booking-rules', JSON.stringify(initialData.bookingRules));
          await this.kv.put('rates', JSON.stringify(initialData.rates));
          console.log('[Storage] Initialized KV with data');
        } catch (error) {
          console.error('[Storage] KV initialization error:', error);
        }
      }
    }
  }
}

// Create a singleton storage instance
let storageInstance: Storage | null = null;

export const getStorage = (kv?: any): Storage => {
  if (!storageInstance) {
    storageInstance = new Storage(kv);
  } else if (kv) {
    // Always update KV binding when provided (important for Cloudflare Workers)
    storageInstance['kv'] = kv;
  }
  return storageInstance;
};

/**
 * Initialize storage with KV from Astro runtime
 * Call this in API routes to ensure KV is available
 */
export const initializeStorage = (runtime?: any): Storage => {
  const kv = runtime?.env?.KV;
  if (kv) {
    console.log('[Storage] Initializing with KV binding');
  } else {
    console.warn('[Storage] No KV binding found, using in-memory storage');
  }
  return getStorage(kv);
};


