import React from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import type { Booking } from '../../lib/booking-types';
import { baseUrl } from '../../lib/base-url';
import { formatAccommodationDisplay } from '../../lib/booking-types';
import { adminDelete, adminPut } from '../../lib/admin-fetch';

interface BookingsListProps {
  bookings: Booking[];
  onRefresh: () => void;
  selectedBookingId?: string;
}

const ITEMS_PER_PAGE = 20;

export default function BookingsList({ bookings, onRefresh, selectedBookingId }: BookingsListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [accommodationFilter, setAccommodationFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState<'date' | 'customer' | 'status'>('date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedBooking, setEditedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const selectedRowRef = useRef<HTMLTableRowElement>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [selectedBookingIds, setSelectedBookingIds] = useState<Set<string>>(new Set());
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  // Handle selectedBookingId from calendar
  useEffect(() => {
    if (selectedBookingId) {
      const booking = bookings.find(b => b.id === selectedBookingId);
      if (booking) {
        setSelectedBooking(booking);
        setIsDialogOpen(true);
        
        // Find the page containing this booking
        const index = filteredBookings.findIndex(b => b.id === selectedBookingId);
        if (index >= 0) {
          const page = Math.floor(index / ITEMS_PER_PAGE) + 1;
          setCurrentPage(page);
          
          // Scroll to the row after a short delay
          setTimeout(() => {
            selectedRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      }
    }
  }, [selectedBookingId, bookings]);

  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    if (accommodationFilter !== 'all') {
      filtered = filtered.filter(b => {
        if (accommodationFilter === 'luxury-suite') {
          return b.accommodationType === 'luxury-suite' || b.specificSuite;
        }
        return b.accommodationType === accommodationFilter;
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.customerName.toLowerCase().includes(term) ||
        b.customerEmail.toLowerCase().includes(term) ||
        b.customerPhone.toLowerCase().includes(term) ||
        b.pets.some(p => p.name.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [bookings, statusFilter, accommodationFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  
  const displayedBookings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredBookings.slice(start, end);
  }, [filteredBookings, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, accommodationFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleAccommodationChange = (value: string) => {
    setAccommodationFilter(value);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Customer Name',
      'Email',
      'Phone',
      'Emergency Contact',
      'Emergency Phone',
      'Pets',
      'Accommodation',
      'Kennel Number',
      'Check-in',
      'Check-out',
      'Nights',
      'Total Price',
      'Deposit',
      'Status',
      'Payment Status',
      'Created At'
    ];

    const rows = filteredBookings.map((booking) => [
      booking.id,
      booking.customerName,
      booking.customerEmail,
      booking.customerPhone,
      booking.emergencyContactName || '',
      booking.emergencyContactNumber || '',
      booking.pets.map(p => `${p.name} (${p.breed})`).join('; '),
      formatAccommodationDisplay(booking),
      (booking.kennelNumber && (booking.accommodationType === 'village' || booking.accommodationType === 'ruffs-retreat')) 
        ? `#${booking.kennelNumber}` 
        : '',
      format(new Date(booking.checkIn), 'yyyy-MM-dd'),
      format(new Date(booking.checkOut), 'yyyy-MM-dd'),
      booking.numberOfNights,
      booking.totalPrice,
      booking.depositAmount,
      booking.status,
      booking.paymentStatus,
      format(new Date(booking.createdAt), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      await adminPut(`/api/admin/bookings/${bookingId}`, { status });
      onRefresh();
      setSelectedBooking(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  const startEditing = (booking: Booking) => {
    setEditedBooking(booking);
    setIsEditMode(true);
  };

  const cancelEditing = () => {
    setIsEditMode(false);
    setEditedBooking(null);
  };

  const saveBooking = async () => {
    if (!editedBooking || !isEditMode) return;

    try {
      await adminPut(`/api/admin/bookings/${editedBooking.id}`, editedBooking);
      onRefresh();
      setIsEditMode(false);
      setEditedBooking(null);
      setIsDialogOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Failed to save booking:', error);
      alert('Failed to save booking changes');
    }
  };

  const updatePet = (index: number, field: string, value: string) => {
    if (!editedBooking?.pets) return;
    
    const updatedPets = [...editedBooking.pets];
    updatedPets[index] = { ...updatedPets[index], [field]: value };
    setEditedBooking({ ...editedBooking, pets: updatedPets });
  };

  const handleDeleteBooking = async (bookingId: string) => {
    console.log('[Frontend] Starting delete for booking:', bookingId);
    setDeletingId(bookingId);

    try {
      const url = `${baseUrl}/api/admin/bookings/${bookingId}`;
      console.log('[Frontend] DELETE request to:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_session') || ''}`
        }
      });

      console.log('[Frontend] Response status:', response.status);
      console.log('[Frontend] Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Frontend] Delete failed:', errorData);
        throw new Error(errorData.error || 'Failed to delete booking');
      }

      const result = await response.json();
      console.log('[Frontend] Delete successful:', result);

      // Close any open dialogs
      setSelectedBooking(null);
      setIsEditMode(false);
      setEditedBooking(null);
      
      // Refresh bookings list
      console.log('[Frontend] Refreshing bookings list');
      onRefresh();
    } catch (error) {
      console.error('[Frontend] Error deleting booking:', error);
      alert('Failed to delete booking: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setDeletingId(null);
      console.log('[Frontend] Delete operation completed');
    }
  };

  const handleDeleteAll = async () => {
    console.log('[Frontend] Starting delete all bookings...');
    setIsDeletingAll(true);

    try {
      const url = `${baseUrl}/api/admin/bookings/delete-all`;
      console.log('[Frontend] DELETE request to:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_session') || ''}`
        }
      });

      console.log('[Frontend] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Frontend] Delete all failed:', errorData);
        throw new Error(errorData.error || 'Failed to delete all bookings');
      }

      const result = await response.json();
      console.log('[Frontend] Delete all successful:', result);
      alert(`Successfully deleted ${result.deletedCount} bookings`);

      // Refresh bookings list
      console.log('[Frontend] Refreshing bookings list');
      onRefresh();
    } catch (error) {
      console.error('[Frontend] Error deleting all bookings:', error);
      alert('Failed to delete all bookings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDeletingAll(false);
      console.log('[Frontend] Delete all operation completed');
    }
  };

  const toggleSelectBooking = (bookingId: string) => {
    const newSelected = new Set(selectedBookingIds);
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId);
    } else {
      newSelected.add(bookingId);
    }
    setSelectedBookingIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedBookingIds.size === displayedBookings.length) {
      setSelectedBookingIds(new Set());
    } else {
      setSelectedBookingIds(new Set(displayedBookings.map(b => b.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBookingIds.size === 0) return;
    
    console.log('[Frontend] Starting delete for selected bookings:', Array.from(selectedBookingIds));
    setIsDeletingSelected(true);

    try {
      const deletePromises = Array.from(selectedBookingIds).map(async (bookingId) => {
        const url = `${baseUrl}/api/admin/bookings/${bookingId}`;
        const response = await fetch(url, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_session') || ''}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Failed to delete booking ${bookingId}: ${errorData.error}`);
        }

        return response.json();
      });

      await Promise.all(deletePromises);
      console.log('[Frontend] All selected bookings deleted successfully');
      
      // Clear selection
      setSelectedBookingIds(new Set());
      
      // Refresh bookings list
      onRefresh();
    } catch (error) {
      console.error('[Frontend] Error deleting selected bookings:', error);
      alert('Failed to delete some bookings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDeletingSelected(false);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'deposit-paid': 'bg-blue-100 text-blue-800',
      'fully-paid': 'bg-green-100 text-green-800',
      refunded: 'bg-gray-100 text-gray-800'
    } as const;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status as keyof typeof colors] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full md:w-auto">
          <span className="text-sm font-medium">Filter:</span>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={accommodationFilter} onValueChange={handleAccommodationChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accommodations</SelectItem>
              <SelectItem value="luxury-suite">Luxury Dog Suites</SelectItem>
              <SelectItem value="cattery">Cattery Suites</SelectItem>
              <SelectItem value="ruffs-retreat">Ruff's Retreat</SelectItem>
              <SelectItem value="village">The Village</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Search by name, email, phone, or pet..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:w-[300px]"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {selectedBookingIds.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="flex-1 md:flex-none"
                  disabled={isDeletingSelected}
                >
                  {isDeletingSelected ? 'Deleting...' : `Delete Selected (${selectedBookingIds.size})`}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Bookings?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p className="font-semibold text-destructive">
                      This will permanently delete {selectedBookingIds.size} selected booking{selectedBookingIds.size > 1 ? 's' : ''}.
                    </p>
                    <p>
                      This action cannot be undone.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSelected}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Delete {selectedBookingIds.size} Booking{selectedBookingIds.size > 1 ? 's' : ''}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <Button onClick={exportToCSV} variant="outline" className="flex-1 md:flex-none">
            Export to CSV
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="flex-1 md:flex-none"
                disabled={bookings.length === 0 || isDeletingAll}
              >
                {isDeletingAll ? 'Deleting...' : 'Delete All'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>⚠️ Delete ALL Bookings?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p className="font-semibold text-destructive">
                    This will permanently delete ALL {bookings.length} bookings from the system.
                  </p>
                  <p>
                    This action cannot be undone. All booking data, customer information, and payment records will be lost.
                  </p>
                  <p className="text-sm">
                    Are you absolutely sure you want to continue?
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Delete All {bookings.length} Bookings
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={displayedBookings.length > 0 && selectedBookingIds.size === displayedBookings.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                  aria-label="Select all bookings"
                />
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Pet(s)</TableHead>
              <TableHead>Accommodation</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              displayedBookings.map((booking) => (
                <TableRow 
                  key={booking.id}
                  ref={booking.id === selectedBookingId ? selectedRowRef : null}
                  className={booking.id === selectedBookingId ? 'bg-primary/10 animate-pulse' : ''}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedBookingIds.has(booking.id)}
                      onChange={() => toggleSelectBooking(booking.id)}
                      className="w-4 h-4 cursor-pointer"
                      aria-label={`Select booking for ${booking.customerName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {booking.pets.map(p => p.name).join(', ')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatAccommodationDisplay(booking)}
                    {booking.kennelNumber && (booking.accommodationType === 'village' || booking.accommodationType === 'ruffs-retreat') && (
                      <span className="font-semibold"> #{booking.kennelNumber}</span>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(booking.checkIn), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(booking.checkOut), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-semibold">£{booking.totalPrice}</TableCell>
                  <TableCell className="text-green-600">£{booking.paidAmount || booking.depositAmount || 0}</TableCell>
                  <TableCell className="text-orange-600">£{booking.totalDue || (booking.totalPrice - (booking.paidAmount || booking.depositAmount || 0))}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={isDialogOpen && selectedBooking?.id === booking.id} onOpenChange={(open) => {
                        if (!open) {
                          setIsDialogOpen(false);
                          setSelectedBooking(null);
                          setIsEditMode(false);
                          setEditedBooking(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDialogOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {isEditMode ? 'Edit Booking' : 'Booking Details'}
                            </DialogTitle>
                            <DialogDescription>
                              Booking ID: {booking.id}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedBooking && (
                            <div className="space-y-4">
                              {!isEditMode ? (
                                <>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Customer Information</h4>
                                      <p><strong>Name:</strong> {selectedBooking.customerName}</p>
                                      <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
                                      <p><strong>Phone:</strong> {selectedBooking.customerPhone}</p>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold mb-2">Booking Information</h4>
                                      <p><strong>Check-in:</strong> {format(new Date(selectedBooking.checkIn), 'PPP')}</p>
                                      <p><strong>Check-out:</strong> {format(new Date(selectedBooking.checkOut), 'PPP')}</p>
                                      <p><strong>Nights:</strong> {selectedBooking.numberOfNights}</p>
                                      <p><strong>Accommodation:</strong> {formatAccommodationDisplay(selectedBooking)}
                                        {selectedBooking.kennelNumber && (selectedBooking.accommodationType === 'village' || selectedBooking.accommodationType === 'ruffs-retreat') && (
                                          <span className="font-semibold"> #{selectedBooking.kennelNumber}</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Pets</h4>
                                    {selectedBooking.pets.map((pet, i) => (
                                      <div key={i} className="mb-2 p-2 bg-muted rounded">
                                        <p><strong>{pet.name}</strong> - {pet.breed}, {pet.age} years old</p>
                                        {pet.specialRequirements && (
                                          <p className="text-sm text-muted-foreground">{pet.specialRequirements}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Payment</h4>
                                    <p><strong>Total:</strong> £{selectedBooking.totalPrice}</p>
                                    <p><strong>Paid:</strong> <span className="text-green-600">£{selectedBooking.paidAmount || selectedBooking.depositAmount || 0}</span></p>
                                    <p><strong>Total Due:</strong> <span className="text-orange-600">£{selectedBooking.totalDue || (selectedBooking.totalPrice - (selectedBooking.paidAmount || selectedBooking.depositAmount || 0))}</span></p>
                                    <p><strong>Status:</strong> {getPaymentBadge(selectedBooking.paymentStatus)}</p>
                                  </div>

                                  {selectedBooking.specialRequests && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Special Requests</h4>
                                      <p className="text-sm">{selectedBooking.specialRequests}</p>
                                    </div>
                                  )}

                                  <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                      onClick={() => startEditing(selectedBooking)}
                                      variant="outline"
                                    >
                                      Edit Booking
                                    </Button>
                                    <div className="flex-1" />
                                    <Button
                                      onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                                      disabled={selectedBooking.status === 'confirmed'}
                                      variant="default"
                                      size="sm"
                                    >
                                      Confirm
                                    </Button>
                                    <Button
                                      onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                                      disabled={selectedBooking.status === 'cancelled'}
                                      variant="destructive"
                                      size="sm"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                                      disabled={selectedBooking.status === 'completed'}
                                      variant="outline"
                                      size="sm"
                                    >
                                      Complete
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                      <h4 className="font-semibold">Customer Information</h4>
                                      <div>
                                        <Label htmlFor="customerName">Name</Label>
                                        <Input
                                          id="customerName"
                                          value={editedBooking?.customerName || ''}
                                          onChange={(e) => setEditedBooking({ ...editedBooking!, customerName: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="customerEmail">Email</Label>
                                        <Input
                                          id="customerEmail"
                                          type="email"
                                          value={editedBooking?.customerEmail || ''}
                                          onChange={(e) => setEditedBooking({ ...editedBooking!, customerEmail: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="customerPhone">Phone</Label>
                                        <Input
                                          id="customerPhone"
                                          value={editedBooking?.customerPhone || ''}
                                          onChange={(e) => setEditedBooking({ ...editedBooking!, customerPhone: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      <h4 className="font-semibold">Booking Dates</h4>
                                      <div>
                                        <Label htmlFor="checkIn">Check-in</Label>
                                        <Input
                                          id="checkIn"
                                          type="date"
                                          value={editedBooking?.checkIn?.split('T')[0] || ''}
                                          onChange={(e) => setEditedBooking({ ...editedBooking!, checkIn: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="checkOut">Check-out</Label>
                                        <Input
                                          id="checkOut"
                                          type="date"
                                          value={editedBooking?.checkOut?.split('T')[0] || ''}
                                          onChange={(e) => setEditedBooking({ ...editedBooking!, checkOut: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="numberOfNights">Number of Nights</Label>
                                        <Input
                                          id="numberOfNights"
                                          type="number"
                                          value={editedBooking?.numberOfNights || ''}
                                          onChange={(e) => setEditedBooking({ ...editedBooking!, numberOfNights: parseInt(e.target.value) })}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold">Accommodation</h4>
                                    <div>
                                      <Label htmlFor="accommodationType">Accommodation Type</Label>
                                      <Select
                                        value={editedBooking?.accommodationType || ''}
                                        onValueChange={(value) => setEditedBooking({ ...editedBooking!, accommodationType: value })}
                                      >
                                        <SelectTrigger id="accommodationType">
                                          <SelectValue placeholder="Select accommodation type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="luxury-suite">Luxury Dog Suite</SelectItem>
                                          <SelectItem value="cattery">Cattery Suite</SelectItem>
                                          <SelectItem value="ruffs-retreat">Ruff's Retreat</SelectItem>
                                          <SelectItem value="village">The Village</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="specificSuite">Specific Suite/Kennel (Optional)</Label>
                                      <Input
                                        id="specificSuite"
                                        value={editedBooking?.specificSuite || ''}
                                        onChange={(e) => setEditedBooking({ ...editedBooking!, specificSuite: e.target.value })}
                                        placeholder="e.g., Sniffany Suite, Clawrence House"
                                      />
                                    </div>
                                    {(editedBooking?.accommodationType === 'village' || editedBooking?.accommodationType === 'ruffs-retreat') && (
                                      <div>
                                        <Label htmlFor="kennelNumber">Kennel Number</Label>
                                        <Input
                                          id="kennelNumber"
                                          type="number"
                                          min="1"
                                          max={editedBooking?.accommodationType === 'village' ? 6 : 12}
                                          value={editedBooking?.kennelNumber || ''}
                                          onChange={(e) => setEditedBooking({ ...editedBooking!, kennelNumber: parseInt(e.target.value) || null })}
                                          placeholder={`Auto-assigned (1-${editedBooking?.accommodationType === 'village' ? '6' : '12'})`}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Leave blank to auto-assign the next available kennel
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Pets</h4>
                                    {editedBooking?.pets?.map((pet, i) => (
                                      <div key={i} className="mb-3 p-3 bg-muted rounded space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <Label>Pet Name</Label>
                                            <Input
                                              value={pet.name}
                                              onChange={(e) => updatePet(i, 'name', e.target.value)}
                                            />
                                          </div>
                                          <div>
                                            <Label>Breed</Label>
                                            <Input
                                              value={pet.breed}
                                              onChange={(e) => updatePet(i, 'breed', e.target.value)}
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <Label>Age</Label>
                                          <Input
                                            value={pet.age}
                                            onChange={(e) => updatePet(i, 'age', e.target.value)}
                                          />
                                        </div>
                                        <div>
                                          <Label>Special Requirements</Label>
                                          <Textarea
                                            value={pet.specialRequirements || ''}
                                            onChange={(e) => updatePet(i, 'specialRequirements', e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold">Payment</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div>
                                        <Label htmlFor="totalPrice">Total Price (£)</Label>
                                        <Input
                                          id="totalPrice"
                                          type="number"
                                          step="0.01"
                                          value={editedBooking?.totalPrice || ''}
                                          onChange={(e) => setEditedBooking({ ...editedBooking!, totalPrice: parseFloat(e.target.value) })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="paidAmount">Paid Amount (£)</Label>
                                        <Input
                                          id="paidAmount"
                                          type="number"
                                          step="0.01"
                                          value={editedBooking?.paidAmount || editedBooking?.depositAmount || ''}
                                          onChange={(e) => {
                                            const paidAmount = parseFloat(e.target.value);
                                            setEditedBooking({ 
                                              ...editedBooking!, 
                                              paidAmount,
                                              depositAmount: paidAmount,
                                              totalDue: (editedBooking?.totalPrice || 0) - paidAmount
                                            });
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="totalDue">Total Due (£)</Label>
                                        <Input
                                          id="totalDue"
                                          type="number"
                                          step="0.01"
                                          value={editedBooking?.totalDue || ((editedBooking?.totalPrice || 0) - (editedBooking?.paidAmount || editedBooking?.depositAmount || 0))}
                                          readOnly
                                          className="bg-muted"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="specialRequests">Special Requests</Label>
                                    <Textarea
                                      id="specialRequests"
                                      value={editedBooking?.specialRequests || ''}
                                      onChange={(e) => setEditedBooking({ ...editedBooking!, specialRequests: e.target.value })}
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex gap-2 pt-4 border-t">
                                    <Button onClick={saveBooking} variant="default">
                                      Save Changes
                                    </Button>
                                    <Button onClick={cancelEditing} variant="outline">
                                      Cancel
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={deletingId === booking.id}
                          >
                            {deletingId === booking.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this booking for <strong>{booking.customerName}</strong>? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 pb-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length} bookings
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="min-w-[2.5rem]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && <span className="text-muted-foreground px-2">...</span>}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
