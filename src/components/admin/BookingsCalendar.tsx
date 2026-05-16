import { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import type { Booking } from '../../lib/booking-types';
import { LUXURY_SUITES, CATTERY_SUITES } from '../../lib/booking-types';
import { format, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { baseUrl } from '../../lib/base-url';
import { formatAccommodationDisplay } from '../../lib/booking-types';

interface BookingsCalendarProps {
  bookings: Booking[];
  onSelectBooking?: (booking: Booking) => void;
}

export default function BookingsCalendar({ bookings, onSelectBooking }: BookingsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [accommodationFilter, setAccommodationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  console.log('📅 BookingsCalendar received bookings:', bookings.length);
  console.log('📅 Selected date:', selectedDate);
  console.log('📅 Accommodation filter:', accommodationFilter);

  // Filter bookings by search query
  const filteredBookings = searchQuery 
    ? bookings.filter(booking => {
        const query = searchQuery.toLowerCase();
        return booking.customerName.toLowerCase().includes(query) ||
               booking.pets.some(p => p.name.toLowerCase().includes(query));
      })
    : bookings;

  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter(booking => {
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      
      // FIXED: Exclude checkout date - guest leaves that day, kennel is available
      // Only block dates from check-in up to (but not including) check-out
      const isInRange = (date >= checkIn && date < checkOut);
      
      const matchesFilter = accommodationFilter === 'all' || 
                           booking.accommodationType === accommodationFilter ||
                           booking.specificSuite === accommodationFilter;
      
      return isInRange && matchesFilter && booking.status !== 'cancelled';
    });
  };

  const todayBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
  
  console.log('📅 Bookings for selected date:', todayBookings.length);
  if (selectedDate) {
    console.log('📅 Selected date formatted:', format(selectedDate, 'yyyy-MM-dd'));
    console.log('📅 All booking date ranges:', filteredBookings.map(b => ({
      id: b.id,
      customer: b.customerName,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      status: b.status
    })));
  }

  const getAccommodationAvailability = () => {
    if (!selectedDate) return [];

    const bookedAccommodations = todayBookings.reduce((acc, booking) => {
      const key = formatAccommodationDisplay(booking);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const availability: Array<{
      name: string;
      type: string;
      total: number;
      booked: number;
      available: number;
    }> = [];
    
    // Luxury Dog Suites
    LUXURY_SUITES.forEach(suite => {
      const booked = bookedAccommodations[suite.value] || 0;
      availability.push({
        name: suite.label,
        type: 'Luxury Suite',
        total: 1,
        booked,
        available: 1 - booked
      });
    });

    // Cattery Suites
    CATTERY_SUITES.forEach(suite => {
      const booked = bookedAccommodations[suite.value] || 0;
      availability.push({
        name: suite.label,
        type: 'Cattery Suite',
        total: 1,
        booked,
        available: 1 - booked
      });
    });

    // Standard Kennels - Ruffs Retreat (12 kennels)
    // Count unique kennel numbers that are occupied
    const ruffsOccupiedKennels = new Set(
      todayBookings
        .filter(b => b.accommodationType === 'ruffs-retreat' && b.kennelNumber)
        .map(b => b.kennelNumber)
    );
    const ruffsBooked = ruffsOccupiedKennels.size;
    availability.push({
      name: "Ruff's Retreat",
      type: 'Standard Kennels',
      total: 12,
      booked: ruffsBooked,
      available: 12 - ruffsBooked
    });

    // Standard Kennels - Village (6 kennels)
    // Count unique kennel numbers that are occupied
    const villageOccupiedKennels = new Set(
      todayBookings
        .filter(b => b.accommodationType === 'village' && b.kennelNumber)
        .map(b => b.kennelNumber)
    );
    const villageBooked = villageOccupiedKennels.size;
    availability.push({
      name: 'The Village',
      type: 'Standard Kennels',
      total: 6,
      booked: villageBooked,
      available: 6 - villageBooked
    });

    return availability;
  };

  const availability = getAccommodationAvailability();

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-0">
      {/* Left Sidebar - Daily Bookings */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b bg-background">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span>📅</span>
            <span>Daily Bookings</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </p>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {todayBookings.length} booking{todayBookings.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Sidebar Content - Scrollable Bookings */}
        <div className="flex-1 overflow-y-auto p-4">
          {todayBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No bookings for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="bg-background border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer hover:border-primary"
                  onClick={() => onSelectBooking?.(booking)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{booking.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        🐾 {booking.pets.map(p => p.name).join(', ')}
                      </p>
                    </div>
                    <Badge 
                      variant={booking.status === 'confirmed' ? 'default' : 'secondary'} 
                      className="text-xs ml-2 shrink-0"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="truncate">
                      <strong>Suite:</strong> {formatAccommodationDisplay(booking)}
                    </p>
                    <p>
                      <strong>Dates:</strong> {format(parseISO(booking.checkIn), 'MMM d')} - {format(parseISO(booking.checkOut), 'MMM d')}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 w-full text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBooking?.(booking);
                    }}
                  >
                    View Details →
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - Calendar and Availability */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-6 space-y-4">
          <div>
            <Input
              placeholder="Search by customer name or pet name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Searching for: <strong>{searchQuery}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Filter by Accommodation</label>
            <Select value={accommodationFilter} onValueChange={setAccommodationFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Kennels and Suites</SelectItem>
                <SelectItem value="luxury-suite">Luxury Dog Suites</SelectItem>
                {LUXURY_SUITES.map(suite => (
                  <SelectItem key={suite.value} value={suite.value}>{suite.label}</SelectItem>
                ))}
                <SelectItem value="cattery">Cattery Suites</SelectItem>
                {CATTERY_SUITES.map(suite => (
                  <SelectItem key={suite.value} value={suite.value}>{suite.label}</SelectItem>
                ))}
                <SelectItem value="ruffs-retreat">Ruff's Retreat</SelectItem>
                <SelectItem value="village">The Village</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendar */}
        <div className="max-w-4xl mx-auto mb-6 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border bg-background shadow-sm"
            modifiers={{
              booked: (date) => getBookingsForDate(date).length > 0
            }}
            modifiersStyles={{
              booked: {
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--primary) / 0.1)'
              }
            }}
          />
        </div>

        {/* Availability Overview */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Availability Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                For {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'selected date'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availability.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                      <Badge 
                        variant={item.available > 0 ? 'default' : 'destructive'}
                        className="ml-2 shrink-0"
                      >
                        {item.available > 0 ? '✓' : '✗'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.available} of {item.total} available
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

















