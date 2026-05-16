import type { APIRoute } from 'astro';
import { initDB } from '../../../lib/db';

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const db = initDB(locals.runtime);
    const allBookings = await db.bookings.getAll();
    
    // Find all Village bookings
    const villageBookings = allBookings.filter(b => 
      b.accommodationType === 'village' ||
      b.specificSuite?.toLowerCase().includes('village') ||
      b.specificSuite === 'the-village'
    );
    
    console.log('[Remove Duplicates] Found Village bookings:', villageBookings.length);
    
    // Group by customer name, check-in, and check-out to find duplicates
    const grouped = new Map<string, typeof villageBookings>();
    
    villageBookings.forEach(booking => {
      const key = `${booking.customerName}-${booking.checkIn}-${booking.checkOut}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(booking);
    });
    
    // Find duplicates (groups with more than 1 booking)
    const duplicates: Array<{ key: string; bookings: typeof villageBookings }> = [];
    grouped.forEach((bookings, key) => {
      if (bookings.length > 1) {
        duplicates.push({ key, bookings });
      }
    });
    
    console.log('[Remove Duplicates] Found duplicate groups:', duplicates.length);
    
    // For each duplicate group, keep the most recent one and delete the rest
    const toDelete: string[] = [];
    const toKeep: string[] = [];
    
    duplicates.forEach(({ key, bookings }) => {
      // Sort by createdAt (most recent first)
      const sorted = bookings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Keep the first (most recent), delete the rest
      toKeep.push(sorted[0].id);
      sorted.slice(1).forEach(b => toDelete.push(b.id));
    });
    
    console.log('[Remove Duplicates] Will keep:', toKeep.length);
    console.log('[Remove Duplicates] Will delete:', toDelete.length);
    
    // Delete the duplicates
    for (const id of toDelete) {
      await db.bookings.delete(id);
      console.log('[Remove Duplicates] Deleted booking:', id);
    }
    
    return new Response(JSON.stringify({
      success: true,
      totalVillageBookings: villageBookings.length,
      duplicateGroups: duplicates.length,
      kept: toKeep.length,
      deleted: toDelete.length,
      deletedIds: toDelete,
      keptIds: toKeep,
      details: duplicates.map(({ key, bookings }) => ({
        key,
        count: bookings.length,
        bookings: bookings.map(b => ({
          id: b.id,
          customerName: b.customerName,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          createdAt: b.createdAt,
          status: b.status
        }))
      }))
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Remove Duplicates] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// GET to preview what would be deleted
export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = initDB(locals.runtime);
    const allBookings = await db.bookings.getAll();
    
    // Find all Village bookings
    const villageBookings = allBookings.filter(b => 
      b.accommodationType === 'village' ||
      b.specificSuite?.toLowerCase().includes('village') ||
      b.specificSuite === 'the-village'
    );
    
    // Group by customer name, check-in, and check-out to find duplicates
    const grouped = new Map<string, typeof villageBookings>();
    
    villageBookings.forEach(booking => {
      const key = `${booking.customerName}-${booking.checkIn}-${booking.checkOut}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(booking);
    });
    
    // Find duplicates (groups with more than 1 booking)
    const duplicates: Array<{ key: string; bookings: typeof villageBookings }> = [];
    grouped.forEach((bookings, key) => {
      if (bookings.length > 1) {
        duplicates.push({ key, bookings });
      }
    });
    
    return new Response(JSON.stringify({
      totalVillageBookings: villageBookings.length,
      duplicateGroups: duplicates.length,
      duplicates: duplicates.map(({ key, bookings }) => ({
        key,
        count: bookings.length,
        bookings: bookings.map(b => ({
          id: b.id,
          customerName: b.customerName,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          createdAt: b.createdAt,
          status: b.status,
          accommodationType: b.accommodationType,
          specificSuite: b.specificSuite
        }))
      }))
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Preview Duplicates] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
