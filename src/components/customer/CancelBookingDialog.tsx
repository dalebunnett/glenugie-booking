import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { baseUrl } from '../../lib/base-url';
import type { Booking } from '../../lib/booking-types';

interface CancelBookingDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CancelBookingDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: CancelBookingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refundInfo, setRefundInfo] = useState<{
    percentage: number;
    amount: number;
    policy: string;
  } | null>(null);

  // Calculate refund policy
  const calculateRefund = () => {
    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    const daysUntilCheckIn = Math.ceil(
      (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    let percentage = 0;
    let policy = '';

    if (daysUntilCheckIn >= 14) {
      percentage = 100;
      policy = 'Full refund (14+ days notice)';
    } else if (daysUntilCheckIn >= 7) {
      percentage = 50;
      policy = '50% refund (7-13 days notice)';
    } else {
      percentage = 0;
      policy = 'No refund (less than 7 days notice)';
    }

    const amount = (booking.paidAmount || 0) * (percentage / 100);

    return { percentage, amount, policy, daysUntilCheckIn };
  };

  const refund = calculateRefund();

  const handleCancel = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/customer/bookings/${booking.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel booking');
      }

      const data = await response.json();
      setRefundInfo(data.refund);
      
      // Wait a moment to show refund info, then close
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking?
          </DialogDescription>
        </DialogHeader>

        {!refundInfo ? (
          <div className="space-y-4">
            {/* Booking Details */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Booking ID:</span>
                <span className="text-sm font-medium">{booking.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Check-in:</span>
                <span className="text-sm font-medium">
                  {new Date(booking.checkIn).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Check-out:</span>
                <span className="text-sm font-medium">
                  {new Date(booking.checkOut).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pets:</span>
                <span className="text-sm font-medium">
                  {booking.pets.map((p) => p.name).join(', ')}
                </span>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="border-l-4 border-primary bg-primary/5 p-4 rounded">
              <h4 className="font-semibold mb-2">Cancellation Policy</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Days until check-in:</span>
                  <span className="font-medium">{refund.daysUntilCheckIn} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Refund percentage:</span>
                  <span className="font-medium">{refund.percentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount paid:</span>
                  <span className="font-medium">£{(booking.paidAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t">
                  <span>Refund amount:</span>
                  <span className="text-primary">£{refund.amount.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{refund.policy}</p>
            </div>

            {/* Refund Policy Details */}
            <div className="bg-blue-50 text-blue-900 p-3 rounded text-xs space-y-1">
              <p><strong>Refund Policy:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>14+ days notice: 100% refund</li>
                <li>7-13 days notice: 50% refund</li>
                <li>Less than 7 days: No refund</li>
              </ul>
              <p className="mt-2">Refunds will be processed within 5-7 business days.</p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Keep Booking
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-900 p-4 rounded-lg text-center">
              <h3 className="font-semibold text-lg mb-2">Booking Cancelled</h3>
              <p className="text-sm mb-3">Your booking has been successfully cancelled.</p>
              <div className="bg-white p-3 rounded">
                <p className="text-xs text-muted-foreground mb-1">Refund Amount</p>
                <p className="text-2xl font-bold text-green-700">
                  £{refundInfo.amount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{refundInfo.policy}</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              This window will close automatically...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
