


import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Booking } from '../../lib/booking-types';
import { LUXURY_SUITES, CATTERY_SUITES } from '../../lib/booking-types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isWithinInterval, 
  parseISO,
  addMonths,
  subMonths,
  getDaysInMonth,
  setMonth,
  getMonth,
  getYear
} from 'date-fns';

interface MonthlyAvailabilityCalendarProps {
  bookings: Booking[];
}

interface AccommodationAvailability {
  name: string;
  type: string;
  capacity: number;
  kennelNumber?: number;
}

const ACCOMMODATIONS: AccommodationAvailability[] = [
  // Luxury Dog Suites
  ...LUXURY_SUITES.map(suite => ({
    name: suite.label,
    type: 'luxury-suite',
    capacity: 1
  })),
  // Cattery Suites
  ...CATTERY_SUITES.map(suite => ({
    name: suite.label,
    type: 'cattery',
    capacity: 1
  })),
  // Ruffs Retreat - Individual Kennels 1-12
  ...Array.from({ length: 12 }, (_, i) => ({
    name: `Ruffs Retreat #${i + 1}`,
    type: 'ruffs-retreat',
    capacity: 1,
    kennelNumber: i + 1
  })),
  // The Village - Individual Kennels 1-6
  ...Array.from({ length: 6 }, (_, i) => ({
    name: `The Village #${i + 1}`,
    type: 'village',
    capacity: 1,
    kennelNumber: i + 1
  }))
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlyAvailabilityCalendar({ bookings }: MonthlyAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);

  // Generate year options (current year - 1 to current year + 2)
  const currentYear = getYear(new Date());
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  // Filter bookings for current month
  const monthBookings = bookings.filter(booking => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesCustomer = booking.customerName.toLowerCase().includes(query);
      const matchesPet = booking.pets.some(pet => pet.name.toLowerCase().includes(query));
      if (!matchesCustomer && !matchesPet) return false;
    }

    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return (
      (checkIn >= monthStart && checkIn <= monthEnd) ||
      (checkOut >= monthStart && checkOut <= monthEnd) ||
      (checkIn < monthStart && checkOut > monthEnd)
    );
  });

  // Get bookings for a specific accommodation and date
  const getBookingsForAccommodationAndDate = (accommodation: AccommodationAvailability, date: Date) => {
    return monthBookings.filter(booking => {
      if (booking.status === 'cancelled') return false;

      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      
      // FIXED: Exclude checkout date - guest leaves that day, kennel is available
      // Only block dates from check-in up to (but not including) check-out
      const isInRange = (date >= checkIn && date < checkOut);

      // Check if booking matches this accommodation
      if (accommodation.type === 'ruffs-retreat' || accommodation.type === 'village') {
        // For multi-kennel accommodations, check both type and kennel number
        return isInRange && 
               booking.accommodationType === accommodation.type && 
               booking.kennelNumber === accommodation.kennelNumber;
      } else if (accommodation.type === 'luxury-suite') {
        // For luxury suites, match by specificSuite
        const suiteSlug = accommodation.name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-').replace(/#/g, '');
        const bookingSuite = booking.specificSuite?.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-').replace(/#/g, '');
        return isInRange && bookingSuite === suiteSlug;
      } else if (accommodation.type === 'cattery') {
        // For cattery suites, match by specificSuite
        const suiteSlug = accommodation.name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-').replace(/#/g, '');
        const bookingSuite = booking.specificSuite?.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-').replace(/#/g, '');
        return isInRange && bookingSuite === suiteSlug;
      }
      
      return false;
    });
  };

  // Calculate availability for each accommodation and date
  const getAvailability = (accommodation: AccommodationAvailability, date: Date): number => {
    const bookingsCount = getBookingsForAccommodationAndDate(accommodation, date).length;
    return accommodation.capacity - bookingsCount;
  };

  const handleMonthChange = (monthIndex: string) => {
    const newDate = setMonth(currentDate, parseInt(monthIndex));
    setCurrentDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    setSelectedYear(newYear);
    const newDate = new Date(newYear, getMonth(currentDate));
    setCurrentDate(newDate);
  };

  // Count bookings for the current month
  const monthBookingCount = monthBookings.filter(b => b.status !== 'cancelled').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Monthly Availability Calendar</CardTitle>
              <CardDescription>
                View kennel and suite availability - {monthBookingCount} active booking{monthBookingCount !== 1 ? 's' : ''} this month
              </CardDescription>
            </div>
            
            {/* Month and Year Selectors */}
            <div className="flex gap-2 flex-wrap">
              <Select value={getMonth(currentDate).toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={() => setCurrentDate(new Date())} 
                variant="outline" 
                size="sm"
              >
                Today
              </Button>
            </div>
          </div>
        
          {/* Search Bar */}
          <div className="mt-2">
            <Input
              placeholder="Search by customer name or pet name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing bookings for: <strong>{searchQuery}</strong> ({monthBookings.length} booking{monthBookings.length !== 1 ? 's' : ''} found)
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Legend */}
            <div className="flex gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 border border-red-300 rounded"></div>
                <span>Fully Booked</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="border-2 border-border rounded-lg overflow-hidden">
              {/* Header Row - Dates */}
              <div className="grid gap-0 bg-muted" style={{ gridTemplateColumns: `200px repeat(${daysInMonth}, minmax(35px, 1fr))` }}>
                <div className="p-2 border-r-2 border-b-2 border-border font-semibold text-sm sticky left-0 bg-muted z-10">
                  Kennel/Suite
                </div>
                {eachDayOfInterval({ start: monthStart, end: monthEnd }).map((day) => (
                  <div 
                    key={day.toISOString()} 
                    className="p-1 text-center text-xs border-r-2 border-b-2 border-border font-medium"
                  >
                    <div>{format(day, 'd')}</div>
                    <div className="text-muted-foreground">{format(day, 'EEE')}</div>
                  </div>
                ))}
              </div>

              {/* Luxury Dog Suites Section */}
              <div className="bg-blue-50/30">
                <div className="p-2 font-semibold text-sm border-b-2 border-border bg-blue-50 sticky left-0 z-10">
                  Luxury Dog Suites (10)
                </div>
                {ACCOMMODATIONS.filter(a => a.type === 'luxury-suite').map((accommodation) => (
                  <div 
                    key={accommodation.name} 
                    className="grid gap-0" 
                    style={{ gridTemplateColumns: `200px repeat(${daysInMonth}, minmax(35px, 1fr))` }}
                  >
                    <div className="p-2 border-r-2 border-b-2 border-border text-sm sticky left-0 bg-white z-10">
                      {accommodation.name}
                    </div>
                    {eachDayOfInterval({ start: monthStart, end: monthEnd }).map((day) => {
                      const available = getAvailability(accommodation, day);
                      const bgColor = available === 1 ? 'bg-green-100' : 'bg-red-100';
                      
                      return (
                        <div 
                          key={day.toISOString()} 
                          className={`p-1 border-r-2 border-b-2 border-border text-center text-xs ${bgColor}`}
                          title={`${accommodation.name} - ${format(day, 'MMM d')}: ${available === 1 ? 'Available' : 'Booked'}`}
                        >
                          {available === 0 && '✓'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Cattery Suites Section */}
              <div className="bg-purple-50/30">
                <div className="p-2 font-semibold text-sm border-b-2 border-border bg-purple-50 sticky left-0 z-10">
                  Cattery Suites (12)
                </div>
                {ACCOMMODATIONS.filter(a => a.type === 'cattery').map((accommodation) => (
                  <div 
                    key={accommodation.name} 
                    className="grid gap-0" 
                    style={{ gridTemplateColumns: `200px repeat(${daysInMonth}, minmax(35px, 1fr))` }}
                  >
                    <div className="p-2 border-r-2 border-b-2 border-border text-sm sticky left-0 bg-white z-10">
                      {accommodation.name}
                    </div>
                    {eachDayOfInterval({ start: monthStart, end: monthEnd }).map((day) => {
                      const available = getAvailability(accommodation, day);
                      const bgColor = available === 1 ? 'bg-green-100' : 'bg-red-100';
                      
                      return (
                        <div 
                          key={day.toISOString()} 
                          className={`p-1 border-r-2 border-b-2 border-border text-center text-xs ${bgColor}`}
                          title={`${accommodation.name} - ${format(day, 'MMM d')}: ${available === 1 ? 'Available' : 'Booked'}`}
                        >
                          {available === 0 && '✓'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Ruffs Retreat Section */}
              <div className="bg-orange-50/30">
                <div className="p-2 font-semibold text-sm border-b-2 border-border bg-orange-50 sticky left-0 z-10">
                  Ruffs Retreat (Kennels 1-12)
                </div>
                {ACCOMMODATIONS.filter(a => a.type === 'ruffs-retreat').map((accommodation) => (
                  <div 
                    key={accommodation.name} 
                    className="grid gap-0" 
                    style={{ gridTemplateColumns: `200px repeat(${daysInMonth}, minmax(35px, 1fr))` }}
                  >
                    <div className="p-2 border-r-2 border-b-2 border-border text-sm sticky left-0 bg-white z-10">
                      {accommodation.name}
                    </div>
                    {eachDayOfInterval({ start: monthStart, end: monthEnd }).map((day) => {
                      const available = getAvailability(accommodation, day);
                      const bgColor = available === 1 ? 'bg-green-100' : 'bg-red-100';
                      
                      return (
                        <div 
                          key={day.toISOString()} 
                          className={`p-1 border-r-2 border-b-2 border-border text-center text-xs ${bgColor}`}
                          title={`${accommodation.name} - ${format(day, 'MMM d')}: ${available === 1 ? 'Available' : 'Booked'}`}
                        >
                          {available === 0 && '✓'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* The Village Section */}
              <div className="bg-green-50/30">
                <div className="p-2 font-semibold text-sm border-b-2 border-border bg-green-50 sticky left-0 z-10">
                  The Village (Kennels 1-6)
                </div>
                {ACCOMMODATIONS.filter(a => a.type === 'village').map((accommodation) => (
                  <div 
                    key={accommodation.name} 
                    className="grid gap-0" 
                    style={{ gridTemplateColumns: `200px repeat(${daysInMonth}, minmax(35px, 1fr))` }}
                  >
                    <div className="p-2 border-r-2 border-b-2 border-border text-sm sticky left-0 bg-white z-10">
                      {accommodation.name}
                    </div>
                    {eachDayOfInterval({ start: monthStart, end: monthEnd }).map((day) => {
                      const available = getAvailability(accommodation, day);
                      const bgColor = available === 1 ? 'bg-green-100' : 'bg-red-100';
                      
                      return (
                        <div 
                          key={day.toISOString()} 
                          className={`p-1 border-r-2 border-b-2 border-border text-center text-xs ${bgColor}`}
                          title={`${accommodation.name} - ${format(day, 'MMM d')}: ${available === 1 ? 'Available' : 'Booked'}`}
                        >
                          {available === 0 && '✓'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Luxury Dog Suites</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">10 Suites</p>
                  <p className="text-xs text-muted-foreground">Individual themed rooms</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Cattery Suites</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">12 Suites</p>
                  <p className="text-xs text-muted-foreground">Glenugie Whiskers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Standard Kennels</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">18 Kennels</p>
                  <p className="text-xs text-muted-foreground">Ruffs Retreat (12) + Village (6)</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}






