import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { adminGet, adminPost } from '../../lib/admin-fetch';
import type { BookingRules } from '../../lib/booking-rules';
import { format } from 'date-fns';
import { baseUrl } from '../../lib/base-url';

export default function BookingRulesManager() {
  const [rules, setRules] = useState<BookingRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingGeneral, setEditingGeneral] = useState(false);
  const [editingPeakSeason, setEditingPeakSeason] = useState(false);
  const [editingBlockedDates, setEditingBlockedDates] = useState(false);
  const [editingDayRestrictions, setEditingDayRestrictions] = useState(false);
  const [editingCancellation, setEditingCancellation] = useState(false);
  
  const [generalValues, setGeneralValues] = useState({
    minAdvanceBookingDays: 1,
    maxAdvanceBookingDays: 365,
    minNights: 1,
    maxNights: 90,
    allowSameDayCheckInOut: false,
    cutoffTimeForSameDayBooking: 14
  });

  const [peakSeasonValues, setpeakSeasonValues] = useState<Array<{
    start: string;
    end: string;
    minNights: number;
  }>>([]);

  const [blockedDatesValues, setBlockedDatesValues] = useState<{
    blockedDates: string[];
    blockedDateRanges: Array<{ start: string; end: string; reason?: string }>;
  }>({
    blockedDates: [],
    blockedDateRanges: []
  });

  const [dayRestrictionsValues, setDayRestrictionsValues] = useState<{
    allowedCheckInDays: number[];
    allowedCheckOutDays: number[];
  }>({
    allowedCheckInDays: [],
    allowedCheckOutDays: []
  });

  const [cancellationValues, setCancellationValues] = useState({
    fullRefundDays: 14,
    partialRefundDays: 7,
    partialRefundPercentage: 50
  });
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

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
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error('[BookingRulesManager] Error loading rules:', err);
      setError(err.message || 'Failed to load booking rules');
      
      // Only try to initialize once, don't retry infinitely
      if (retryCount < MAX_RETRIES) {
        console.log('[BookingRulesManager] Attempting to initialize KV storage... (attempt', retryCount + 1, 'of', MAX_RETRIES, ')');
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
            setRetryCount(prev => prev + 1);
            // Retry loading rules after a delay
            setTimeout(() => loadRules(), 1000);
          } else {
            console.error('[BookingRulesManager] Failed to initialize KV');
          }
        } catch (initErr) {
          console.error('[BookingRulesManager] Failed to initialize KV:', initErr);
        }
      } else {
        console.error('[BookingRulesManager] Max retries reached, giving up');
        toast.error('Failed to load booking rules. Please refresh the page.');
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

  const startEditingPeakSeason = () => {
    if (rules) {
      setpeakSeasonValues(rules.peakSeasonDates || []);
    }
    setEditingPeakSeason(true);
  };

  const savePeakSeason = async () => {
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
        body: JSON.stringify({ peakSeasonDates: peakSeasonValues })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save peak season rules');
      }

      const data = await response.json();
      setRules(data.rules);
      setEditingPeakSeason(false);
      toast.success('Peak season rules updated successfully');
    } catch (error) {
      console.error('Error saving peak season:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save peak season rules');
    } finally {
      setSaving(false);
    }
  };

  const startEditingBlockedDates = () => {
    if (rules) {
      setBlockedDatesValues({
        blockedDates: rules.blockedDates || [],
        blockedDateRanges: rules.blockedDateRanges || []
      });
    }
    setEditingBlockedDates(true);
  };

  const saveBlockedDates = async () => {
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
        body: JSON.stringify(blockedDatesValues)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save blocked dates');
      }

      const data = await response.json();
      setRules(data.rules);
      setEditingBlockedDates(false);
      toast.success('Blocked dates updated successfully');
    } catch (error) {
      console.error('Error saving blocked dates:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save blocked dates');
    } finally {
      setSaving(false);
    }
  };

  const startEditingDayRestrictions = () => {
    if (rules) {
      setDayRestrictionsValues({
        allowedCheckInDays: rules.allowedCheckInDays || [],
        allowedCheckOutDays: rules.allowedCheckOutDays || []
      });
    }
    setEditingDayRestrictions(true);
  };

  const saveDayRestrictions = async () => {
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
        body: JSON.stringify(dayRestrictionsValues)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save day restrictions');
      }

      const data = await response.json();
      setRules(data.rules);
      setEditingDayRestrictions(false);
      toast.success('Day restrictions updated successfully');
    } catch (error) {
      console.error('Error saving day restrictions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save day restrictions');
    } finally {
      setSaving(false);
    }
  };

  const startEditingCancellation = () => {
    if (rules) {
      setCancellationValues({
        fullRefundDays: rules.fullRefundDays || 14,
        partialRefundDays: rules.partialRefundDays || 7,
        partialRefundPercentage: rules.partialRefundPercentage || 50
      });
    }
    setEditingCancellation(true);
  };

  const saveCancellation = async () => {
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
        body: JSON.stringify(cancellationValues)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save cancellation policy');
      }

      const data = await response.json();
      setRules(data.rules);
      setEditingCancellation(false);
      toast.success('Cancellation policy updated successfully');
    } catch (error) {
      console.error('Error saving cancellation policy:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save cancellation policy');
    } finally {
      setSaving(false);
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
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Blocked Dates</CardTitle>
              <CardDescription>Dates when bookings are not allowed</CardDescription>
            </div>
            {!editingBlockedDates && (
              <Button variant="outline" size="sm" onClick={startEditingBlockedDates}>
                Edit Blocked Dates
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Specific Blocked Dates</Label>
            {editingBlockedDates ? (
              <div className="space-y-2">
                {blockedDatesValues.blockedDates.map((date, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        const newDates = [...blockedDatesValues.blockedDates];
                        newDates[index] = e.target.value;
                        setBlockedDatesValues({ ...blockedDatesValues, blockedDates: newDates });
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newDates = blockedDatesValues.blockedDates.filter((_, i) => i !== index);
                        setBlockedDatesValues({ ...blockedDatesValues, blockedDates: newDates });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBlockedDatesValues({
                      ...blockedDatesValues,
                      blockedDates: [...blockedDatesValues.blockedDates, new Date().toISOString().split('T')[0]]
                    });
                  }}
                >
                  + Add Date
                </Button>
              </div>
            ) : (
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
            )}
          </div>

          <div>
            <Label className="mb-2 block">Blocked Date Ranges</Label>
            {editingBlockedDates ? (
              <div className="space-y-2">
                {blockedDatesValues.blockedDateRanges.map((range, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={range.start}
                      onChange={(e) => {
                        const newRanges = [...blockedDatesValues.blockedDateRanges];
                        newRanges[index].start = e.target.value;
                        setBlockedDatesValues({ ...blockedDatesValues, blockedDateRanges: newRanges });
                      }}
                    />
                    <span>to</span>
                    <Input
                      type="date"
                      value={range.end}
                      onChange={(e) => {
                        const newRanges = [...blockedDatesValues.blockedDateRanges];
                        newRanges[index].end = e.target.value;
                        setBlockedDatesValues({ ...blockedDatesValues, blockedDateRanges: newRanges });
                      }}
                    />
                    <Input
                      placeholder="Reason (optional)"
                      value={range.reason || ''}
                      onChange={(e) => {
                        const newRanges = [...blockedDatesValues.blockedDateRanges];
                        newRanges[index].reason = e.target.value;
                        setBlockedDatesValues({ ...blockedDatesValues, blockedDateRanges: newRanges });
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newRanges = blockedDatesValues.blockedDateRanges.filter((_, i) => i !== index);
                        setBlockedDatesValues({ ...blockedDatesValues, blockedDateRanges: newRanges });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setBlockedDatesValues({
                      ...blockedDatesValues,
                      blockedDateRanges: [...blockedDatesValues.blockedDateRanges, { start: today, end: today }]
                    });
                  }}
                >
                  + Add Range
                </Button>
              </div>
            ) : (
              rules.blockedDateRanges && rules.blockedDateRanges.length > 0 ? (
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
              )
            )}
          </div>

          {editingBlockedDates && (
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={saveBlockedDates} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditingBlockedDates(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Peak Season Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Peak Season Rules</CardTitle>
              <CardDescription>Special minimum stay requirements during peak periods</CardDescription>
            </div>
            {!editingPeakSeason && (
              <Button variant="outline" size="sm" onClick={startEditingPeakSeason}>
                Edit Peak Seasons
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingPeakSeason ? (
            <div className="space-y-4">
              {peakSeasonValues.map((peak, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={peak.start}
                        onChange={(e) => {
                          const newPeaks = [...peakSeasonValues];
                          newPeaks[index].start = e.target.value;
                          setpeakSeasonValues(newPeaks);
                        }}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={peak.end}
                        onChange={(e) => {
                          const newPeaks = [...peakSeasonValues];
                          newPeaks[index].end = e.target.value;
                          setpeakSeasonValues(newPeaks);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Minimum Nights</Label>
                      <Input
                        type="number"
                        min="1"
                        value={peak.minNights}
                        onChange={(e) => {
                          const newPeaks = [...peakSeasonValues];
                          newPeaks[index].minNights = parseInt(e.target.value) || 1;
                          setpeakSeasonValues(newPeaks);
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newPeaks = peakSeasonValues.filter((_, i) => i !== index);
                      setpeakSeasonValues(newPeaks);
                    }}
                  >
                    Remove Peak Season
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setpeakSeasonValues([
                    ...peakSeasonValues,
                    { start: today, end: today, minNights: 2 }
                  ]);
                }}
              >
                + Add Peak Season
              </Button>
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={savePeakSeason} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setEditingPeakSeason(false)} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            rules.peakSeasonDates && rules.peakSeasonDates.length > 0 ? (
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
            )
          )}
        </CardContent>
      </Card>

      {/* Day Restrictions */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Day of Week Restrictions</CardTitle>
              <CardDescription>Allowed check-in and check-out days</CardDescription>
            </div>
            {!editingDayRestrictions && (
              <Button variant="outline" size="sm" onClick={startEditingDayRestrictions}>
                Edit Day Restrictions
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Allowed Check-In Days</Label>
            {editingDayRestrictions ? (
              <div className="space-y-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`checkin-${index}`}
                      checked={dayRestrictionsValues.allowedCheckInDays.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDayRestrictionsValues({
                            ...dayRestrictionsValues,
                            allowedCheckInDays: [...dayRestrictionsValues.allowedCheckInDays, index].sort()
                          });
                        } else {
                          setDayRestrictionsValues({
                            ...dayRestrictionsValues,
                            allowedCheckInDays: dayRestrictionsValues.allowedCheckInDays.filter(d => d !== index)
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`checkin-${index}`} className="text-sm cursor-pointer">
                      {day}
                    </label>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">
                  Leave all unchecked to allow all days
                </p>
              </div>
            ) : (
              rules.allowedCheckInDays && rules.allowedCheckInDays.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {rules.allowedCheckInDays.map((day) => (
                    <Badge key={day}>
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]}
                    </Badge>
                  ))}
                </div>
              ) : (
                <Badge variant="secondary">All days allowed</Badge>
              )
            )}
          </div>

          <div>
            <Label className="mb-2 block">Allowed Check-Out Days</Label>
            {editingDayRestrictions ? (
              <div className="space-y-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`checkout-${index}`}
                      checked={dayRestrictionsValues.allowedCheckOutDays.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDayRestrictionsValues({
                            ...dayRestrictionsValues,
                            allowedCheckOutDays: [...dayRestrictionsValues.allowedCheckOutDays, index].sort()
                          });
                        } else {
                          setDayRestrictionsValues({
                            ...dayRestrictionsValues,
                            allowedCheckOutDays: dayRestrictionsValues.allowedCheckOutDays.filter(d => d !== index)
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`checkout-${index}`} className="text-sm cursor-pointer">
                      {day}
                    </label>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">
                  Leave all unchecked to allow all days
                </p>
              </div>
            ) : (
              rules.allowedCheckOutDays && rules.allowedCheckOutDays.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {rules.allowedCheckOutDays.map((day) => (
                    <Badge key={day}>
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]}
                    </Badge>
                  ))}
                </div>
              ) : (
                <Badge variant="secondary">All days allowed</Badge>
              )
            )}
          </div>

          {editingDayRestrictions && (
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={saveDayRestrictions} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditingDayRestrictions(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Cancellation Policy</CardTitle>
              <CardDescription>Refund rules for cancelled bookings</CardDescription>
            </div>
            {!editingCancellation && (
              <Button variant="outline" size="sm" onClick={startEditingCancellation}>
                Edit Policy
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Label className="mb-2 block">Full Refund Period</Label>
              {editingCancellation ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="90"
                      value={cancellationValues.fullRefundDays}
                      onChange={(e) => setCancellationValues({
                        ...cancellationValues,
                        fullRefundDays: parseInt(e.target.value) || 0
                      })}
                      className="max-w-24"
                    />
                    <span className="text-sm">days</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Days before check-in for 100% refund
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {rules.fullRefundDays || 14} days
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    100% refund if cancelled
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <Label className="mb-2 block">Partial Refund Period</Label>
              {editingCancellation ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="90"
                      value={cancellationValues.partialRefundDays}
                      onChange={(e) => setCancellationValues({
                        ...cancellationValues,
                        partialRefundDays: parseInt(e.target.value) || 0
                      })}
                      className="max-w-24"
                    />
                    <span className="text-sm">days</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Days before check-in for partial refund
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {rules.partialRefundDays || 7} days
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rules.partialRefundPercentage || 50}% refund if cancelled
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <Label className="mb-2 block">Partial Refund Amount</Label>
              {editingCancellation ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={cancellationValues.partialRefundPercentage}
                      onChange={(e) => setCancellationValues({
                        ...cancellationValues,
                        partialRefundPercentage: parseInt(e.target.value) || 0
                      })}
                      className="max-w-24"
                    />
                    <span className="text-sm">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Percentage refunded during partial period
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {rules.partialRefundPercentage || 50}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Of total booking amount
                  </p>
                </div>
              )}
            </div>
          </div>

          {!editingCancellation && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-start gap-2">
                <div className="text-green-600 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm">
                  Cancel {rules.fullRefundDays || 14}+ days before check-in: <strong>100% refund</strong>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-yellow-600 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm">
                  Cancel {rules.partialRefundDays || 7}-{rules.fullRefundDays || 14} days before: <strong>{rules.partialRefundPercentage || 50}% refund</strong>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-red-600 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-sm">
                  Cancel less than {rules.partialRefundDays || 7} days before: <strong>No refund</strong>
                </p>
              </div>
            </div>
          )}

          {editingCancellation && (
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={saveCancellation} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditingCancellation(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



















