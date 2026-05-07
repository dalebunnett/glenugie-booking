import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import type { Booking } from '../../lib/booking-types';
import { LUXURY_SUITES, CATTERY_SUITES } from '../../lib/booking-types';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { baseUrl } from '../../lib/base-url';
import { adminPut } from '../../lib/admin-fetch';

interface IndividualKennelCalendarProps {
  bookings: Booking[];
  onUpdate?: () => void;
}

export default function IndividualKennelCalendar({ bookings, onUpdate }: IndividualKennelCalendarProps) {
  // Debug logging
  const villageBookings = bookings.filter(b => b.accommodationType === 'village');
  const ruffsRetreatBookings = bookings.filter(b => b.accommodationType === 'ruffs-retreat');
  
  console.log('[IndividualKennelCalendar] Total bookings:', bookings.length);
  console.log('[IndividualKennelCalendar] Village bookings:', villageBookings.length);
  console.log('[IndividualKennelCalendar] Village bookings with kennelNumber:', villageBookings.filter(b => b.kennelNumber).length);
  console.log('[IndividualKennelCalendar] Sample village booking:', villageBookings[0]);
  console.log('[IndividualKennelCalendar] All village kennel numbers:', villageBookings.map(b => ({ id: b.id.slice(-6), kennelNum: b.kennelNumber, checkIn: b.checkIn })));
  console.log('[IndividualKennelCalendar] Ruffs Retreat bookings:', ruffsRetreatBookings.length);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<'luxury' | 'cattery' | 'standard'>('luxury');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const nextMonth = () => setCurrentMonth(addDays(currentMonth, 30));
  const prevMonth = () => setCurrentMonth(addDays(currentMonth, -30));

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    
    setDeletingId(selectedBooking.id);

    try {
      const sessionId = localStorage.getItem('admin_session');
      const response = await fetch(`${baseUrl}/api/admin/bookings/${selectedBooking.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${sessionId || ''}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      setShowDeleteDialog(false);
      setShowBookingDialog(false);
      setSelectedBooking(null);
      
      // Refresh bookings list
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDialog(true);
  };

  const isDateBooked = (date: Date, accommodationValue: string) => {
    return bookings.some(booking => {
      if (booking.status === 'cancelled') return false;
      
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      
      // FIXED: Exclude checkout date - guest leaves that day, kennel is available
      // Only block dates from check-in up to (but not including) check-out
      const isInRange = (date >= checkIn && date < checkOut);
      
      // Check if it's a kennel number reference (e.g., "village-3" or "ruffs-retreat-5")
      if (accommodationValue.includes('-') && (accommodationValue.startsWith('village-') || accommodationValue.startsWith('ruffs-retreat-'))) {
        const parts = accommodationValue.split('-');
        const kennelNum = parseInt(parts[parts.length - 1]);
        const baseType = accommodationValue.startsWith('village-') ? 'village' : 'ruffs-retreat';
        
        return isInRange && booking.accommodationType === baseType && booking.kennelNumber === kennelNum;
      }
      
      return isInRange && (
        booking.specificSuite === accommodationValue ||
        booking.accommodationType === accommodationValue
      );
    });
  };

  const getBookingForDate = (date: Date, accommodationValue: string): Booking | undefined => {
    return bookings.find(booking => {
      if (booking.status === 'cancelled') return false;
      
      const checkIn = parseISO(booking.checkIn);
      const checkOut = parseISO(booking.checkOut);
      
      // FIXED: Exclude checkout date - guest leaves that day, kennel is available
      // Only block dates from check-in up to (but not including) check-out
      const isInRange = (date >= checkIn && date < checkOut);
      
      // Check if it's a kennel number reference (e.g., "village-3" or "ruffs-retreat-5")
      if (accommodationValue.includes('-') && (accommodationValue.startsWith('village-') || accommodationValue.startsWith('ruffs-retreat-'))) {
        const parts = accommodationValue.split('-');
        const kennelNum = parseInt(parts[parts.length - 1]);
        const baseType = accommodationValue.startsWith('village-') ? 'village' : 'ruffs-retreat';
        
        return isInRange && booking.accommodationType === baseType && booking.kennelNumber === kennelNum;
      }
      
      return isInRange && (
        booking.specificSuite === accommodationValue ||
        booking.accommodationType === accommodationValue
      );
    });
  };

  const renderAccommodationCalendar = (name: string, value: string, capacity: number = 1) => {
    return (
      <Card key={value} className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>{name}</span>
            <Badge variant="outline">Capacity: {capacity}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="border rounded-lg overflow-hidden">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 bg-muted">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-semibold border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const isBooked = isDateBooked(day, value);
                const booking = getBookingForDate(day, value);
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-20 p-2 border-r border-b last:border-r-0
                      ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''}
                      ${isToday ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}
                      ${isBooked ? 'bg-destructive/10' : 'bg-background'}
                    `}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    {isBooked && booking && (
                      <div 
                        className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openBookingDetails(booking)}
                      >
                        <Badge 
                          variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                          className="text-xs mb-1 w-full justify-center"
                        >
                          {booking.status}
                        </Badge>
                        <p className="truncate font-medium">{booking.customerName}</p>
                        <p className="truncate text-muted-foreground">
                          {booking.pets.map(p => p.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const updateKennelNumber = async (bookingId: string, newKennelNumber: number) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      const response = await adminPut(`/api/admin/bookings/${selectedBooking.id}`, {
        ...booking,
        kennelNumber: newKennelNumber
      });

      if (!response.ok) {
        throw new Error('Failed to update kennel number');
      }

      toast.success(`Kennel number updated to ${newKennelNumber}`);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating kennel number:', error);
      toast.error('Failed to update kennel number');
    }
  };

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6">
        <Button onClick={prevMonth} variant="outline">
          ← Previous Month
        </Button>
        <h2 className="text-2xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button onClick={nextMonth} variant="outline">
          Next Month →
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="luxury">Luxury Dog Suites (10)</TabsTrigger>
          <TabsTrigger value="cattery">Cattery Suites (12)</TabsTrigger>
          <TabsTrigger value="standard">Standard Kennels (18)</TabsTrigger>
        </TabsList>

        {/* Luxury Dog Suites */}
        <TabsContent value="luxury" className="space-y-6">
          {LUXURY_SUITES.map(suite => renderAccommodationCalendar(suite.label, suite.value, 1))}
        </TabsContent>

        {/* Cattery Suites */}
        <TabsContent value="cattery" className="space-y-6">
          {CATTERY_SUITES.map(suite => renderAccommodationCalendar(suite.label, suite.value, 1))}
        </TabsContent>

        {/* Standard Kennels */}
        <TabsContent value="standard" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Ruff's Retreat (Kennels 1-12)</h3>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(kennelNum => 
              renderAccommodationCalendar(`Ruff's Retreat #${kennelNum}`, `ruffs-retreat-${kennelNum}`, 1)
            )}
          </div>
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-xl font-semibold">The Village (Kennels 1-6)</h3>
            {Array.from({ length: 6 }, (_, i) => i + 1).map(kennelNum => 
              renderAccommodationCalendar(`The Village #${kennelNum}`, `village-${kennelNum}`, 1)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-background border"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-destructive/10 border"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/5 border-2 border-primary"></div>
              <span>Today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            {selectedBooking && (
              <DialogDescription>
                Booking ID: {selectedBooking.id}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <p><strong>Name:</strong> {selectedBooking.customerName}</p>
                  <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
                  <p><strong>Phone:</strong> {selectedBooking.customerPhone}</p>
                  {selectedBooking.emergencyContactName && (
                    <>
                      <p className="mt-2"><strong>Emergency Contact:</strong> {selectedBooking.emergencyContactName}</p>
                      <p><strong>Emergency Phone:</strong> {selectedBooking.emergencyContactNumber}</p>
                    </>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Booking Information</h4>
                  <p><strong>Accommodation:</strong> {selectedBooking.specificSuite || selectedBooking.accommodationType}</p>
                  <p><strong>Check-in:</strong> {format(new Date(selectedBooking.checkIn), 'PPP')}</p>
                  <p><strong>Check-out:</strong> {format(new Date(selectedBooking.checkOut), 'PPP')}</p>
                  <p><strong>Nights:</strong> {selectedBooking.numberOfNights}</p>
                  <p><strong>Status:</strong> <Badge variant={selectedBooking.status === 'confirmed' ? 'default' : 'secondary'}>{selectedBooking.status}</Badge></p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Pets</h4>
                {selectedBooking.pets.map((pet, i) => (
                  <div key={i} className="mb-2 p-3 bg-muted rounded">
                    <p><strong>{pet.name}</strong> - {pet.breed}, {pet.age} years old, {pet.sex}</p>
                    {pet.microchipNumber && (
                      <p className="text-sm text-muted-foreground">Microchip: {pet.microchipNumber}</p>
                    )}
                    {pet.specialRequirements && (
                      <p className="text-sm text-muted-foreground mt-1">{pet.specialRequirements}</p>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Payment</h4>
                <p><strong>Total:</strong> £{selectedBooking.totalPrice}</p>
                <p><strong>Deposit:</strong> £{selectedBooking.depositAmount}</p>
                <p><strong>Payment Status:</strong> {selectedBooking.paymentStatus}</p>
              </div>

              {selectedBooking.specialRequests && (
                <div>
                  <h4 className="font-semibold mb-2">Special Requests</h4>
                  <p className="text-sm">{selectedBooking.specialRequests}</p>
                </div>
              )}

              {selectedBooking.veterinarySurgery && (
                <div>
                  <h4 className="font-semibold mb-2">Veterinary Information</h4>
                  <p><strong>Surgery:</strong> {selectedBooking.veterinarySurgery}</p>
                  {selectedBooking.petInsurance && (
                    <p><strong>Insurance:</strong> {selectedBooking.petInsurance}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                >
                  Delete Booking
                </Button>
                <div className="flex-1" />
                <Button
                  onClick={() => setShowBookingDialog(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking for <strong>{selectedBooking?.customerName}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBooking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingId !== null}
            >
              {deletingId ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}












