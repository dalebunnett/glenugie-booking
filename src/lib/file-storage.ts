/**
 * File-based storage adapter
 * Stores data in JSON files in the repository
 * Perfect for Webflow Cloud deployment without KV bindings
 */

import type { Booking } from './booking-types';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

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

// Data directory path
const DATA_DIR = join(process.cwd(), 'data');
const BOOKINGS_FILE = join(DATA_DIR, 'bookings.json');
const RULES_FILE = join(DATA_DIR, 'booking-rules.json');
const RATES_FILE = join(DATA_DIR, 'rates.json');

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

// In-memory cache for performance
let bookingsCache: Booking[] | null = null;
let rulesCache: BookingRules | null = null;
let ratesCache: Rates | null = null;

// Helper to ensure data directory exists
const ensureDataDir = () => {
  if (typeof window !== 'undefined') return; // Skip in browser
  
  try {
    const fs = require('fs');
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log('[FileStorage] Created data directory:', DATA_DIR);
    }
  } catch (error) {
    console.error('[FileStorage] Error creating data directory:', error);
  }
};

// Helper to read JSON file
const readJSONFile = <T>(filePath: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') return defaultValue; // Skip in browser
  
  try {
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`[FileStorage] Error reading ${filePath}:`, error);
  }
  return defaultValue;
};

// Helper to write JSON file
const writeJSONFile = <T>(filePath: string, data: T): void => {
  if (typeof window !== 'undefined') return; // Skip in browser
  
  try {
    ensureDataDir();
    const fs = require('fs');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[FileStorage] Saved to ${filePath}`);
  } catch (error) {
    console.error(`[FileStorage] Error writing ${filePath}:`, error);
  }
};

export class FileStorage {
  async getBookings(): Promise<Booking[]> {
    if (bookingsCache) {
      console.log('[FileStorage] Returning cached bookings:', bookingsCache.length);
      return bookingsCache;
    }
    
    const bookings = readJSONFile<Booking[]>(BOOKINGS_FILE, []);
    bookingsCache = bookings;
    console.log('[FileStorage] Loaded bookings from file:', bookings.length);
    return bookings;
  }

  async saveBookings(bookings: Booking[]): Promise<void> {
    bookingsCache = bookings;
    writeJSONFile(BOOKINGS_FILE, bookings);
    console.log('[FileStorage] Saved', bookings.length, 'bookings');
  }

  async getBookingRules(): Promise<BookingRules> {
    if (rulesCache) {
      return rulesCache;
    }
    
    const rules = readJSONFile<BookingRules>(RULES_FILE, DEFAULT_RULES);
    rulesCache = rules;
    console.log('[FileStorage] Loaded booking rules from file');
    return rules;
  }

  async saveBookingRules(rules: BookingRules): Promise<void> {
    rulesCache = rules;
    writeJSONFile(RULES_FILE, rules);
    console.log('[FileStorage] Saved booking rules');
  }

  async getRates(): Promise<Rates> {
    if (ratesCache) {
      return ratesCache;
    }
    
    const rates = readJSONFile<Rates>(RATES_FILE, DEFAULT_RATES);
    ratesCache = rates;
    console.log('[FileStorage] Loaded rates from file');
    return rates;
  }

  async saveRates(rates: Rates): Promise<void> {
    ratesCache = rates;
    writeJSONFile(RATES_FILE, rates);
    console.log('[FileStorage] Saved rates');
  }

  async initialize(initialData?: StorageData): Promise<void> {
    if (initialData) {
      console.log(`[FileStorage] Initializing with ${initialData.bookings.length} bookings`);
      await this.saveBookings(initialData.bookings);
      await this.saveBookingRules(initialData.bookingRules);
      await this.saveRates(initialData.rates);
    } else {
      // Ensure default files exist
      ensureDataDir();
      if (!existsSync(RULES_FILE)) {
        writeJSONFile(RULES_FILE, DEFAULT_RULES);
      }
      if (!existsSync(RATES_FILE)) {
        writeJSONFile(RATES_FILE, DEFAULT_RATES);
      }
      if (!existsSync(BOOKINGS_FILE)) {
        writeJSONFile(BOOKINGS_FILE, []);
      }
    }
  }
}

// Singleton instance
let fileStorageInstance: FileStorage | null = null;

export const getFileStorage = (): FileStorage => {
  if (!fileStorageInstance) {
    fileStorageInstance = new FileStorage();
  }
  return fileStorageInstance;
};
