import type { APIRoute } from 'astro';
import { getStorage } from '../../../lib/storage';

interface Rate {
  slug: string;
  name: string;
  type: string;
  pricePerNight: number;
  additionalPetPrice: number;
  description: string;
  features: string[];
  image: string;
  capacity?: number;
}

interface BookingRule {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  affectedAccommodations: string[];
  reason: string;
  isActive: boolean;
}

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  accommodationType: string;
  specificSuite?: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  pets: any[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check admin authentication
    const sessionId = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const storage = getStorage(locals?.runtime?.env);
    
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = await storage.sessions.get(sessionId);
    if (!session || session.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('🚀 Loading data from GitHub repository files...');

    let ratesLoaded = 0;
    let rulesLoaded = 0;
    let bookingsLoaded = 0;

    // Load rates.json from data folder
    try {
      const ratesModule = await import('../../../../data/rates.json');
      const rates: Rate[] = ratesModule.default || ratesModule;
      
      // Normalize all slugs to lowercase
      const normalizedRates = rates.map(rate => ({
        ...rate,
        slug: rate.slug.toLowerCase(),
        type: rate.type.toLowerCase(),
      }));

      // Save each rate
      for (const rate of normalizedRates) {
        await storage.rates.save(rate);
        ratesLoaded++;
      }

      console.log(`✅ Loaded ${ratesLoaded} rates`);
    } catch (error) {
      console.error('Error loading rates:', error);
    }

    // Load booking-rules.json from data folder
    try {
      const rulesModule = await import('../../../../data/booking-rules.json');
      const rules: BookingRule[] = rulesModule.default || rulesModule;
      
      // Normalize accommodation slugs to lowercase
      const normalizedRules = rules.map(rule => ({
        ...rule,
        affectedAccommodations: rule.affectedAccommodations.map(slug => slug.toLowerCase()),
      }));

      // Save each rule
      for (const rule of normalizedRules) {
        await storage.bookingRules.save(rule);
        rulesLoaded++;
      }

      console.log(`✅ Loaded ${rulesLoaded} booking rules`);
    } catch (error) {
      console.error('Error loading booking rules:', error);
    }

    // Load bookings.json from data folder
    try {
      const bookingsModule = await import('../../../../data/bookings.json');
      const bookings: Booking[] = bookingsModule.default || bookingsModule;
      
      // Normalize accommodation types and suite names to lowercase
      const normalizedBookings = bookings.map(booking => ({
        ...booking,
        accommodationType: booking.accommodationType.toLowerCase(),
        specificSuite: booking.specificSuite?.toLowerCase(),
      }));

      // Save each booking
      for (const booking of normalizedBookings) {
        await storage.bookings.save(booking);
        bookingsLoaded++;
      }

      console.log(`✅ Loaded ${bookingsLoaded} bookings`);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data loaded successfully from GitHub repository',
        summary: {
          rates: ratesLoaded,
          bookingRules: rulesLoaded,
          bookings: bookingsLoaded,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Load from GitHub error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to load data from GitHub',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
