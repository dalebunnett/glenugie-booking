





// Admin Dashboard Component - Updated with Debug KV button
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import MonthlyAvailabilityCalendar from './MonthlyAvailabilityCalendar';
import BookingsCalendar from './BookingsCalendar';
import CreateBookingForm from './CreateBookingForm';
import BookingsList from './BookingsList';
import BookingRulesManager from './BookingRulesManager';
import RatesManager from './RatesManager';
import BookingsImporter from './BookingsImporter';
import { baseUrl } from '../../lib/base-url';
import { adminGet, adminPost, adminDelete } from '../../lib/admin-fetch';
import { BUILD_VERSION } from '../../lib/build-version';
import type { Booking } from '../../lib/booking-types';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['bookings']));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    upcoming: 0,
    totalRevenue: 0,
    pendingRevenue: 0
  });
  const [isLoadingFromGitHub, setIsLoadingFromGitHub] = useState(false);

  // Log build version to verify we're using the latest code
  console.log('🏗️ AdminDashboard Build Version:', BUILD_VERSION);

  const handleLogout = async () => {
    try {
      await adminDelete('/api/admin/auth');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and sessionStorage
      localStorage.removeItem('admin_session');
      sessionStorage.removeItem('admin_authenticated');
      
      // Clear all cookies with correct path
      document.cookie = 'admin_session=; Path=/app; Max-Age=0; SameSite=Lax; Secure';
      document.cookie = 'admin_session=; Path=/; Max-Age=0; SameSite=Lax; Secure';
      
      // Reload the page to force re-authentication
      window.location.reload();
    }
  };

  const handleInitializeData = async () => {
    try {
      toast.info('Initializing data from bookings-data.json...');
      const response = await adminPost('/api/admin/init-data');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      const result = await response.json();
      toast.success(`✅ Initialized with ${result.count} bookings`);
      
      // Reload bookings to show the new data
      await loadBookings();
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Failed to initialize data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteAllBookings = async () => {
    console.log('[AdminDashboard] Delete All clicked, showing dialog');
    setShowDeleteConfirm(true);
    console.log('[AdminDashboard] showDeleteConfirm set to:', true);
  };

  const confirmDeleteAll = async () => {
    console.log('[AdminDashboard] Confirm delete, text entered:', deleteConfirmText);
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setShowDeleteConfirm(false);
    setDeleteConfirmText('');

    try {
      toast.info('Deleting all bookings...');
      const response = await adminDelete('/api/admin/bookings/delete-all');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      const result = await response.json();
      
      // Check KV directly after deletion
      const debugResponse = await adminGet('/api/admin/debug-kv-bookings');
      if (debugResponse.ok) {
        const debugResult = await debugResponse.json();
        console.log('[After Delete] KV contains:', debugResult.bookingsCount, 'bookings');
        toast.success(`✅ ${result.message} | KV now has: ${debugResult.bookingsCount} bookings`);
      } else {
        toast.success(`✅ ${result.message}`);
      }
      
      // Reload bookings to show empty list
      await loadBookings();
    } catch (error) {
      console.error('Error deleting bookings:', error);
      toast.error('Failed to delete bookings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleLoadTestData = async () => {
    if (!confirm('Load test bookings from data/bookings.json into KV storage?')) {
      return;
    }

    try {
      toast.info('Loading test data...');
      const response = await adminPost('/api/admin/load-test-data');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      const result = await response.json();
      toast.success(`✅ Loaded ${result.count} test bookings`);
      
      // Reload bookings to show the new data
      await loadBookings();
    } catch (error) {
      console.error('Error loading test data:', error);
      toast.error('Failed to load test data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDebugKV = async () => {
    try {
      toast.info('Checking KV storage...');
      const response = await adminGet('/api/admin/debug-kv-bookings');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      const result = await response.json();
      toast.success(`KV Storage: ${result.bookingsCount} bookings found`);
      console.log('[Debug KV]', result);
    } catch (error) {
      console.error('Error debugging KV:', error);
      toast.error('Failed to debug KV: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const loadBookings = async () => {
    try {
      console.log('[AdminDashboard] Loading bookings...');
      const response = await adminGet('/api/admin/bookings');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AdminDashboard] Error response:', errorText);
        throw new Error('Failed to load bookings');
      }
      
      const data = await response.json();
      console.log('[AdminDashboard] Received data:', data);
      
      setBookings(data);
      calculateStats(data);
      console.log('[AdminDashboard] Loaded bookings:', data.length);
    } catch (error) {
      console.error('[AdminDashboard] Error loading bookings:', error);
      toast.error('Failed to load bookings');
    }
  };

  const loadRates = async () => {
    // Rates are loaded by the RatesManager component
    console.log('[AdminDashboard] Rates will be loaded by RatesManager component');
  };

  const loadBookingRules = async () => {
    // Booking rules are loaded by the BookingRulesManager component
    console.log('[AdminDashboard] Booking rules will be loaded by BookingRulesManager component');
  };

  const calculateStats = (bookingsData: Booking[]) => {
    const now = new Date();
    const upcoming = bookingsData.filter(b => new Date(b.checkIn) > now);
    const confirmed = bookingsData.filter(b => b.status === 'confirmed');
    const pending = bookingsData.filter(b => b.status === 'pending');
    const cancelled = bookingsData.filter(b => b.status === 'cancelled');
    
    const totalRevenue = confirmed.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const pendingRevenue = pending.reduce((sum, b) => sum + (b.totalDue || 0), 0);
    
    setStats({
      total: bookingsData.length,
      confirmed: confirmed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      upcoming: upcoming.length,
      totalRevenue,
      pendingRevenue
    });
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

  const handleLoadFromGitHub = async () => {
    if (!confirm('This will load all data from the GitHub repository files (rates, booking rules, and bookings) into KV storage. All slugs will be normalized to lowercase. Continue?')) {
      return;
    }

    setIsLoadingFromGitHub(true);
    try {
      const sessionId = localStorage.getItem('admin_session');
      const response = await fetch(`${baseUrl}/api/admin/load-from-github`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionId || ''}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load data from GitHub');
      }

      const result = await response.json();
      toast.success(`Successfully loaded: ${result.summary.rates} rates, ${result.summary.bookingRules} rules, ${result.summary.bookings} bookings`);
    } catch (error) {
      console.error('Load from GitHub error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsLoadingFromGitHub(false);
    }
  };

  useEffect(() => {
    loadBookings();
    loadRates();
    loadBookingRules();

    // DISABLED: Auto-initialization was causing bookings to be reloaded on every login
    // This prevented the delete-all function from working properly
    /*
    const initializeData = async () => {
      try {
        // Wait a bit for token to be set in localStorage after login
        const token = localStorage.getItem('admin_session');
        
        if (!token) {
          console.log('[AdminDashboard] No token available yet, skipping data initialization');
          return;
        }
        
        console.log('[AdminDashboard] Initializing data with token');
        const response = await adminPost('/api/admin/init-data');
        
        if (response.ok) {
          const result = await response.json();
          console.log('[AdminDashboard] Data initialized:', result);
        }
      } catch (error) {
        console.error('[AdminDashboard] Failed to initialize data:', error);
      }
    };

    // Small delay to ensure token is set after login
    const timer = setTimeout(initializeData, 100);
    return () => clearTimeout(timer);
    */
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Debug indicator */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: 'red',
          color: 'white',
          padding: '10px',
          zIndex: 99999,
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          DIALOG STATE: TRUE
        </div>
      )}
      
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="opacity-90">Manage bookings and view calendar</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleInitializeData}
              >
                📥 Initialize Data
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleLoadFromGitHub}
                disabled={isLoadingFromGitHub}
              >
                {isLoadingFromGitHub ? 'Loading...' : '📂 Load from GitHub'}
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => loadBookings()}
                disabled={isLoadingBookings}
              >
                {isLoadingBookings ? 'Refreshing...' : '🔄 Refresh'}
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDeleteAllBookings}
              >
                🗑️ Delete All
              </Button>
              <Button onClick={handleLoadTestData} variant="outline" size="sm">
                📦 Load Test Data
              </Button>
              <Button onClick={handleDebugKV} variant="outline" size="sm">
                🔍 Debug KV
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                🚪 Logout
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
                  onRefresh={() => loadBookings()}
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
                {loadedTabs.has('create') && <CreateBookingForm onSuccess={() => loadBookings()} />}
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
                {loadedTabs.has('import') && <BookingsImporter onImportComplete={() => loadBookings()} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={(e) => {
            // Close if clicking the backdrop
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(false);
              setDeleteConfirmText('');
            }
          }}
        >
          <div 
            className="rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4"
            style={{ backgroundColor: 'white', color: 'black' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold" style={{ color: '#dc2626' }}>⚠️ Delete All Bookings</h2>
            <p style={{ color: '#374151' }}>
              This will permanently delete <strong>ALL {stats.total} bookings</strong> from the system.
            </p>
            <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>
              This action CANNOT be undone!
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium block" style={{ color: '#111827' }}>
                Type <code style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', color: '#dc2626' }}>DELETE</code> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: 'black',
                  fontSize: '16px'
                }}
                placeholder="Type DELETE here"
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('[AdminDashboard] Cancel clicked');
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteAll}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Delete All Bookings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}








































































