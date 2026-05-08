import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { format, differenceInDays } from 'date-fns';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import type { Pet } from '../../lib/booking-types';
import { LUXURY_SUITES, CATTERY_SUITES, PRICING } from '../../lib/booking-types';
import { 
  validateBooking, 
  getDisabledDates, 
  getMinNightsForPeriod,
  bookingRulesStore,
  type BookingRules
} from '../../lib/booking-rules';
import { baseUrl } from '../../lib/base-url';
import { adminPost } from '../../lib/admin-fetch';
import type { Booking } from '../../lib/booking-types';
import { useEffect } from 'react';

type AccommodationType = 'luxury-suite' | 'ruffs-retreat' | 'village' | 'cattery';

const ACCOMMODATIONS = [
  { id: 'luxury-suite' as AccommodationType, name: 'Luxury Dog Suites', pricePerNight: PRICING.DOG_LUXURY_SUITE },
  { id: 'ruffs-retreat' as AccommodationType, name: "Ruff's Retreat", pricePerNight: PRICING.DOG_STANDARD },
  { id: 'village' as AccommodationType, name: 'The Village', pricePerNight: PRICING.DOG_STANDARD },
  { id: 'cattery' as AccommodationType, name: 'Glenugie Whiskers', pricePerNight: PRICING.CAT_LUXURY },
];

interface CreateBookingFormProps {
  onSuccess: () => void;
}

