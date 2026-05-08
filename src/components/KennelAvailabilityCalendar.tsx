import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { baseUrl } from '../lib/base-url';
import type { Booking } from '../lib/booking-types';

interface KennelAvailabilityCalendarProps {
  kennelSlug: string;
  kennelName: string;
}

interface DayStatus {
  date: Date;
  isBooked: boolean;
  isToday: boolean;
  isPast: boolean;
  bookingCount: number;
  bookings: Booking[];
}

export default function KennelAvailabilityCalendar({ 
  kennelSlug, 
  kennelName 
}: KennelAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch bookings for this kennel
  useEffect(() => {
    const fetchBookings = async () => {
      console.log('[AvailabilityCalendar] Starting fetch for kennel:', kennelSlug);
      setLoading(true);
      setError(null);

      try {
        const url = `${baseUrl}/api/availability/${kennelSlug}`;
        console.log('[AvailabilityCalendar] Fetching from:', url);
        
        const response = await fetch(url);
        console.log('[AvailabilityCalendar] Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[AvailabilityCalendar] Error response:', errorText);
          throw new Error(`Failed to fetch availability: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('[AvailabilityCalendar] Response data:', data);

        if (data.bookings && Array.isArray(data.bookings)) {
          console.log('[AvailabilityCalendar] Bookings loaded:', data.bookings.length);
          setBookings(data.bookings);
          setError(null);
        } else {
          console.warn('[AvailabilityCalendar] No bookings array in response:', data);
          setBookings([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[AvailabilityCalendar] Fetch error:', errorMessage);
        setError(errorMessage);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [kennelSlug, retryCount]);

  // Generate calendar days for current month
  const generateCalendarDays = (): DayStatus[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first day of the week containing the first day of month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End on the last day of the week containing the last day of month
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: DayStatus[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate all days
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      
      // Find bookings for this date
      const dayBookings = bookings.filter(booking => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const currentDate = new Date(current);
        
        // Normalize all dates to midnight UTC
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        
        // Check if current date is within booking range (inclusive of check-in, exclusive of check-out)
        return currentDate >= checkIn && currentDate < checkOut;
      });
      
      days.push({
        date: new Date(current),
        isBooked: dayBookings.length > 0,
        isToday: current.getTime() === today.getTime(),
        isPast: current < today,
        bookingCount: dayBookings.length,
        bookings: dayBookings
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Format month/year
  const monthYear = currentMonth.toLocaleDateString('en-GB', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Get day name
  const getDayName = (dayIndex: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  // Get bookings for selected date
  const selectedDateBookings = selectedDate 
    ? calendarDays.find(day => day.date.getTime() === selectedDate.getTime())?.bookings || []
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Availability Calendar</CardTitle>
        <CardDescription>
          Check availability for {kennelName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Debug Info */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Error loading availability:</p>
                <p className="text-sm">{error}</p>
                <Button onClick={handleRetry} size="sm" variant="outline">
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading availability...</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Info Banner */}
            <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">Legend:</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span>Past</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Total bookings loaded: {bookings.length}
              </p>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button onClick={goToPreviousMonth} variant="outline" size="sm">
                ← Previous
              </Button>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{monthYear}</h3>
                <Button onClick={goToToday} variant="ghost" size="sm">
                  Today
                </Button>
              </div>
              <Button onClick={goToNextMonth} variant="outline" size="sm">
                Next →
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                <div 
                  key={dayIndex} 
                  className="text-center font-semibold text-sm py-2 text-muted-foreground"
                >
                  {getDayName(dayIndex)}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const isCurrentMonth = day.date.getMonth() === currentMonth.getMonth();
                const isSelected = selectedDate?.getTime() === day.date.getTime();
                
                let bgColor = 'bg-white hover:bg-gray-50';
                if (day.isPast) {
                  bgColor = 'bg-gray-100 text-gray-400';
                } else if (day.isBooked) {
                  bgColor = 'bg-red-500 text-white hover:bg-red-600';
                } else {
                  bgColor = 'bg-green-500 text-white hover:bg-green-600';
                }

                if (day.isToday) {
                  bgColor += ' ring-2 ring-primary';
                }

                if (isSelected) {
                  bgColor += ' ring-2 ring-blue-500';
                }

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    disabled={day.isPast}
                    className={`
                      aspect-square p-2 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${bgColor}
                      ${!isCurrentMonth ? 'opacity-40' : ''}
                      ${day.isPast ? 'cursor-not-allowed' : 'cursor-pointer'}
                      flex flex-col items-center justify-center
                    `}
                  >
                    <span>{day.date.getDate()}</span>
                    {day.bookingCount > 0 && (
                      <span className="text-xs mt-1">
                        ({day.bookingCount})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">
                  {selectedDate.toLocaleDateString('en-GB', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                
                {selectedDateBookings.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-600">
                      Booked ({selectedDateBookings.length} booking{selectedDateBookings.length > 1 ? 's' : ''})
                    </p>
                    {selectedDateBookings.map((booking, idx) => (
                      <div key={idx} className="text-sm bg-white p-2 rounded border">
                        <p><strong>Check-in:</strong> {new Date(booking.checkInDate).toLocaleDateString('en-GB')}</p>
                        <p><strong>Check-out:</strong> {new Date(booking.checkOutDate).toLocaleDateString('en-GB')}</p>
                        <p><strong>Status:</strong> {booking.status}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Available
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

