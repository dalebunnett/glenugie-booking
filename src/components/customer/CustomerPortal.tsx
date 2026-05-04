import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { baseUrl } from '../../lib/base-url';
import type { Booking } from '../../lib/booking-types';

interface CustomerSession {
  sessionId: string;
  customer: {
    id: string;
    email: string;
    name: string;
    phone: string;
  };
}

export default function CustomerPortal() {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Login/Register Form States
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Load bookings when session exists
  useEffect(() => {
    if (session) {
      loadBookings();
    }
  }, [session]);

  const checkSession = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/customer/profile`, {
        credentials: 'include'
      });

      if (response.ok) {
        const customer = await response.json();
        setSession({
          sessionId: 'cookie',
          customer
        });
      }
    } catch (err) {
      console.error('Session check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    if (!session) return;

    try {
      const response = await fetch(`${baseUrl}/api/bookings`, {
        credentials: 'include'
      });

      if (response.ok) {
        const allBookings = await response.json();
        // Filter bookings by customer email
        const customerBookings = allBookings.filter(
          (b: Booking) => b.customerEmail === session.customer.email
        );
        setBookings(customerBookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? 'PUT' : 'POST';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${baseUrl}/api/customer/auth`, {
        method: endpoint,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSession(data);
      setFormData({ email: '', password: '', name: '', phone: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${baseUrl}/api/customer/auth`, {
        method: 'DELETE',
        credentials: 'include'
      });
      setSession(null);
      setBookings([]);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getAccommodationName = (type: string) => {
    const names: Record<string, string> = {
      'luxury-suite': 'Luxury Suite',
      'cattery': 'Cattery Suite',
      'ruffs-retreat': "Ruff's Retreat",
      'village': 'The Village'
    };
    return names[type] || type;
  };

  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Login/Register Form
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {isLogin ? 'Customer Login' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-center">
                {isLogin
                  ? 'Access your booking history and manage reservations'
                  : 'Register to view and manage your bookings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    {isLogin
                      ? "Don't have an account? Register"
                      : 'Already have an account? Login'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Customer Dashboard
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading text-primary">
              Welcome back, {session.customer.name}
            </h1>
            <p className="text-muted-foreground">{session.customer.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    You don't have any bookings yet.
                  </p>
                  <Button asChild>
                    <a href={`${baseUrl}/booking`}>Make a Booking</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {getAccommodationName(booking.accommodationType)}
                        </CardTitle>
                        <CardDescription>
                          Booking ID: {booking.id}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Status
                        </div>
                        <div className="font-semibold capitalize">
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Check-in
                        </div>
                        <div className="font-semibold">
                          {formatDate(booking.checkIn)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Check-out
                        </div>
                        <div className="font-semibold">
                          {formatDate(booking.checkOut)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Pets
                        </div>
                        <div className="font-semibold">
                          {booking.pets.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Total
                        </div>
                        <div className="font-semibold">
                          £{booking.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Pets
                      </div>
                      <div className="space-y-1">
                        {booking.pets.map((pet, index) => (
                          <div
                            key={index}
                            className="text-sm bg-muted px-3 py-2 rounded"
                          >
                            {pet.name} - {pet.breed} ({pet.type})
                          </div>
                        ))}
                      </div>
                    </div>

                    {booking.specialRequirements && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Special Requirements
                        </div>
                        <div className="text-sm">{booking.specialRequirements}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your contact details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <div className="mt-1 text-sm">{session.customer.name}</div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <div className="mt-1 text-sm">{session.customer.phone}</div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="mt-1 text-sm">{session.customer.email}</div>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    To update your profile information, please contact us.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
