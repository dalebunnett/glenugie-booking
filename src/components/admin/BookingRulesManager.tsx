import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { adminGet, adminPost } from '../../lib/admin-fetch';
import type { BookingRules } from '../../lib/booking-rules';
import { format } from 'date-fns';

export default function BookingRulesManager() {
  const [rules, setRules] = useState<BookingRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [generalValues, setGeneralValues] = useState({
    minAdvanceBookingDays: 1,
    maxAdvanceBookingDays: 365,
    minNights: 1,
    maxNights: 90,
    allowSameDayCheckInOut: false,
    cutoffTimeForSameDayBooking: 14
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[BookingRulesManager] Loading rules...');
      
      const response = await adminGet('/api/admin/booking-rules');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[BookingRulesManager] Failed to load rules:', response.status, errorText);
        throw new Error(`Failed to load booking rules: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[BookingRulesManager] Rules loaded:', data);
      setRules(data);
    } catch (err: any) {
      console.error('[BookingRulesManager] Error loading rules:', err);
      setError(err.message || 'Failed to load booking rules');
      
      // Try to initialize if rules are missing
      console.log('[BookingRulesManager] Attempting to initialize KV storage...');
      try {
        const initResponse = await fetch(`${baseUrl}/api/admin/init-kv`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
          }
        });
        
        if (initResponse.ok) {
          console.log('[BookingRulesManager] KV initialized, retrying...');
          // Retry loading rules
          setTimeout(() => loadRules(), 1000);
        }
      } catch (initErr) {
        console.error('[BookingRulesManager] Failed to initialize KV:', initErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralRules = async () => {
    setSaving(true);
    try {
      const sessionId = localStorage.getItem('admin_session');
      const response = await fetch(`${baseUrl}/api/admin/booking-rules`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId || ''}`
        },
        credentials: 'include',
        body: JSON.stringify(generalValues)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save rules');
      }

      const data = await response.json();
      setRules(data.rules);
      setEditingGeneral(false);
      toast.success('Booking rules updated successfully');
    } catch (error) {
      console.error('Error saving rules:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save rules');
    } finally {
      setSaving(false);
    }
  };

  const startEditingGeneral = () => {
    if (rules) {
      setGeneralValues({
        minAdvanceBookingDays: rules.minAdvanceBookingDays,
        maxAdvanceBookingDays: rules.maxAdvanceBookingDays,
        minNights: rules.minNights,
        maxNights: rules.maxNights,
        allowSameDayCheckInOut: Boolean(rules.allowSameDayCheckInOut),
        cutoffTimeForSameDayBooking: rules.cutoffTimeForSameDayBooking
      });
    }
    setEditingGeneral(true);
  };

  const cancelEditingGeneral = () => {
    setEditingGeneral(false);
    if (rules) {
      setGeneralValues({
        minAdvanceBookingDays: rules.minAdvanceBookingDays,
        maxAdvanceBookingDays: rules.maxAdvanceBookingDays,
        minNights: rules.minNights,
        maxNights: rules.maxNights,
        allowSameDayCheckInOut: Boolean(rules.allowSameDayCheckInOut),
        cutoffTimeForSameDayBooking: rules.cutoffTimeForSameDayBooking
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking rules...</p>
        </div>
      </div>
    );
  }

  if (!rules) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load rules. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>General Booking Rules</CardTitle>
              <CardDescription>Core booking requirements and restrictions</CardDescription>
            </div>
            {!editingGeneral && (
              <Button variant="outline" size="sm" onClick={startEditingGeneral}>
                Edit Rules
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Minimum Advance Booking</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input 
                  type="number" 
                  value={editingGeneral ? generalValues.minAdvanceBookingDays : rules.minAdvanceBookingDays}
                  onChange={(e) => editingGeneral && setGeneralValues(prev => ({
                    ...prev,
                    minAdvanceBookingDays: parseInt(e.target.value) || 0
                  }))}
                  disabled={!editingGeneral}
                  className="max-w-24"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Customers must book at least this many days ahead
              </p>
            </div>

            <div>
              <Label>Maximum Advance Booking</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input 
                  type="number" 
                  value={editingGeneral ? generalValues.maxAdvanceBookingDays : rules.maxAdvanceBookingDays}
                  onChange={(e) => editingGeneral && setGeneralValues(prev => ({
                    ...prev,
                    maxAdvanceBookingDays: parseInt(e.target.value) || 0
                  }))}
                  disabled={!editingGeneral}
                  className="max-w-24"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Can book up to this many days in advance
              </p>
            </div>

            <div>
              <Label>Minimum Stay</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input 
                  type="number" 
                  value={editingGeneral ? generalValues.minNights : rules.minNights}
                  onChange={(e) => editingGeneral && setGeneralValues(prev => ({
                    ...prev,
                    minNights: parseInt(e.target.value) || 0
                  }))}
                  disabled={!editingGeneral}
                  className="max-w-24"
                />
                <span className="text-sm text-muted-foreground">nights</span>
              </div>
            </div>

            <div>
              <Label>Maximum Stay</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input 
                  type="number" 
                  value={editingGeneral ? generalValues.maxNights : rules.maxNights}
                  onChange={(e) => editingGeneral && setGeneralValues(prev => ({
                    ...prev,
                    maxNights: parseInt(e.target.value) || 0
                  }))}
                  disabled={!editingGeneral}
                  className="max-w-24"
                />
                <span className="text-sm text-muted-foreground">nights</span>
              </div>
            </div>

            <div>
              <Label>Same-Day Check-In/Out</Label>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={editingGeneral ? generalValues.allowSameDayCheckInOut : Boolean(rules.allowSameDayCheckInOut)}
                  onCheckedChange={(checked) => editingGeneral && setGeneralValues(prev => ({
                    ...prev,
                    allowSameDayCheckInOut: checked
                  }))}
                  disabled={!editingGeneral}
                />
                <Badge variant={(editingGeneral ? generalValues.allowSameDayCheckInOut : Boolean(rules.allowSameDayCheckInOut)) ? "default" : "secondary"}>
                  {(editingGeneral ? generalValues.allowSameDayCheckInOut : Boolean(rules.allowSameDayCheckInOut)) ? 'Allowed' : 'Not Allowed'}
                </Badge>
              </div>
            </div>

            <div>
              <Label>Same-Day Booking Cutoff</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input 
                  type="number" 
                  min="0"
                  max="23"
                  value={editingGeneral ? generalValues.cutoffTimeForSameDayBooking : rules.cutoffTimeForSameDayBooking}
                  onChange={(e) => editingGeneral && setGeneralValues(prev => ({
                    ...prev,
                    cutoffTimeForSameDayBooking: parseInt(e.target.value) || 0
                  }))}
                  disabled={!editingGeneral}
                  className="max-w-24"
                />
                <span className="text-sm text-muted-foreground">:00 (24h format)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                No same-day bookings after this time
              </p>
            </div>
          </div>

          {editingGeneral && (
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={saveGeneralRules} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={cancelEditingGeneral} disabled={saving}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
          <CardDescription>Dates when bookings are not allowed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Specific Blocked Dates</Label>
            <div className="flex flex-wrap gap-2">
              {rules.blockedDates && rules.blockedDates.length > 0 ? (
                rules.blockedDates.map((dateStr, index) => (
                  <Badge key={index} variant="destructive">
                    {format(new Date(dateStr), 'MMM d, yyyy')}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No specific blocked dates</p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Blocked Date Ranges</Label>
            {rules.blockedDateRanges && rules.blockedDateRanges.length > 0 ? (
              <div className="space-y-2">
                {rules.blockedDateRanges.map((range, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {format(new Date(range.start), 'MMM d, yyyy')} - {format(new Date(range.end), 'MMM d, yyyy')}
                    </Badge>
                    {range.reason && (
                      <span className="text-sm text-muted-foreground">({range.reason})</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No blocked date ranges</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Peak Season Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Season Rules</CardTitle>
          <CardDescription>Special minimum stay requirements during peak periods</CardDescription>
        </CardHeader>
        <CardContent>
          {rules.peakSeasonDates && rules.peakSeasonDates.length > 0 ? (
            <div className="space-y-3">
              {rules.peakSeasonDates.map((peak, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">
                        {format(new Date(peak.start), 'MMM d, yyyy')} - {format(new Date(peak.end), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Minimum stay: {peak.minNights || rules.minNights} {(peak.minNights || rules.minNights) === 1 ? 'night' : 'nights'}
                      </div>
                    </div>
                    <Badge>Peak Season</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No peak season rules configured</p>
          )}
        </CardContent>
      </Card>

      {/* Day Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Day of Week Restrictions</CardTitle>
          <CardDescription>Allowed check-in and check-out days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Allowed Check-In Days</Label>
            {rules.allowedCheckInDays && rules.allowedCheckInDays.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {rules.allowedCheckInDays.map((day) => (
                  <Badge key={day}>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]}
                  </Badge>
                ))}
              </div>
            ) : (
              <Badge variant="secondary">All days allowed</Badge>
            )}
          </div>

          <div>
            <Label className="mb-2 block">Allowed Check-Out Days</Label>
            {rules.allowedCheckOutDays && rules.allowedCheckOutDays.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {rules.allowedCheckOutDays.map((day) => (
                  <Badge key={day}>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]}
                  </Badge>
                ))}
              </div>
            ) : (
              <Badge variant="secondary">All days allowed</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}








