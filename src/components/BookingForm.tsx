import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format, differenceInDays } from 'date-fns';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { LUXURY_SUITES, CATTERY_SUITES, PRICING } from '../lib/booking-types';
import { 
  validateBooking, 
  getDisabledDates, 
  getMinNightsForPeriod,
  isDateBlocked,
  getBlockedDateReason,
  bookingRulesStore,
  type BookingRules
} from '../lib/booking-rules';
import { baseUrl } from '../lib/base-url';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface BookingFormProps {
  preSelectedSuite?: string;
  preSelectedType?: 'dog' | 'cat';
  preSelectedAccommodation?: string;
}

export default function BookingForm({ preSelectedSuite, preSelectedType, preSelectedAccommodation }: BookingFormProps) {
  const [bookingRules, setBookingRules] = useState<BookingRules>(bookingRulesStore.get());
  const [step, setStep] = useState(1);
  const [petType, setPetType] = useState<'dog' | 'cat' | ''>(preSelectedType || '');
  const [accommodationType, setAccommodationType] = useState(preSelectedAccommodation || '');
  const [specificSuite, setSpecificSuite] = useState(preSelectedSuite || '');
  const [vaccinationCertificate, setVaccinationCertificate] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  
  // Debug: Log bookedDates whenever it changes
  useEffect(() => {
    console.log('🔴 BOOKED DATES STATE CHANGED 🔴');
    console.log('Number of booked dates:', bookedDates.length);
    console.log('Booked dates:', bookedDates.map(d => d.toISOString().split('T')[0]).join(', '));
  }, [bookedDates]);

  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [minNightsRequired, setMinNightsRequired] = useState(bookingRules.minNights);

  // Load booking rules on mount
  useEffect(() => {
    const rules = bookingRulesStore.get();
    setBookingRules(rules);
    setMinNightsRequired(rules.minNights);
  }, []);

  // Read URL params and pre-fill if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const suiteParam = params.get('suite');
      const typeParam = params.get('type') as 'dog' | 'cat' | null;
      const accommodationParam = params.get('accommodation');
      
      if (suiteParam) setSpecificSuite(suiteParam);
      if (typeParam) setPetType(typeParam);
      if (accommodationParam) setAccommodationType(accommodationParam);
      
      // Mark as initialized
      setIsInitializing(false);
    }
  }, []);

  // Fetch availability when accommodation changes OR when step changes to 2
  useEffect(() => {
    const fetchAvailability = async () => {
      // Only fetch if we're on step 2 (dates) or later
      if (step < 2) {
        console.log('Step < 2, skipping availability fetch');
        return;
      }
      if (!accommodationType && !specificSuite) {
        console.log('No accommodation selected, skipping availability fetch');
        return;
      }
      
      console.log('=== FETCH AVAILABILITY DEBUG ===');
      console.log('accommodationType:', accommodationType);
      console.log('specificSuite:', specificSuite);
      console.log('step:', step);
      
      setLoadingAvailability(true);
      try {
        const slug = specificSuite || accommodationType;
        console.log('Fetching availability for slug:', slug);
        console.log('Full URL:', `${baseUrl}/api/availability/${slug}`);
        
        const response = await fetch(`${baseUrl}/api/availability/${slug}`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Availability fetch for slug:', slug, 'returned:', data);
          console.log('Number of bookings returned:', data?.bookings?.length || 0);
          console.log('🔍 RAW BOOKING DATA:', JSON.stringify(data, null, 2));
          
          // Determine if this is a multi-kennel accommodation
          const isMultiKennel = slug === 'ruffs-retreat' || slug === 'village' || slug === 'the-village';
          const totalCapacity = (slug === 'village' || slug === 'the-village') ? 6 : slug === 'ruffs-retreat' ? 12 : 1;
          
          console.log('🏠 Accommodation Type:', isMultiKennel ? 'Multi-Kennel' : 'Single Suite');
          console.log('🏠 Total Capacity:', totalCapacity);
          
          // Convert booked date strings to Date objects
          const booked: Date[] = [];
          
          if (isMultiKennel) {
            // For multi-kennel accommodations, only block dates when ALL kennels are occupied
            // Group bookings by date and count occupied kennels
            const dateOccupancy = new Map<string, Set<number>>();
            
            data?.bookings?.forEach((booking: any) => {
              const checkIn = new Date(booking.checkInDate);
              const checkOut = new Date(booking.checkOutDate);
              const kennelNum = booking.kennelNumber;
              
              // FIXED: Normalize to midnight UTC for consistent comparison
              checkIn.setUTCHours(0, 0, 0, 0);
              checkOut.setUTCHours(0, 0, 0, 0);
              
              // Add all dates between check-in and check-out (excluding checkout)
              const current = new Date(checkIn);
              while (current < checkOut) {
                const dateKey = current.toISOString().split('T')[0];
                if (!dateOccupancy.has(dateKey)) {
                  dateOccupancy.set(dateKey, new Set());
                }
                if (kennelNum) {
                  dateOccupancy.get(dateKey)!.add(kennelNum);
                }
                current.setUTCDate(current.getUTCDate() + 1);
              }
            });
            
            // Only mark dates as booked if ALL kennels are occupied
            dateOccupancy.forEach((occupiedKennels, dateKey) => {
              if (occupiedKennels.size >= totalCapacity) {
                // Create date in UTC to avoid timezone issues
                const [year, month, day] = dateKey.split('-').map(Number);
                const date = new Date(Date.UTC(year, month - 1, day));
                booked.push(date);
              }
            });
            console.log('Multi-kennel dates blocked:', booked.length, 'dates');
          } else {
            // For single suites, block all dates in any booking
            data?.bookings?.forEach((booking: any) => {
              const checkIn = new Date(booking.checkInDate);
              const checkOut = new Date(booking.checkOutDate);
              
              // FIXED: Normalize to midnight UTC for consistent comparison
              checkIn.setUTCHours(0, 0, 0, 0);
              checkOut.setUTCHours(0, 0, 0, 0);
              
              // Add all dates between check-in and check-out (excluding checkout)
              const current = new Date(checkIn);
              while (current < checkOut) {
                // Create date in UTC to avoid timezone issues
                const dateKey = current.toISOString().split('T')[0];
                const [year, month, day] = dateKey.split('-').map(Number);
                const date = new Date(Date.UTC(year, month - 1, day));
                booked.push(date);
                current.setUTCDate(current.getUTCDate() + 1);
              }
            });
            console.log('Single suite dates blocked:', booked.length, 'dates');
          }
          
          setBookedDates(booked);
          console.log('=== BOOKED DATES SET ===');
          console.log('Total dates blocked:', booked.length);
          console.log('Blocked dates:', booked.map(d => d.toISOString().split('T')[0]).join(', '));
          console.log('========================');
        } else {
          console.error('Failed to fetch availability, status:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      } finally {
        setLoadingAvailability(false);
      }
    };
    
    fetchAvailability();
  }, [accommodationType, specificSuite, step]);

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [numberOfPets, setNumberOfPets] = useState(1);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [validationErrorsState, setValidationErrorsState] = useState<string[]>([]);
  const [minNightsRequiredState, setMinNightsRequiredState] = useState(bookingRules.minNights);

  // Form data
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
    
    // Pet 1 (required)
    petName1: '',
    microchip1: '',
    breed1: '',
    sex1: 'male',
    age1: '',
    
    // Pet 2 (optional)
    petName2: '',
    microchip2: '',
    breed2: '',
    sex2: 'male',
    age2: '',
    
    // Pet 3 (optional)
    petName3: '',
    microchip3: '',
    breed3: '',
    sex3: 'male',
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
    
    // Terms
    agreedToTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validate dates whenever they change
  useEffect(() => {
    if (checkIn && checkOut) {
      const validation = validateBooking(checkIn, checkOut, bookingRules);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
    
    // Update min nights requirement based on check-in date
    if (checkIn) {
      const minNights = getMinNightsForPeriod(checkIn, bookingRules);
      setMinNightsRequired(minNights);
    }
  }, [checkIn, checkOut, bookingRules]);

  const calculatePrice = () => {
    if (!checkIn || !checkOut || !accommodationType) return 0;
    
    const nights = differenceInDays(checkOut, checkIn);
    let pricePerNight = 0;
    
    // Determine base price per night
    if (accommodationType === 'luxury-suite') {
      pricePerNight = PRICING.DOG_LUXURY_SUITE;
    } else if (accommodationType === 'ruffs-retreat' || accommodationType === 'village') {
      pricePerNight = PRICING.DOG_STANDARD;
    } else if (accommodationType === 'cattery') {
      pricePerNight = PRICING.CAT_LUXURY;
    }
    
    // Calculate sharing cost based on pet type
    const sharingExtra = petType === 'cat' ? PRICING.CAT_SHARING_EXTRA : PRICING.DOG_SHARING_EXTRA;
    const sharingCost = numberOfPets > 1 ? (numberOfPets - 1) * sharingExtra : 0;
    
    return (pricePerNight + sharingCost) * nights;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Build pets array
      const pets = [
        {
          name: formData.petName1,
          type: petType as 'dog' | 'cat',
          breed: formData.breed1,
          sex: formData.sex1 as 'male' | 'female',
          age: formData.age1,
          microchipNumber: formData.microchip1,
          specialRequirements: ''
        }
      ];
      
      if (numberOfPets >= 2 && formData.petName2) {
        pets.push({
          name: formData.petName2,
          type: petType as 'dog' | 'cat',
          breed: formData.breed2,
          sex: formData.sex2 as 'male' | 'female',
          age: formData.age2,
          microchipNumber: formData.microchip2,
          specialRequirements: ''
        });
      }
      
      if (numberOfPets === 3 && formData.petName3) {
        pets.push({
          name: formData.petName3,
          type: petType as 'dog' | 'cat',
          breed: formData.breed3,
          sex: formData.sex3 as 'male' | 'female',
          age: formData.age3,
          microchipNumber: formData.microchip3,
          specialRequirements: ''
        });
      }

      const totalPrice = calculatePrice();
      const depositAmount = 20; // £20 deposit
      
      // Handle vaccination certificate upload
      let vaccinationCertData = null;
      if (vaccinationCertificate) {
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(vaccinationCertificate);
        });
        
        vaccinationCertData = {
          fileName: vaccinationCertificate.name,
          fileType: vaccinationCertificate.type,
          fileData: fileData
        };
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
        vaccinationCertificate: vaccinationCertData,
        accommodationType,
        specificSuite: specificSuite || undefined,
        checkIn: checkIn?.toISOString(),
        checkOut: checkOut?.toISOString(),
        numberOfNights: checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0,
        totalPrice,
        depositAmount,
        agreedToTerms: formData.agreedToTerms
      };

      const response = await fetch(`${baseUrl}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json() as { checkoutUrl?: string; success?: boolean; bookingId?: string };

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        alert('Booking created successfully!');
        window.location.href = `${baseUrl}/booking/success`;
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = petType && accommodationType && 
    // Require specific suite selection for luxury suites and cattery
    (accommodationType === 'luxury-suite' ? !!specificSuite : true) &&
    (accommodationType === 'cattery' ? !!specificSuite : true);
  const canProceedStep2 = checkIn && checkOut && checkOut > checkIn && validationErrors.length === 0;
  const canProceedStep3 = formData.emergencyContactName && formData.emergencyContactNumber && 
                          formData.petName1 && formData.microchip1 && formData.breed1 && formData.age1;
  const canProceedStep4 = formData.firstName && formData.lastName && formData.email && formData.phone;
  const canSubmit = canProceedStep4 && formData.agreedToTerms;

  // Show loading skeleton during initialization
  if (isInitializing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {s}
              </div>
              {s < 5 && <div className={`h-1 w-16 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2 mt-2 text-xs text-center">
          <div>Pet & Accommodation</div>
          <div>Dates</div>
          <div>Pet Details</div>
          <div>Your Information</div>
          <div>Review</div>
        </div>
      </div>

      {/* Step 1: Pet Type & Accommodation */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Pet Type & Accommodation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Pet Type *</Label>
              <Select value={petType} onValueChange={(v) => setPetType(v as 'dog' | 'cat')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {petType === 'dog' && (
              <div>
                <Label>Accommodation Type *</Label>
                <Select value={accommodationType} onValueChange={setAccommodationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select accommodation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="luxury-suite">Luxury Suite (£{PRICING.DOG_LUXURY_SUITE}/night)</SelectItem>
                    <SelectItem value="ruffs-retreat">Ruffs Retreat (£{PRICING.DOG_STANDARD}/night)</SelectItem>
                    <SelectItem value="village">The Village (£{PRICING.DOG_STANDARD}/night)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {petType === 'cat' && (
              <div>
                <Label>Cattery Suite *</Label>
                <Select value={specificSuite} onValueChange={(v) => { setSpecificSuite(v); setAccommodationType('cattery'); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select suite" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATTERY_SUITES.map(suite => (
                      <SelectItem key={suite.value} value={suite.value}>{suite.label} (£{PRICING.CAT_LUXURY}/night)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {accommodationType === 'luxury-suite' && (
              <div>
                <Label>Select Suite *</Label>
                <Select value={specificSuite} onValueChange={setSpecificSuite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your luxury suite" />
                  </SelectTrigger>
                  <SelectContent>
                    {LUXURY_SUITES.map(suite => (
                      <SelectItem key={suite.value} value={suite.value}>{suite.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Each suite is individually themed and can only accommodate one booking at a time
                </p>
              </div>
            )}

            {accommodationType === 'cattery' && (
              <div>
                <Label>Select Cattery Suite *</Label>
                <Select value={specificSuite} onValueChange={setSpecificSuite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your cattery suite" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATTERY_SUITES.map(suite => (
                      <SelectItem key={suite.value} value={suite.value}>{suite.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Each cattery suite is individually designed and can only accommodate one booking at a time
                </p>
              </div>
            )}

            {/* Number of Pets */}
            <div>
              <Label className="text-lg mb-3 block">Number of Pets (Max 3)</Label>
              <Select value={numberOfPets.toString()} onValueChange={(v) => setNumberOfPets(parseInt(v))}>
                <SelectTrigger className="text-base py-6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Pet</SelectItem>
                  <SelectItem value="2">
                    2 Pets (+ £{petType === 'cat' ? PRICING.CAT_SHARING_EXTRA : PRICING.DOG_SHARING_EXTRA}/night per extra pet)
                  </SelectItem>
                  <SelectItem value="3">
                    3 Pets (+ £{petType === 'cat' ? PRICING.CAT_SHARING_EXTRA * 2 : PRICING.DOG_SHARING_EXTRA * 2}/night for 2 extra pets)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="w-full">
              Continue to Dates
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Dates */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Dates</CardTitle>
            <CardDescription>
              {loadingAvailability ? 'Loading availability...' : `Minimum ${minNightsRequired} night${minNightsRequired > 1 ? 's' : ''} required`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Booking Restrictions</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Availability Legend */}
            <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-primary bg-primary/10"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-destructive/20 border border-destructive/50"></div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 border-border"></div>
                <span>Available</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-lg mb-3 block">Check-in Date *</Label>
                <Calendar 
                  mode="single" 
                  selected={checkIn} 
                  onSelect={setCheckIn} 
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Disable past dates
                    if (date < today) return true;
                    
                    // Disable dates beyond max advance booking
                    const maxDate = new Date(today);
                    maxDate.setDate(maxDate.getDate() + bookingRules.maxAdvanceBookingDays);
                    if (date > maxDate) return true;
                    
                    // Check if date is in blocked dates from rules
                    if (isDateBlocked(date, bookingRules)) return true;
                    
                    // CRITICAL FIX: Normalize to UTC midnight for exact comparison
                    const checkDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                    const checkTime = checkDate.getTime();
                    
                    // Check if date is in booked dates
                    const isBooked = bookedDates.some(bookedDate => {
                      const bookedTime = new Date(Date.UTC(bookedDate.getUTCFullYear(), bookedDate.getUTCMonth(), bookedDate.getUTCDate())).getTime();
                      return bookedTime === checkTime;
                    });
                    
                    if (isBooked) {
                      console.log('🚫 BLOCKING CHECK-IN DATE:', date.toISOString().split('T')[0]);
                    }
                    
                    return isBooked;
                  }}
                  modifiers={{
                    booked: bookedDates,
                    blocked: bookingRules.blockedDates.map(d => new Date(d))
                  }}
                  modifiersClassNames={{
                    booked: 'bg-destructive/30 text-destructive-foreground line-through opacity-50 cursor-not-allowed',
                    blocked: 'bg-destructive/40 text-destructive-foreground font-bold opacity-60 cursor-not-allowed'
                  }}
                  className="rounded-md border"
                />
                {checkIn && isDateBlocked(checkIn, bookingRules) && (
                  <p className="text-xs text-destructive mt-2">
                    ⚠️ {getBlockedDateReason(checkIn, bookingRules)}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-lg mb-3 block">Check-out Date *</Label>
                <Calendar 
                  mode="single" 
                  selected={checkOut} 
                  onSelect={setCheckOut} 
                  disabled={(date) => {
                    // Must select check-in first
                    if (!checkIn) return true;
                    
                    // Must be after check-in
                    if (date <= checkIn) return true;
                    
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Disable past dates
                    if (date < today) return true;
                    
                    // Disable dates beyond max advance booking
                    const maxDate = new Date(today);
                    maxDate.setDate(maxDate.getDate() + bookingRules.maxAdvanceBookingDays);
                    if (date > maxDate) return true;
                    
                    // Check if date is in blocked dates from rules
                    if (isDateBlocked(date, bookingRules)) return true;
                    
                    // CRITICAL FIX: Normalize to UTC midnight for exact comparison
                    const checkDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                    const checkTime = checkDate.getTime();
                    
                    // Check if date is in booked dates
                    const isBooked = bookedDates.some(bookedDate => {
                      const bookedTime = new Date(Date.UTC(bookedDate.getUTCFullYear(), bookedDate.getUTCMonth(), bookedDate.getUTCDate())).getTime();
                      return bookedTime === checkTime;
                    });
                    
                    if (isBooked) {
                      console.log('🚫 BLOCKING CHECK-OUT DATE:', date.toISOString().split('T')[0]);
                    }
                    
                    return isBooked;
                  }}
                  modifiers={{
                    booked: bookedDates,
                    blocked: bookingRules.blockedDates.map(d => new Date(d))
                  }}
                  modifiersClassNames={{
                    booked: 'bg-destructive/30 text-destructive-foreground line-through opacity-50 cursor-not-allowed',
                    blocked: 'bg-destructive/40 text-destructive-foreground font-bold opacity-60 cursor-not-allowed'
                  }}
                  className="rounded-md border"
                />
                {checkOut && isDateBlocked(checkOut, bookingRules) && (
                  <p className="text-xs text-destructive mt-2">
                    ⚠️ {getBlockedDateReason(checkOut, bookingRules)}
                  </p>
                )}
              </div>
            </div>

            {checkIn && checkOut && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">Booking Summary</p>
                <p>Check-in: {format(checkIn, 'PPP')}</p>
                <p>Check-out: {format(checkOut, 'PPP')}</p>
                <p>Nights: {differenceInDays(checkOut, checkIn)}</p>
                <p>Pets: {numberOfPets}</p>
                {minNightsRequired > bookingRules.minNights && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                    ℹ️ Peak season: Minimum {minNightsRequired} nights required
                  </p>
                )}
                <p className="text-xl font-bold mt-2">Total: £{calculatePrice()}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="flex-1">Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Pet Information */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Pet Information</CardTitle>
            <CardDescription>All fields marked with * are required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Emergency Contact */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold">Emergency Contact</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Emergency Contact Name *</Label>
                  <Input value={formData.emergencyContactName} onChange={(e) => updateFormData('emergencyContactName', e.target.value)} required />
                </div>
                <div>
                  <Label>Emergency Contact Number *</Label>
                  <Input value={formData.emergencyContactNumber} onChange={(e) => updateFormData('emergencyContactNumber', e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Pet 1 */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold">Pet 1 Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Pet Name *</Label>
                  <Input value={formData.petName1} onChange={(e) => updateFormData('petName1', e.target.value)} required />
                </div>
                <div>
                  <Label>Microchip Number *</Label>
                  <Input value={formData.microchip1} onChange={(e) => updateFormData('microchip1', e.target.value)} required />
                </div>
                <div>
                  <Label>Breed *</Label>
                  <Input value={formData.breed1} onChange={(e) => updateFormData('breed1', e.target.value)} required />
                </div>
                <div>
                  <Label>Sex *</Label>
                  <Select value={formData.sex1} onValueChange={(v) => updateFormData('sex1', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Age *</Label>
                  <Input value={formData.age1} onChange={(e) => updateFormData('age1', e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Pet 2 */}
            {numberOfPets >= 2 && (
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold">Pet 2 Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pet Name 2</Label>
                    <Input value={formData.petName2} onChange={(e) => updateFormData('petName2', e.target.value)} />
                  </div>
                  <div>
                    <Label>Microchip Number</Label>
                    <Input value={formData.microchip2} onChange={(e) => updateFormData('microchip2', e.target.value)} />
                  </div>
                  <div>
                    <Label>Breed 2</Label>
                    <Input value={formData.breed2} onChange={(e) => updateFormData('breed2', e.target.value)} />
                  </div>
                  <div>
                    <Label>Sex</Label>
                    <Select value={formData.sex2} onValueChange={(v) => updateFormData('sex2', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input value={formData.age2} onChange={(e) => updateFormData('age2', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Pet 3 */}
            {numberOfPets === 3 && (
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold">Pet 3 Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pet Name 3</Label>
                    <Input value={formData.petName3} onChange={(e) => updateFormData('petName3', e.target.value)} />
                  </div>
                  <div>
                    <Label>Microchip Number</Label>
                    <Input value={formData.microchip3} onChange={(e) => updateFormData('microchip3', e.target.value)} />
                  </div>
                  <div>
                    <Label>Breed 3</Label>
                    <Input value={formData.breed3} onChange={(e) => updateFormData('breed3', e.target.value)} />
                  </div>
                  <div>
                    <Label>Sex</Label>
                    <Select value={formData.sex3} onValueChange={(v) => updateFormData('sex3', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input value={formData.age3} onChange={(e) => updateFormData('age3', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Pet Info */}
            <div className="space-y-4">
              <div>
                <Label>Veterinary Surgery</Label>
                <Input value={formData.veterinarySurgery} onChange={(e) => updateFormData('veterinarySurgery', e.target.value)} />
              </div>
              <div>
                <Label>Pet Insurance Details</Label>
                <Input value={formData.petInsurance} onChange={(e) => updateFormData('petInsurance', e.target.value)} placeholder="e.g., Pet Plan - Policy #12345" />
              </div>
              <div>
                <Label>Feeding Instructions & Allergies</Label>
                <Textarea value={formData.feedingInstructions} onChange={(e) => updateFormData('feedingInstructions', e.target.value)} rows={3} />
              </div>
              <div>
                <Label>Medical Instructions</Label>
                <Textarea value={formData.medicalInstructions} onChange={(e) => updateFormData('medicalInstructions', e.target.value)} rows={3} />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="aggression" 
                  checked={formData.hasAggressionIssues} 
                  onCheckedChange={(checked) => updateFormData('hasAggressionIssues', checked)} 
                />
                <Label htmlFor="aggression">Does your pet have any aggression, behavioural, or temperament issues?</Label>
              </div>
              {formData.hasAggressionIssues && (
                <div>
                  <Label>Please provide details</Label>
                  <Textarea value={formData.aggressionDetails} onChange={(e) => updateFormData('aggressionDetails', e.target.value)} rows={2} />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="escape" 
                  checked={formData.triesEscape} 
                  onCheckedChange={(checked) => updateFormData('triesEscape', checked)} 
                />
                <Label htmlFor="escape">Does your pet try to escape from enclosed areas?</Label>
              </div>
              {formData.triesEscape && (
                <div>
                  <Label>Please provide details</Label>
                  <Textarea value={formData.escapeDetails} onChange={(e) => updateFormData('escapeDetails', e.target.value)} rows={2} />
                </div>
              )}

              <div>
                <Label>Additional Notes</Label>
                <Textarea 
                  value={formData.additionalNotes} 
                  onChange={(e) => updateFormData('additionalNotes', e.target.value)} 
                  rows={4}
                  placeholder="Please tell us everything about your pet so we can accommodate its every need"
                />
              </div>

              {/* Vaccination Certificate Upload */}
              <div className="space-y-2">
                <Label htmlFor="vaccination-cert">Vaccination Certificate</Label>
                <div className="flex flex-col gap-2">
                  <Input 
                    id="vaccination-cert"
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Check file size (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File size must be less than 5MB');
                          e.target.value = '';
                          return;
                        }
                        setVaccinationCertificate(file);
                      }
                    }}
                    className="cursor-pointer"
                  />
                  {vaccinationCertificate && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                      <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                      </svg>
                      <span className="flex-1">{vaccinationCertificate.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setVaccinationCertificate(null);
                          const input = document.getElementById('vaccination-cert') as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                        className="text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload your pet's vaccination certificate (PDF, JPG, PNG, DOC - Max 5MB). Required on arrival.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">Back</Button>
              <Button onClick={() => setStep(4)} disabled={!canProceedStep3} className="flex-1">Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Your Information */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input value={formData.firstName} onChange={(e) => updateFormData('firstName', e.target.value)} required />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input value={formData.lastName} onChange={(e) => updateFormData('lastName', e.target.value)} required />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} required />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input value={formData.phone} onChange={(e) => updateFormData('phone', e.target.value)} required />
              </div>
              <div>
                <Label>Country of Residence</Label>
                <Input value={formData.country} onChange={(e) => updateFormData('country', e.target.value)} />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={formData.address} onChange={(e) => updateFormData('address', e.target.value)} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={formData.city} onChange={(e) => updateFormData('city', e.target.value)} />
              </div>
              <div>
                <Label>State / County</Label>
                <Input value={formData.county} onChange={(e) => updateFormData('county', e.target.value)} />
              </div>
              <div>
                <Label>Postcode</Label>
                <Input value={formData.postcode} onChange={(e) => updateFormData('postcode', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep(3)} variant="outline" className="flex-1">Back</Button>
              <Button onClick={() => setStep(5)} disabled={!canProceedStep4} className="flex-1">Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review & Submit */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Confirm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Booking Summary</h3>
                <p><strong>Pet Type:</strong> {petType}</p>
                <p><strong>Accommodation:</strong> {specificSuite || accommodationType}</p>
                <p><strong>Check-in:</strong> {checkIn ? format(checkIn, 'PPP') : ''}</p>
                <p><strong>Check-out:</strong> {checkOut ? format(checkOut, 'PPP') : ''}</p>
                <p><strong>Nights:</strong> {checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0}</p>
                <p><strong>Pets:</strong> {numberOfPets}</p>
                <p className="text-xl font-bold mt-2">Total: £{calculatePrice()}</p>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={formData.agreedToTerms} 
                  onCheckedChange={(checked) => updateFormData('agreedToTerms', checked)} 
                  required
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I agree to abide by Glenugie Kennels standard terms and conditions, which I have read and received. 
                  You must produce a valid vaccination certificate on the day your pet arrives for boarding. 
                  If you fail to do so you could incur additional charges or be refused admission. 
                  Please see our <a href={`${baseUrl}/terms`} className="text-primary underline" target="_blank">terms and conditions</a>. *
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep(4)} variant="outline" className="flex-1">Back</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!canSubmit || isSubmitting} 
                className="flex-1"
              >
                {isSubmitting ? 'Processing...' : 'Confirm & Pay'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
























