export default function CreateBookingForm({ onSuccess }: CreateBookingFormProps) {
  const [bookingRules, setBookingRules] = useState<BookingRules>(bookingRulesStore.get());
  const [formData, setFormData] = useState({
    // Customer Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'United Kingdom',
    address: '',
    city: '',
    county: '',
    postcode: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactNumber: '',
    
    // Booking
    accommodationType: '' as AccommodationType | '',
    specificSuite: '',
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    
    // Pet 1 (required)
    petName1: '',
    microchip1: '',
    breed1: '',
    sex1: 'male' as 'male' | 'female',
    age1: '',
    
    // Pet 2 (optional)
    petName2: '',
    microchip2: '',
    breed2: '',
    sex2: 'male' as 'male' | 'female',
    age2: '',
    
    // Pet 3 (optional)
    petName3: '',
    microchip3: '',
    breed3: '',
    sex3: 'male' as 'male' | 'female',
    age3: '',
    
    // Additional Info
    veterinarySurgery: '',
    petInsurance: '',
    feedingInstructions: '',
    medicalInstructions: '',
    hasAggressionIssues: false,
    aggressionDetails: '',
    triesEscape: false,
    escapeDetails: '',
    additionalNotes: '',
    
    specialRequests: ''
  });

  const [numberOfPets, setNumberOfPets] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [minNightsRequired, setMinNightsRequired] = useState(bookingRules.minNights);

  // Load booking rules on mount
  useEffect(() => {
    const rules = bookingRulesStore.get();
    setBookingRules(rules);
    setMinNightsRequired(rules.minNights);
  }, []);

  // Validate dates whenever they change
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const validation = validateBooking(formData.checkIn, formData.checkOut, bookingRules);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
    
    // Update min nights requirement based on check-in date
    if (formData.checkIn) {
      const minNights = getMinNightsForPeriod(formData.checkIn, bookingRules);
      setMinNightsRequired(minNights);
    }
  }, [formData.checkIn, formData.checkOut, bookingRules]);

  const selectedAccommodation = ACCOMMODATIONS.find(a => a.id === formData.accommodationType);
  const numberOfNights = formData.checkIn && formData.checkOut 
    ? differenceInDays(formData.checkOut, formData.checkIn) 
    : 0;

  const calculateTotal = () => {
    if (!numberOfNights || !selectedAccommodation) return 0;
    
    const basePrice = selectedAccommodation.pricePerNight;
    
    // Determine sharing cost based on accommodation type (cattery = cats, others = dogs)
    const sharingExtra = formData.accommodationType === 'cattery' 
      ? PRICING.CAT_SHARING_EXTRA 
      : PRICING.DOG_SHARING_EXTRA;
    
    const sharingCost = numberOfPets > 1 ? (numberOfPets - 1) * sharingExtra : 0;
    
    return (basePrice + sharingCost) * numberOfNights;
  };

  const totalPrice = calculateTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check validation
    if (validationErrors.length > 0) {
      setError('Please fix the booking date errors before submitting');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Build pets array
      const pets: Pet[] = [];
      
      if (formData.petName1) {
        pets.push({
          name: formData.petName1,
          type: formData.accommodationType === 'cattery' ? 'cat' : 'dog',
          breed: formData.breed1,
          sex: formData.sex1,
          age: formData.age1,
          microchipNumber: formData.microchip1,
          specialRequirements: ''
        });
      }
      
      if (numberOfPets >= 2 && formData.petName2) {
        pets.push({
          name: formData.petName2,
          type: formData.accommodationType === 'cattery' ? 'cat' : 'dog',
          breed: formData.breed2,
          sex: formData.sex2,
          age: formData.age2,
          microchipNumber: formData.microchip2,
          specialRequirements: ''
        });
      }
      
      if (numberOfPets === 3 && formData.petName3) {
        pets.push({
          name: formData.petName3,
          type: formData.accommodationType === 'cattery' ? 'cat' : 'dog',
          breed: formData.breed3,
          sex: formData.sex3,
          age: formData.age3,
          microchipNumber: formData.microchip3,
          specialRequirements: ''
        });
      }

      const bookingData = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerCity: formData.city,
        customerCounty: formData.county,
        customerPostcode: formData.postcode,
        customerCountry: formData.country,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactNumber: formData.emergencyContactNumber,
        pets,
        veterinarySurgery: formData.veterinarySurgery,
        petInsurance: formData.petInsurance,
        feedingInstructions: formData.feedingInstructions,
        medicalInstructions: formData.medicalInstructions,
        hasAggressionIssues: formData.hasAggressionIssues,
        aggressionDetails: formData.aggressionDetails,
        triesEscape: formData.triesEscape,
        escapeDetails: formData.escapeDetails,
        additionalNotes: formData.additionalNotes,
        accommodationType: formData.accommodationType,
        specificSuite: formData.specificSuite || undefined,
        checkIn: formData.checkIn?.toISOString(),
        checkOut: formData.checkOut?.toISOString(),
        numberOfNights,
        totalPrice,
        depositAmount: totalPrice,
        specialRequests: formData.specialRequests,
        status: 'confirmed', // Admin bookings are auto-confirmed
        paymentStatus: 'paid' // Admin bookings are marked as paid
      };

      const sessionId = localStorage.getItem('admin_session');
      const response = await adminPost('/api/admin/bookings', bookingData);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const newBooking = await response.json();
      console.log('Created booking:', newBooking);
      
      toast.success('Booking created successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: 'United Kingdom',
        address: '',
        city: '',
        county: '',
        postcode: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        accommodationType: '',
        specificSuite: '',
        checkIn: undefined,
        checkOut: undefined,
        petName1: '',
        microchip1: '',
        breed1: '',
        sex1: 'male',
        age1: '',
        petName2: '',
        microchip2: '',
        breed2: '',
        sex2: 'male',
        age2: '',
        petName3: '',
        microchip3: '',
        breed3: '',
        sex3: 'male',
        age3: '',
        veterinarySurgery: '',
        petInsurance: '',
        feedingInstructions: '',
        medicalInstructions: '',
        hasAggressionIssues: false,
        aggressionDetails: '',
        triesEscape: false,
        escapeDetails: '',
        additionalNotes: '',
        specialRequests: ''
      });
      
      onSuccess?.();
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      toast.error(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Booking Date Restrictions</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Customer Information</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>First Name *</Label>
            <Input
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="First name"
            />
          </div>
          <div>
            <Label>Last Name *</Label>
            <Input
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Last name"
            />
          </div>
          <div>
            <Label>Phone *</Label>
            <Input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+44 (0) 1234 567890"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Email *</Label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@email.com"
            />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <Label>City</Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div>
            <Label>County</Label>
            <Input
              value={formData.county}
              onChange={(e) => setFormData({ ...formData, county: e.target.value })}
            />
          </div>
          <div>
            <Label>Postcode</Label>
            <Input
              value={formData.postcode}
              onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <Label>Emergency Contact Name *</Label>
            <Input
              required
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
            />
          </div>
          <div>
            <Label>Emergency Contact Number *</Label>
            <Input
              required
              value={formData.emergencyContactNumber}
              onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Accommodation */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Accommodation</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Accommodation Type *</Label>
            <Select 
              value={formData.accommodationType} 
              onValueChange={(value) => setFormData({ ...formData, accommodationType: value as AccommodationType, specificSuite: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select accommodation" />
              </SelectTrigger>
              <SelectContent>
                {ACCOMMODATIONS.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} - £{acc.pricePerNight}/night
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.accommodationType === 'luxury-suite' && (
            <div>
              <Label>Select Suite *</Label>
              <Select 
                value={formData.specificSuite} 
                onValueChange={(value) => setFormData({ ...formData, specificSuite: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose suite" />
                </SelectTrigger>
                <SelectContent>
                  {LUXURY_SUITES.map((suite) => (
                    <SelectItem key={suite.value} value={suite.value}>{suite.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.accommodationType === 'cattery' && (
            <div>
              <Label>Select Cattery Suite *</Label>
              <Select 
                value={formData.specificSuite} 
                onValueChange={(value) => setFormData({ ...formData, specificSuite: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose cattery suite" />
                </SelectTrigger>
                <SelectContent>
                  {CATTERY_SUITES.map((suite) => (
                    <SelectItem key={suite.value} value={suite.value}>{suite.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Booking Dates</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Check-in Date * (Min {minNightsRequired} nights)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.checkIn ? format(formData.checkIn, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.checkIn}
                  onSelect={(date) => setFormData({ ...formData, checkIn: date })}
                  disabled={(date) => {
                    const allDisabledDates = getDisabledDates([], bookingRules);
                    return allDisabledDates.some(disabledDate => 
                      disabledDate.toDateString() === date.toDateString()
                    );
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Check-out Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.checkOut ? format(formData.checkOut, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.checkOut}
                  onSelect={(date) => setFormData({ ...formData, checkOut: date })}
                  disabled={(date) => {
                    if (!formData.checkIn || date <= formData.checkIn) return true;
                    
                    const allDisabledDates = getDisabledDates([], bookingRules);
                    return allDisabledDates.some(disabledDate => 
                      disabledDate.toDateString() === date.toDateString()
                    );
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {numberOfNights > 0 && (
          <div className="bg-muted p-3 rounded">
            <p className="text-sm">
              <strong>{numberOfNights} night(s)</strong> × £{selectedAccommodation?.pricePerNight} 
              {numberOfPets > 1 && (
                <> + {numberOfPets - 1} sharing (£{formData.accommodationType === 'cattery' ? PRICING.CAT_SHARING_EXTRA : PRICING.DOG_SHARING_EXTRA}/night each)</>
              )} = 
              <strong className="ml-2">£{totalPrice}</strong>
            </p>
            {minNightsRequired > bookingRules.minNights && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                ℹ️ Peak season: Minimum {minNightsRequired} nights required
              </p>
            )}
          </div>
        )}
      </div>

      {/* Number of Pets */}
      <div>
        <Label>Number of Pets (Max 3)</Label>
        <Select value={numberOfPets.toString()} onValueChange={(v) => setNumberOfPets(parseInt(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Pet</SelectItem>
            <SelectItem value="2">
              2 Pets (+ £{formData.accommodationType === 'cattery' ? PRICING.CAT_SHARING_EXTRA : PRICING.DOG_SHARING_EXTRA}/night)
            </SelectItem>
            <SelectItem value="3">
              3 Pets (+ £{formData.accommodationType === 'cattery' ? PRICING.CAT_SHARING_EXTRA * 2 : PRICING.DOG_SHARING_EXTRA * 2}/night)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pet 1 Information */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg">Pet 1 Information</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Pet Name *</Label>
            <Input
              required
              value={formData.petName1}
              onChange={(e) => setFormData({ ...formData, petName1: e.target.value })}
            />
          </div>
          <div>
            <Label>Microchip (Optional)</Label>
            <Input
              value={formData.microchip1}
              onChange={(e) => setFormData({ ...formData, microchip1: e.target.value })}
            />
          </div>
          <div>
            <Label>Breed *</Label>
            <Input
              required
              value={formData.breed1}
              onChange={(e) => setFormData({ ...formData, breed1: e.target.value })}
            />
          </div>
          <div>
            <Label>Sex *</Label>
            <Select value={formData.sex1} onValueChange={(v: 'male' | 'female') => setFormData({ ...formData, sex1: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Age *</Label>
            <Input
              required
              value={formData.age1}
              onChange={(e) => setFormData({ ...formData, age1: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Pet 2 Information */}
      {numberOfPets >= 2 && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">Pet 2 Information</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>Pet Name</Label>
              <Input
                value={formData.petName2}
                onChange={(e) => setFormData({ ...formData, petName2: e.target.value })}
              />
            </div>
            <div>
              <Label>Microchip</Label>
              <Input
                value={formData.microchip2}
                onChange={(e) => setFormData({ ...formData, microchip2: e.target.value })}
              />
            </div>
            <div>
              <Label>Breed</Label>
              <Input
                value={formData.breed2}
                onChange={(e) => setFormData({ ...formData, breed2: e.target.value })}
              />
            </div>
            <div>
              <Label>Sex</Label>
              <Select value={formData.sex2} onValueChange={(v: 'male' | 'female') => setFormData({ ...formData, sex2: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Age</Label>
              <Input
                value={formData.age2}
                onChange={(e) => setFormData({ ...formData, age2: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pet 3 Information */}
      {numberOfPets === 3 && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">Pet 3 Information</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>Pet Name</Label>
              <Input
                value={formData.petName3}
                onChange={(e) => setFormData({ ...formData, petName3: e.target.value })}
              />
            </div>
            <div>
              <Label>Microchip</Label>
              <Input
                value={formData.microchip3}
                onChange={(e) => setFormData({ ...formData, microchip3: e.target.value })}
              />
            </div>
            <div>
              <Label>Breed</Label>
              <Input
                value={formData.breed3}
                onChange={(e) => setFormData({ ...formData, breed3: e.target.value })}
              />
            </div>
            <div>
              <Label>Sex</Label>
              <Select value={formData.sex3} onValueChange={(v: 'male' | 'female') => setFormData({ ...formData, sex3: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Age</Label>
              <Input
                value={formData.age3}
                onChange={(e) => setFormData({ ...formData, age3: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Additional Pet Information */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg">Additional Pet Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Veterinary Surgery</Label>
            <Input
              value={formData.veterinarySurgery}
              onChange={(e) => setFormData({ ...formData, veterinarySurgery: e.target.value })}
            />
          </div>
          <div>
            <Label>Pet Insurance</Label>
            <Input
              value={formData.petInsurance}
              onChange={(e) => setFormData({ ...formData, petInsurance: e.target.value })}
            />
          </div>
        </div>
        
        <div>
          <Label>Feeding Instructions & Allergies</Label>
          <Textarea
            value={formData.feedingInstructions}
            onChange={(e) => setFormData({ ...formData, feedingInstructions: e.target.value })}
            rows={2}
          />
        </div>
        
        <div>
          <Label>Medical Instructions</Label>
          <Textarea
            value={formData.medicalInstructions}
            onChange={(e) => setFormData({ ...formData, medicalInstructions: e.target.value })}
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="aggression-admin" 
            checked={formData.hasAggressionIssues} 
            onCheckedChange={(checked) => setFormData({ ...formData, hasAggressionIssues: checked as boolean })} 
          />
          <Label htmlFor="aggression-admin">Aggression/behavioral issues?</Label>
        </div>
        {formData.hasAggressionIssues && (
          <Textarea
            value={formData.aggressionDetails}
            onChange={(e) => setFormData({ ...formData, aggressionDetails: e.target.value })}
            placeholder="Details..."
            rows={2}
          />
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="escape-admin" 
            checked={formData.triesEscape} 
            onCheckedChange={(checked) => setFormData({ ...formData, triesEscape: checked as boolean })} 
          />
          <Label htmlFor="escape-admin">Tries to escape?</Label>
        </div>
        {formData.triesEscape && (
          <Textarea
            value={formData.escapeDetails}
            onChange={(e) => setFormData({ ...formData, escapeDetails: e.target.value })}
            placeholder="Details..."
            rows={2}
          />
        )}

        <div>
          <Label>Additional Notes</Label>
          <Textarea
            value={formData.additionalNotes}
            onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <Label>Special Requests</Label>
        <Textarea
          value={formData.specialRequests}
          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
          placeholder="Any special requests..."
          rows={3}
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-3 rounded">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading || validationErrors.length > 0} className="w-full">
        {loading ? 'Creating Booking...' : 'Create Booking (Auto-Confirmed)'}
      </Button>
    </form>
  );
}











