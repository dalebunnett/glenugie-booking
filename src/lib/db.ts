import type { Booking } from './booking-types';
import { sessions } from './sessions';
import { getStorage, initializeStorage } from './storage';

// Get storage instance (will be initialized with KV in API routes)
const storage = getStorage();

// Cache invalidation callbacks
const cacheInvalidationCallbacks: Array<() => void> = [];

export const registerCacheInvalidation = (callback: () => void) => {
  cacheInvalidationCallbacks.push(callback);
};

const invalidateCaches = () => {
  cacheInvalidationCallbacks.forEach(cb => cb());
};

// Helper function to allocate kennel numbers for The Village and Ruff's Retreat
const allocateKennelNumber = (booking: Booking, allBookings: Booking[]): number | null => {
  // Only allocate for village and ruffs-retreat
  if (booking.accommodationType !== 'village' && booking.accommodationType !== 'ruffs-retreat') {
    return booking.kennelNumber || null;
  }

  // If already has a kennel number, keep it
  if (booking.kennelNumber) {
    return booking.kennelNumber;
  }

  // Define max kennels
  const maxKennels = booking.accommodationType === 'village' ? 6 : 12;

  // Get all bookings for this accommodation type that overlap with the dates
  const overlappingBookings = allBookings.filter(b => {
    if (b.id === booking.id) return false; // Skip self
    if (b.accommodationType !== booking.accommodationType) return false;
    if (!b.kennelNumber) return false; // Skip if no kennel assigned
    
    // Check for date overlap
    const bookingStart = new Date(booking.checkIn);
    const bookingEnd = new Date(booking.checkOut);
    const existingStart = new Date(b.checkIn);
    const existingEnd = new Date(b.checkOut);
    
    return (bookingStart < existingEnd && bookingEnd > existingStart);
  });

  // Get occupied kennel numbers
  const occupiedKennels = new Set(overlappingBookings.map(b => b.kennelNumber!));

  // Find first available kennel
  for (let i = 1; i <= maxKennels; i++) {
    if (!occupiedKennels.has(i)) {
      return i;
    }
  }

  // No available kennels
  return null;
};

export const db = {
  bookings: {
    getAll: async (): Promise<Booking[]> => {
      return await storage.getBookings();
    },

    getById: async (id: string): Promise<Booking | undefined> => {
      const bookings = await storage.getBookings();
      return bookings.find(b => b.id === id);
    },

    getByEmail: async (email: string): Promise<Booking[]> => {
      const bookings = await storage.getBookings();
      return bookings.filter(b => b.customerEmail === email);
    },

    create: async (booking: Booking): Promise<Booking> => {
      const bookings = await storage.getBookings();
      
      // Auto-allocate kennel number for village and ruffs-retreat
      const kennelNumber = allocateKennelNumber(booking, bookings);
      const bookingWithKennel = { ...booking, kennelNumber };
      
      bookings.push(bookingWithKennel);
      await storage.saveBookings(bookings);
      invalidateCaches();
      
      return bookingWithKennel;
    },

    update: async (id: string, updates: Partial<Booking>): Promise<Booking | undefined> => {
      const bookings = await storage.getBookings();
      const index = bookings.findIndex(b => b.id === id);
      
      if (index === -1) return undefined;
      
      const updated = { 
        ...bookings[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      
      // Re-allocate kennel number if accommodation type or dates changed
      if (updates.accommodationType || updates.checkIn || updates.checkOut) {
        const kennelNumber = allocateKennelNumber(updated, bookings);
        updated.kennelNumber = kennelNumber;
      }
      
      bookings[index] = updated;
      await storage.saveBookings(bookings);
      invalidateCaches();
      
      return updated;
    },

    delete: async (id: string): Promise<boolean> => {
      const bookings = await storage.getBookings();
      const filtered = bookings.filter(b => b.id !== id);
      
      if (filtered.length === bookings.length) return false;
      
      await storage.saveBookings(filtered);
      invalidateCaches();
      return true;
    }
  },

  sessions,

  bookingRules: {
    get: async () => {
      return await storage.getBookingRules();
    },

    update: async (updates: any) => {
      const current = await storage.getBookingRules();
      const updated = { ...current, ...updates };
      await storage.saveBookingRules(updated);
      return updated;
    }
  },

  rates: {
    get: async () => {
      return await storage.getRates();
    },

    update: async (updates: any) => {
      const current = await storage.getRates();
      const updated = {
        ...current,
        ...updates,
        luxurySuites: updates.luxurySuites ? { ...current.luxurySuites, ...updates.luxurySuites } : current.luxurySuites,
        cattery: updates.cattery ? { ...current.cattery, ...updates.cattery } : current.cattery,
        ruffsRetreat: updates.ruffsRetreat ? { ...current.ruffsRetreat, ...updates.ruffsRetreat } : current.ruffsRetreat,
        theVillage: updates.theVillage ? { ...current.theVillage, ...updates.theVillage } : current.theVillage,
        paymentSettings: updates.paymentSettings ? { ...current.paymentSettings, ...updates.paymentSettings } : current.paymentSettings
      };
      await storage.saveRates(updated);
      return updated;
    }
  },

  customers: {
    getAll: () => [],
    getById: (id: string) => undefined,
    getByEmail: (email: string) => undefined,
    create: (customer: any) => customer,
    update: (id: string, updates: any) => undefined,
    delete: (id: string) => false
  },

  customerSessions: {
    create: (customerId: string, expiresInHours = 720) => sessions.createCustomerSession(customerId, expiresInHours),
    get: (sessionId: string) => sessions.getCustomerSession(sessionId),
    delete: (sessionId: string) => sessions.deleteCustomerSession(sessionId),
    cleanup: () => sessions.cleanupCustomerSessions()
  },
  
  storage
};

/**
 * Initialize database with runtime environment (for KV binding)
 * Call this in API routes: db.init(locals.runtime)
 */
export const initDB = (runtime?: any) => {
  const newStorage = initializeStorage(runtime);
  // Update the storage reference used by db
  Object.defineProperty(db, 'storage', { value: newStorage, writable: false });
  return db;
};

console.log('[DB] Database module loaded with global storage');

