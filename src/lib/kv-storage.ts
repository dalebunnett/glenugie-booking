


/**
 * KV-based storage adapter for Cloudflare Workers
 * Stores data in Cloudflare KV (Key-Value storage)
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

// Default data
const DEFAULT_RULES: BookingRules = {
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
};

const DEFAULT_RATES: Rates = {
  luxurySuites: { basePrice: 25, additionalPet: 10 },
  cattery: { basePrice: 15, additionalPet: 7.5 },
  ruffsRetreat: { basePrice: 20, additionalPet: 10 },
  theVillage: { basePrice: 20, additionalPet: 10 },
  paymentSettings: { depositAmount: 50, fullPaymentDaysBefore: 7 }
};

export class KVStorage {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async getBookings(): Promise<Booking[]> {
    try {
      console.log('[KVStorage] 🔍 Reading bookings from KV...');
      const data = await this.kv.get('bookings', 'json');
      if (!data) {
        console.log('[KVStorage] ❌ No bookings found in KV, returning empty array');
        return [];
      }
      const bookings = data as Booking[];
      console.log(`[KVStorage] ✅ Loaded ${bookings.length} bookings from KV`);
      
      // Log first 3 booking IDs for debugging
      if (bookings.length > 0) {
        const sampleIds = bookings.slice(0, 3).map(b => b.id);
        console.log('[KVStorage] Sample booking IDs:', sampleIds);
      }
      
      return bookings;
    } catch (error) {
      console.error('[KVStorage] ❌ Error loading bookings:', error);
      return [];
    }
  }

  async saveBookings(bookings: Booking[]): Promise<void> {
    console.log(`[KVStorage] 💾 Saving ${bookings.length} bookings to KV...`);
    
    // Log first 3 booking IDs for debugging
    if (bookings.length > 0) {
      const sampleIds = bookings.slice(0, 3).map(b => b.id);
      console.log('[KVStorage] Sample booking IDs being saved:', sampleIds);
    }
    
    try {
      await this.kv.put('bookings', JSON.stringify(bookings));
      console.log(`[KVStorage] ✅ Successfully saved ${bookings.length} bookings to KV`);
    } catch (error) {
      console.error('[KVStorage] ❌ Error saving bookings:', error);
      throw error;
    }
  }

  async getBookingRules(): Promise<BookingRules> {
    try {
      const data = await this.kv.get('booking-rules', 'json');
      if (!data) {
        console.log('[KVStorage] No rules found, using defaults');
        return DEFAULT_RULES;
      }
      return data as BookingRules;
    } catch (error) {
      console.error('[KVStorage] Error loading rules:', error);
      return DEFAULT_RULES;
    }
  }

  async saveBookingRules(rules: BookingRules): Promise<void> {
    try {
      await this.kv.put('booking-rules', JSON.stringify(rules));
      console.log('[KVStorage] Saved booking rules to KV');
    } catch (error) {
      console.error('[KVStorage] Error saving rules:', error);
      throw error;
    }
  }

  async getRates(): Promise<Rates> {
    try {
      const data = await this.kv.get('rates', 'json');
      if (!data) {
        console.log('[KVStorage] No rates found, using defaults');
        return DEFAULT_RATES;
      }
      return data as Rates;
    } catch (error) {
      console.error('[KVStorage] Error loading rates:', error);
      return DEFAULT_RATES;
    }
  }

  async saveRates(rates: Rates): Promise<void> {
    try {
      await this.kv.put('rates', JSON.stringify(rates));
      console.log('[KVStorage] Saved rates to KV');
    } catch (error) {
      console.error('[KVStorage] Error saving rates:', error);
      throw error;
    }
  }

  async initialize(initialData?: StorageData): Promise<void> {
    if (initialData) {
      console.log(`[KVStorage] Initializing with ${initialData.bookings.length} bookings`);
      await this.saveBookings(initialData.bookings);
      await this.saveBookingRules(initialData.bookingRules);
      await this.saveRates(initialData.rates);
    } else {
      // Ensure defaults exist
      const existingRules = await this.kv.get('booking-rules');
      if (!existingRules) {
        await this.saveBookingRules(DEFAULT_RULES);
      }
      
      const existingRates = await this.kv.get('rates');
      if (!existingRates) {
        await this.saveRates(DEFAULT_RATES);
      }
      
      const existingBookings = await this.kv.get('bookings');
      if (!existingBookings) {
        await this.saveBookings([]);
      }
    }
  }
}



