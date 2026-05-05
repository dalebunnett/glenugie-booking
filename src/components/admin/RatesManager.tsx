import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { adminGet, adminPost } from '../../lib/admin-fetch';

interface RateCategory {
  basePrice: number;
  additionalPet: number;
}

interface PaymentSettings {
  depositAmount: number;
  fullPaymentDaysBefore: number;
}

interface Rates {
  luxurySuites: RateCategory;
  cattery: RateCategory;
  ruffsRetreat: RateCategory;
  theVillage: RateCategory;
  paymentSettings: PaymentSettings;
}

const CATEGORY_INFO = {
  luxurySuites: {
    name: 'Luxury Dog Suites',
    description: 'Premium suites with indoor/outdoor access',
    badge: '10 Suites',
    suites: [
      'Sniffany Suite', 'Woofdorf', 'Barkingham Palace', 'Nasherville',
      'Lapdog Land Suite', 'Huntington Manor Suite', 'Pawduree',
      'Furrari', 'Tail Away', 'The Fairy Dogmother'
    ]
  },
  cattery: {
    name: 'Glenugie Whiskers (Cattery)',
    description: '12 luxury themed rooms for cats',
    badge: '12 Rooms',
    rooms: [
      'Clawrence House',
      'Twitcher',
      'Pussy Porchens',
      'Ragdoll Ranch',
      'Bengal Bay',
      'Paws Palace',
      'Octopussy',
      'Catsby',
      'Whiskers Lounge',
      'Hairy Potter',
      'Chalet Cat',
      'Cleocatara'
    ]
  },
  ruffsRetreat: {
    name: "Ruff's Retreat",
    description: 'Standard kennels with outdoor runs',
    badge: '12 kennels'
  },
  theVillage: {
    name: 'The Village',
    description: 'Shared accommodation for social dogs',
    badge: '6 kennels'
  }
};

