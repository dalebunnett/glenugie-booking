
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import BookingsList from './BookingsList';
import RatesManager from './RatesManager';
import BookingRulesManager from './BookingRulesManager';
import BookingsCalendar from './BookingsCalendar';
import CreateBookingForm from './CreateBookingForm';
import BookingsImporter from './BookingsImporter';
import MonthlyAvailabilityCalendar from './MonthlyAvailabilityCalendar';
import IndividualKennelCalendar from './IndividualKennelCalendar';
import { baseUrl } from '../../lib/base-url';
import {
  Calendar,
  DollarSign,
  Settings,
  List,
  PlusCircle,
  Upload,
  LayoutGrid,
  CalendarDays,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    activeBookings: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/bookings`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Ensure we have an array
        if (!Array.isArray(data)) {
          console.error('Expected array of bookings, got:', typeof data);
          setStats({
            totalBookings: 0,
            upcomingBookings: 0,
            activeBookings: 0,
            revenue: 0
          });
          return;
        }
        
        const bookings = data;
        const now = new Date();
        
        const upcoming = bookings.filter((b: any) => 
          new Date(b.checkInDate) > now
        ).length;
        
        const active = bookings.filter((b: any) => {
          const checkIn = new Date(b.checkInDate);
          const checkOut = new Date(b.checkOutDate);
          return checkIn <= now && checkOut >= now;
        }).length;
        
        const totalRevenue = bookings.reduce((sum: number, b: any) => 
          sum + (b.totalPrice || 0), 0
        );
        
        setStats({
          totalBookings: bookings.length,
          upcomingBookings: upcoming,
          activeBookings: active,
          revenue: totalRevenue
        });
      } else {
        console.error('Failed to fetch bookings:', response.status);
        setStats({
          totalBookings: 0,
          upcomingBookings: 0,
          activeBookings: 0,
          revenue: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'bookings', label: 'All Bookings', icon: List },
    { id: 'create', label: 'Create Booking', icon: PlusCircle },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'monthly', label: 'Monthly View', icon: CalendarDays },
    { id: 'kennels', label: 'Kennel Calendar', icon: LayoutGrid },
    { id: 'import', label: 'Import Bookings', icon: Upload },
    { id: 'rates', label: 'Manage Rates', icon: DollarSign },
    { id: 'rules', label: 'Booking Rules', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-card border-r border-border transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-primary" style={{ fontFamily: 'var(--heading-font)' }}>
            Admin Panel
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Glenugie Kennels</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your bookings and settings
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <List className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalBookings}</div>
                    <p className="text-xs text-muted-foreground">All time bookings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
                    <p className="text-xs text-muted-foreground">Future check-ins</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeBookings}</div>
                    <p className="text-xs text-muted-foreground">Currently staying</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">£{stats.revenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">All time revenue</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => setActiveTab('create')}
                      className="h-auto py-6 flex flex-col gap-2"
                    >
                      <PlusCircle className="w-6 h-6" />
                      <span>Create New Booking</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab('calendar')}
                      variant="outline"
                      className="h-auto py-6 flex flex-col gap-2"
                    >
                      <Calendar className="w-6 h-6" />
                      <span>View Calendar</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab('bookings')}
                      variant="outline"
                      className="h-auto py-6 flex flex-col gap-2"
                    >
                      <List className="w-6 h-6" />
                      <span>View All Bookings</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Bookings Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest booking activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingsList limit={5} />
                  <div className="mt-4">
                    <Button
                      onClick={() => setActiveTab('bookings')}
                      variant="outline"
                      className="w-full"
                    >
                      View All Bookings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bookings List Tab */}
          {activeTab === 'bookings' && (
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>View and manage all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingsList />
              </CardContent>
            </Card>
          )}

          {/* Create Booking Tab */}
          {activeTab === 'create' && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Booking</CardTitle>
                <CardDescription>Add a new booking to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateBookingForm onSuccess={() => setActiveTab('bookings')} />
              </CardContent>
            </Card>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>Visual overview of all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingsCalendar />
              </CardContent>
            </Card>
          )}

          {/* Monthly View Tab */}
          {activeTab === 'monthly' && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Availability</CardTitle>
                <CardDescription>Month-by-month availability overview</CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyAvailabilityCalendar />
              </CardContent>
            </Card>
          )}

          {/* Kennel Calendar Tab */}
          {activeTab === 'kennels' && (
            <Card>
              <CardHeader>
                <CardTitle>Individual Kennel Calendar</CardTitle>
                <CardDescription>View bookings for each kennel</CardDescription>
              </CardHeader>
              <CardContent>
                <IndividualKennelCalendar />
              </CardContent>
            </Card>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <Card>
              <CardHeader>
                <CardTitle>Import Bookings</CardTitle>
                <CardDescription>Bulk import bookings from JSON</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingsImporter />
              </CardContent>
            </Card>
          )}

          {/* Rates Tab */}
          {activeTab === 'rates' && (
            <Card>
              <CardHeader>
                <CardTitle>Manage Rates</CardTitle>
                <CardDescription>Configure pricing for accommodations</CardDescription>
              </CardHeader>
              <CardContent>
                <RatesManager />
              </CardContent>
            </Card>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Rules</CardTitle>
                <CardDescription>Configure booking restrictions and rules</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingRulesManager />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

