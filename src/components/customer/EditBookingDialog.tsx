import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { baseUrl } from '../../lib/base-url';
import type { Booking, AccommodationType } from '../../lib/booking-types';
import { LUXURY_SUITES, CATTERY_SUITES } from '../../lib/booking-types';

interface EditBookingDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedBooking: Booking) => void;
}

export default function EditBookingDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: EditBookingDialogProps) {
  const [formData, setFormData] = useState({
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    accommodationType: booking.accommodationType,
    specificSuite: booking.specificSuite || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  const checkAvailability = async () => {
    if (!formData.checkIn || !formData.checkOut) return;

    setCheckingAvailability(true);
    setAvailabilityMessage('');

    try {
      const params = new URLSearchParams({
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        accommodationType: formData.accommodationType,
        excludeBookingId: booking.id, // Exclude current booking from availability check
      });

      if (formData.specificSuite) {
        params.append('specificSuite', formData.specificSuite);
      }

      const response = await fetch(`${baseUrl}/api/availability/check?${params}`);
      const data = await response.json();

      if (data.available) {
        setAvailabilityMessage('✓ Available for these dates');
      } else {
        setAvailabilityMessage(`✗ ${data.message || 'Not available'}`);
        setError('Selected dates are not available');
      }
    } catch (err) {
      setAvailabilityMessage('Failed to check availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      checkAvailability();
    }
  }, [formData.checkIn, formData.checkOut, formData.accommodationType, formData.specificSuite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Calculate new number of nights
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const numberOfNights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate new price (simplified - you may want to fetch from API)
      let pricePerNight = 20; // default
      if (formData.accommodationType === 'luxury-suite') pricePerNight = 25;
      else if (formData.accommodationType === 'cattery') pricePerNight = 15;

      const totalPrice = pricePerNight * numberOfNights * booking.pets.length;

      const response = await fetch(`${baseUrl}/api/customer/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          numberOfNights,
          totalPrice,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update booking');
      }

      const updatedBooking = await response.json();
      onSuccess(updatedBooking);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const getSuiteOptions = () => {
    if (formData.accommodationType === 'luxury-suite') {
      return LUXURY_SUITES;
    } else if (formData.accommodationType === 'cattery') {
      return CATTERY_SUITES;
    }
    return [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Change your booking dates or accommodation type
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in Date *</Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out Date *</Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                min={formData.checkIn}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="accommodationType">Accommodation Type *</Label>
              <Select
                value={formData.accommodationType}
                onValueChange={(value: AccommodationType) =>
                  setFormData({ ...formData, accommodationType: value, specificSuite: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="luxury-suite">Luxury Dog Suite (£25/night)</SelectItem>
                  <SelectItem value="ruffs-retreat">Ruff's Retreat (£20/night)</SelectItem>
                  <SelectItem value="village">The Village (£20/night)</SelectItem>
                  <SelectItem value="cattery">Cattery Suite (£15/night)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.accommodationType === 'luxury-suite' || formData.accommodationType === 'cattery') && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="specificSuite">Specific Suite (Optional)</Label>
                <Select
                  value={formData.specificSuite}
                  onValueChange={(value) => setFormData({ ...formData, specificSuite: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any available suite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any available suite</SelectItem>
                    {getSuiteOptions().map((suite) => (
                      <SelectItem key={suite.value} value={suite.value}>
                        {suite.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {checkingAvailability && (
            <div className="text-sm text-muted-foreground">
              Checking availability...
            </div>
          )}

          {availabilityMessage && (
            <div
              className={`text-sm px-4 py-2 rounded ${
                availabilityMessage.startsWith('✓')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {availabilityMessage}
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded text-sm">
            <strong>Note:</strong> Price changes will be calculated based on new dates and accommodation type.
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || checkingAvailability || availabilityMessage.startsWith('✗')}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
