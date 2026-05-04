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
}

interface Props {
  kennelSlug: string;
  kennelName: string;
  accommodationType?: 'luxury-suite' | 'ruffs-retreat' | 'village' | 'cattery';
}

export default function KennelAvailabilityCalendar({ kennelSlug, kennelName }: Props) {
  const [bookings, setBookings] = useState<PublicBooking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [kennelSlug]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/availability/${kennelSlug}`);
      
      if (response.ok) {
        const data = await response.json() as PublicBooking[];
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if a date is booked
  const isDateBooked = (date: Date) => {
    return bookings.some(booking => {
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      return date >= checkIn && date < checkOut;
    });
  };

  // Get booking for a specific date
  const getBookingForDate = (date: Date) => {
    return bookings.find(booking => {
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      return date >= checkIn && date < checkOut;
    });
  };

  const booking = selectedDate ? getBookingForDate(selectedDate) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Calendar</CardTitle>
        <CardDescription>
          View booking availability for {kennelName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span>Booked</span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md"
                modifiers={{
                  booked: (date) => isDateBooked(date)
                }}
                modifiersStyles={{
                  booked: {
                    backgroundColor: '#fee2e2',
                    borderColor: '#fca5a5',
                    color: '#991b1b'
                  }
                }}
              />
            </div>

            {selectedDate && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold mb-2">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
                {booking ? (
                  <div className="space-y-2">
                    <Badge variant="destructive">Booked</Badge>
                    <div className="text-sm space-y-1">
                      <p><strong>Check-in:</strong> {format(parseISO(booking.checkIn), 'MMM d, yyyy')}</p>
                      <p><strong>Check-out:</strong> {format(parseISO(booking.checkOut), 'MMM d, yyyy')}</p>
                      <p><strong>Duration:</strong> {booking.numberOfNights} night{booking.numberOfNights !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      This suite is available on this date
                    </p>
                  </div>
                )}
              </div>
            )}

            {bookings.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p>No bookings yet. This suite is available!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}