export default function RatesManager() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [editingCategory, setEditingCategory] = useState<keyof Rates | null>(null);
  const [editValues, setEditValues] = useState<RateCategory>({ basePrice: 0, additionalPet: 0 });
  const [editingPayment, setEditingPayment] = useState(false);
  const [paymentValues, setPaymentValues] = useState<PaymentSettings>({ 
    depositAmount: 50, 
    fullPaymentDaysBefore: 7 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    setLoading(true);
    try {
      const response = await adminGet('/api/admin/rates');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load rates');
      }
      
      const data = await response.json();
      setRates(data);
    } catch (error) {
      console.error('Error loading rates:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load rates');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (category: keyof Rates) => {
    if (rates && category !== 'paymentSettings') {
      setEditingCategory(category);
      setEditValues(rates[category] as RateCategory);
    }
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditValues({ basePrice: 0, additionalPet: 0 });
  };

  const startEditingPayment = () => {
    if (rates?.paymentSettings) {
      setPaymentValues(rates.paymentSettings);
    }
    setEditingPayment(true);
  };

  const cancelEditingPayment = () => {
    setEditingPayment(false);
    if (rates?.paymentSettings) {
      setPaymentValues(rates.paymentSettings);
    }
  };

  const saveRate = async (category: keyof Rates) => {
    setSaving(true);
    try {
      const sessionId = localStorage.getItem('admin_session');
      const response = await fetch(`${baseUrl}/api/admin/rates`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({ [category]: editValues })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save rate');
      }

      const data = await response.json();
      setRates(data.rates);
      setEditingCategory(null);
      toast.success('Rate updated successfully');
    } catch (error) {
      console.error('Error saving rate:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save rate');
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = async () => {
    setSaving(true);
    try {
      const sessionId = localStorage.getItem('admin_session');
      const response = await fetch(`${baseUrl}/api/admin/rates`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({ paymentSettings: paymentValues })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save payment settings');
      }

      const data = await response.json();
      setRates(data.rates);
      setEditingPayment(false);
      toast.success('Payment settings updated successfully');
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rates...</p>
        </div>
      </div>
    );
  }

  if (!rates) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-red-600">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Failed to Load Rates</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the pricing information. Please try again.
            </p>
          </div>
          <Button onClick={loadRates} disabled={loading}>
            {loading ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  const renderRateCard = (category: keyof Rates) => {
    if (category === 'paymentSettings') return null;
    
    const info = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
    const rate = rates[category] as RateCategory;
    const isEditing = editingCategory === category;

    return (
      <Card key={category}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {info.name}
                <Badge variant="secondary">{info.badge}</Badge>
              </CardTitle>
              <CardDescription>{info.description}</CardDescription>
            </div>
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => startEditing(category)}
              >
                Edit Rate
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Base Rate (per night)</Label>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xl font-semibold">£</span>
                  <Input
                    type="number"
                    step="0.50"
                    min="0"
                    value={editValues.basePrice}
                    onChange={(e) => setEditValues(prev => ({ 
                      ...prev, 
                      basePrice: parseFloat(e.target.value) || 0 
                    }))}
                    className="max-w-32"
                  />
                  <span className="text-sm text-muted-foreground">per night</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-primary">£{rate.basePrice}</span>
                  <span className="text-sm text-muted-foreground">per night</span>
                </div>
              )}
            </div>
            <div>
              <Label>Additional Pet Rate</Label>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xl font-semibold">+£</span>
                  <Input
                    type="number"
                    step="0.50"
                    min="0"
                    value={editValues.additionalPet}
                    onChange={(e) => setEditValues(prev => ({ 
                      ...prev, 
                      additionalPet: parseFloat(e.target.value) || 0 
                    }))}
                    className="max-w-32"
                  />
                  <span className="text-sm text-muted-foreground">per additional pet</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-primary">+£{rate.additionalPet}</span>
                  <span className="text-sm text-muted-foreground">per additional pet</span>
                </div>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={() => saveRate(category)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          )}
          
          {/* Show suites/rooms for luxury and cattery */}
          {(category === 'luxurySuites' || category === 'cattery') && !isEditing && (
            <div>
              <Label className="mb-2 block">
                {category === 'luxurySuites' ? 'Available Suites' : 'Available Rooms'}
              </Label>
              <div className="flex flex-wrap gap-2">
                {category === 'luxurySuites' && 'suites' in info && info.suites?.map((item: string) => (
                  <Badge key={item} variant="outline">{item}</Badge>
                ))}
                {category === 'cattery' && 'rooms' in info && info.rooms?.map((item: string) => (
                  <Badge key={item} variant="outline">{item}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">No Seasonal Pricing</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Glenugie Kennels maintains consistent pricing year-round. The rates shown below apply to all bookings regardless of season or holidays.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Cards */}
      {renderRateCard('luxurySuites')}
      {renderRateCard('cattery')}
      {renderRateCard('ruffsRetreat')}
      {renderRateCard('theVillage')}

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure deposit amount and full payment requirements</CardDescription>
            </div>
            {!editingPayment && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={startEditingPayment}
              >
                Edit Settings
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <Label className="text-base font-semibold mb-3 block">Deposit Amount</Label>
              {editingPayment ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">£</span>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={paymentValues.depositAmount}
                      onChange={(e) => setPaymentValues(prev => ({ 
                        ...prev, 
                        depositAmount: parseInt(e.target.value) || 0 
                      }))}
                      className="max-w-32"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fixed deposit amount required to secure booking
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary">£{rates.paymentSettings.depositAmount}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Customer pays £{rates.paymentSettings.depositAmount} deposit now, remaining balance due before check-in
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <Label className="text-base font-semibold mb-3 block">Full Payment Required</Label>
              {editingPayment ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="90"
                      value={paymentValues.fullPaymentDaysBefore}
                      onChange={(e) => setPaymentValues(prev => ({ 
                        ...prev, 
                        fullPaymentDaysBefore: parseInt(e.target.value) || 0 
                      }))}
                      className="max-w-24"
                    />
                    <span className="text-sm font-semibold">days before check-in</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Days before check-in when full payment is required
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary">{rates.paymentSettings.fullPaymentDaysBefore}</span>
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Full payment must be received {rates.paymentSettings.fullPaymentDaysBefore} days before check-in date
                  </p>
                </div>
              )}
            </div>
          </div>

          {editingPayment && (
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={savePaymentSettings}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Payment Settings'}
              </Button>
              <Button 
                variant="outline" 
                onClick={cancelEditingPayment}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          )}

          {!editingPayment && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-start gap-2">
                <div className="text-green-600 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Full Payment Option</p>
                  <p className="text-sm text-muted-foreground">Customer pays 100% at time of booking</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Deposit Payment Option</p>
                  <p className="text-sm text-muted-foreground">
                    Customer pays £{rates.paymentSettings.depositAmount} deposit, balance due {rates.paymentSettings.fullPaymentDaysBefore} days before check-in
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}











