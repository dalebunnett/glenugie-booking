import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import MonthlyAvailabilityCalendar from './MonthlyAvailabilityCalendar';
import BookingsCalendar from './BookingsCalendar';
import CreateBookingForm from './CreateBookingForm';
import BookingsList from './BookingsList';
import BookingRulesManager from './BookingRulesManager';
import RatesManager from './RatesManager';
import BookingsImporter from './BookingsImporter';
import { baseUrl } from '../../lib/base-url';
import type { Booking } from '../../lib/booking-types';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['bookings']));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    upcoming: 0,
    totalRevenue: 0,
    pendingRevenue: 0
  });

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('admin_session');
      await fetch(`${baseUrl}/api/admin/auth`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${sessionId || ''}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and sessionStorage
      localStorage.removeItem('admin_session');
      sessionStorage.removeItem('admin_authenticated');
      
      // Clear all cookies
      document.cookie = 'admin_session=; Path=/; Max-Age=0; SameSite=Lax; Secure';
      
      // Reload the page to force re-authentication
      window.location.reload();
    }
  };

  const loadBookings = async (force = false) => {
    // Only reload if forced or if cache is old (30 seconds)
    const now = Date.now();
    if (!force && bookings.length > 0 && (now - lastFetchTime) < 30000) {
      return;
    }

    if (isLoadingBookings) {
      return; // Prevent multiple simultaneous requests
    }
    
    setIsLoadingBookings(true);
    try {
      // Get session from localStorage
      const sessionId = localStorage.getItem('admin_session');
      
      const response = await fetch(`${baseUrl}/api/admin/bookings`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${sessionId || ''}`
        }
      });
      
      if (!response.ok) {
        console.error('Failed to load bookings:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      setBookings(data.bookings || []);
      setLastFetchTime(now);
      
      // Debug logging
      const villageBookings = (data.bookings || []).filter((b: any) => b.accommodationType === 'village');
      const ruffsRetreatBookings = (data.bookings || []).filter((b: any) => b.accommodationType === 'ruffs-retreat');
      console.log('[AdminDashboard] Loaded bookings:', data.bookings?.length || 0);
      console.log('[AdminDashboard] Village bookings:', villageBookings.length);
      console.log('[AdminDashboard] Village with kennelNumber:', villageBookings.filter((b: any) => b.kennelNumber).length);
      console.log('[AdminDashboard] Sample village:', villageBookings[0]);
      console.log('[AdminDashboard] Ruffs Retreat bookings:', ruffsRetreatBookings.length);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Mark tab as loaded when switching to it
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLoadedTabs(prev => new Set(prev).add(value));
  };

  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setActiveTab('bookings'); // Switch to bookings tab to show details
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const sessionId = localStorage.getItem('admin_session');
        const response = await fetch(`${baseUrl}/api/admin/init-data`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${sessionId || ''}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('[AdminDashboard] Data initialized:', result);
        }
      } catch (error) {
        console.error('[AdminDashboard] Failed to initialize data:', error);
      }
    };

    // Initialize data once on mount
    initializeData();
  }, []); // Empty dependency array - run once on mount

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="opacity-90">Manage bookings and view calendar</p>
            </div>
            <div className="flex gap-3 items-center">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => loadBookings(true)}
                disabled={isLoadingBookings}
              >
                {isLoadingBookings ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Loading Overlay - Only show on initial load */}
        {isLoadingBookings && bookings.length === 0 && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card p-8 rounded-lg shadow-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Loading bookings...</p>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Confirmed</CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-green-600">{stats.confirmed}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Upcoming</CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-blue-600">{stats.upcoming}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-3">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl md:text-3xl text-green-600">£{stats.totalRevenue}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full gap-2">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="rates">Rates</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>View and manage all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingsList 
                  bookings={bookings} 
                  onRefresh={() => loadBookings(true)}
                  selectedBookingId={selectedBooking?.id}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            {loadedTabs.has('calendar') && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Bookings Calendar</CardTitle>
                    <CardDescription>View bookings for specific dates and check availability</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BookingsCalendar 
                      bookings={bookings} 
                      onSelectBooking={handleSelectBooking}
                    />
                  </CardContent>
                </Card>
                
                <MonthlyAvailabilityCalendar bookings={bookings} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Booking</CardTitle>
                <CardDescription>Manually create a booking</CardDescription>
              </CardHeader>
              <CardContent>
                {loadedTabs.has('create') && <CreateBookingForm onSuccess={() => loadBookings(true)} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle>Booking Rules</CardTitle>
                <CardDescription>View and manage booking restrictions and requirements</CardDescription>
              </CardHeader>
              <CardContent>
                {loadedTabs.has('rules') && <BookingRulesManager />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Rates</CardTitle>
                <CardDescription>View current pricing for all accommodation types</CardDescription>
              </CardHeader>
              <CardContent>
                {loadedTabs.has('rates') && <RatesManager />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Import Existing Bookings</CardTitle>
                <CardDescription>Bulk import bookings from CSV or JSON format</CardDescription>
              </CardHeader>
              <CardContent>
                {loadedTabs.has('import') && <BookingsImporter onImportComplete={() => loadBookings(true)} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}




































