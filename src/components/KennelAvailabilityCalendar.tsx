import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Badge } from './ui/badge';
import { baseUrl } from '../lib/base-url';
import { format, parseISO } from 'date-fns';

interface PublicBooking {
  id: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  status: string;
  petCount: number;
  kennelNumber?: number;
}

interface Props {
  kennelSlug: string;
  kennelName: string;
  accommodationType?: 'luxury-suite' | 'ruffs-retreat' | 'village' | 'cattery';
}

export default function KennelAvailabilityCalendar({ kennelSlug, kennelName, accommodationType }: Props) {
  const [bookings, setBookings] = useState<PublicBooking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Define capacity for multi-kennel types
  const isMultiKennel = accommodationType === 'ruffs-retreat' || accommodationType === 'village';
  const totalCapacity = accommodationType === 'village' ? 6 : accommodationType === 'ruffs-retreat' ? 12 : 1;

  useEffect(() => {
    loadBookings();
  }, [kennelSlug]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('[AvailabilityCalendar] Fetching bookings for:', kennelSlug);
      console.log('[AvailabilityCalendar] Accommodation type:', accommodationType);
      
      const response = await fetch(`${baseUrl}/api/availability/${kennelSlug}`);
      
      console.log('[AvailabilityCalendar] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AvailabilityCalendar] Error response:', errorText);
        setError(`Failed to load availability: ${response.status} ${response.statusText}`);
        setBookings([]);
        return;
      }
      
      const data = await response.json() as PublicBooking[];
      console.log('[AvailabilityCalendar] Bookings loaded:', data.length);
      console.log('[AvailabilityCalendar] Bookings:', data);
      
      setBookings(data);
    } catch (error) {
      console.error('[AvailabilityCalendar] Failed to load bookings:', error);
      setError(error instanceof Error ? error.message : 'Failed to load availability');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if a date is fully booked (for multi-kennel types)
  const isDateFullyBooked = (date: Date) => {
    if (!isMultiKennel) {
      // For single suites, check if any booking covers this date
      return bookings.some(booking => {
        const checkIn = parseISO(booking.checkIn);
        const checkOut = parseISO(booking.checkOut);
        return date >= checkIn && date < checkOut;
      });
    }

    // For multi-kennel types, count occupied kennels
    const occupiedKennels = new Set<number>();
    bookings.forEach(booking => {
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      if (date >= checkIn && date < checkOut && booking.kennelNumber) {
        occupiedKennels.add(booking.kennelNumber);
      }
    });

    return occupiedKennels.size >= totalCapacity;
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      return date >= checkIn && date < checkOut;
    });
  };

  // Get availability info for a date
  const getAvailabilityInfo = (date: Date) => {
    const dateBookings = getBookingsForDate(date);
    
    if (!isMultiKennel) {
      return {
        isAvailable: dateBookings.length === 0,
        occupied: dateBookings.length,
        available: dateBookings.length === 0 ? 1 : 0,
        total: 1
      };
    }

    const occupiedKennels = new Set<number>();
    dateBookings.forEach(booking => {
      if (booking.kennelNumber) {
        occupiedKennels.add(booking.kennelNumber);
      }
    });

    return {
      isAvailable: occupiedKennels.size < totalCapacity,
      occupied: occupiedKennels.size,
      available: totalCapacity - occupiedKennels.size,
      total: totalCapacity,
      occupiedNumbers: Array.from(occupiedKennels).sort((a, b) => a - b)
    };
  };

  const dateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
  const availabilityInfo = selectedDate ? getAvailabilityInfo(selectedDate) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Calendar</CardTitle>
        <CardDescription>
          View booking availability for {kennelName}
          {isMultiKennel && ` (${totalCapacity} kennels)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Error loading availability</span>
            </div>
            <p className="text-sm text-destructive/80">{error}</p>
            <button 
              onClick={() => loadBookings()}
              className="mt-3 text-sm bg-destructive/20 hover:bg-destructive/30 px-3 py-1.5 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Available</span>
              </div>
              {isMultiKennel && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span>Partially Booked</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span>Fully Booked</span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md"
                modifiers={{
                  fullyBooked: (date) => isDateFullyBooked(date),
                  partiallyBooked: (date) => {
                    if (!isMultiKennel) return false;
                    const info = getAvailabilityInfo(date);
                    return info.occupied > 0 && info.occupied < totalCapacity;
                  }
                }}
                modifiersStyles={{
                  fullyBooked: {
                    backgroundColor: '#fee2e2',
                    borderColor: '#fca5a5',
                    color: '#991b1b'
                  },
                  partiallyBooked: {
                    backgroundColor: '#fef3c7',
                    borderColor: '#fcd34d',
                    color: '#92400e'
                  }
                }}
              />
            </div>

            {selectedDate && availabilityInfo && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold mb-2">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
                
                {isMultiKennel ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {availabilityInfo.isAvailable ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {availabilityInfo.available} of {availabilityInfo.total} Available
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Fully Booked</Badge>
                      )}
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p><strong>Total Kennels:</strong> {availabilityInfo.total}</p>
                      <p><strong>Available:</strong> {availabilityInfo.available}</p>
                      <p><strong>Occupied:</strong> {availabilityInfo.occupied}</p>
                      {availabilityInfo.occupiedNumbers && availabilityInfo.occupiedNumbers.length > 0 && (
                        <p><strong>Occupied Kennel Numbers:</strong> {availabilityInfo.occupiedNumbers.join(', ')}</p>
                      )}
                    </div>

                    {dateBookings.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-semibold mb-2">Bookings on this date:</p>
                        <div className="space-y-2">
                          {dateBookings.map((booking, idx) => (
                            <div key={booking.id} className="text-sm bg-background p-2 rounded">
                              <p><strong>Kennel #{booking.kennelNumber || 'N/A'}:</strong></p>
                              <p>Check-in: {format(parseISO(booking.checkIn), 'MMM d, yyyy')}</p>
                              <p>Check-out: {format(parseISO(booking.checkOut), 'MMM d, yyyy')}</p>
                              <p>{booking.numberOfNights} night{booking.numberOfNights !== 1 ? 's' : ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dateBookings.length > 0 ? (
                      <>
                        <Badge variant="destructive">Booked</Badge>
                        <div className="text-sm space-y-1">
                          <p><strong>Check-in:</strong> {format(parseISO(dateBookings[0].checkIn), 'MMM d, yyyy')}</p>
                          <p><strong>Check-out:</strong> {format(parseISO(dateBookings[0].checkOut), 'MMM d, yyyy')}</p>
                          <p><strong>Duration:</strong> {dateBookings[0].numberOfNights} night{dateBookings[0].numberOfNights !== 1 ? 's' : ''}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          This suite is available on this date
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {bookings.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p>No bookings yet. {isMultiKennel ? 'All kennels are' : 'This suite is'} available!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


