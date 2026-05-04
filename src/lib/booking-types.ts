


export type PetType = 'dog' | 'cat';

export type DogSize = 'small' | 'medium' | 'large';

export type AccommodationType = 
  | 'luxury-suite' 
  | 'ruffs-retreat' 
  | 'village' 
  | 'cattery';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Pet {
  name: string;
  type: 'dog' | 'cat';
  breed: string;
  sex: 'male' | 'female';
  age: string;
  microchipNumber: string;
  specialRequirements?: string;
}

export interface Booking {
  id: string;
  
  // Customer Information
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  customerCounty?: string;
  customerPostcode?: string;
  customerCountry?: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactNumber: string;
  
  // Pets - Up to 3 pets
  pets: Pet[];
  
  // Pet Additional Info
  veterinarySurgery?: string;
  petInsurance?: string;
  feedingInstructions?: string;
  medicalInstructions?: string;
  hasAggressionIssues: boolean;
  aggressionDetails?: string;
  triesEscape: boolean;
  escapeDetails?: string;
  additionalNotes?: string;
  
  // Accommodation
  accommodationType: AccommodationType;
  specificSuite?: string;
  kennelNumber?: number;
  
  // Booking Dates
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  
  // Payment
  totalPrice: number;
  depositAmount: number;
  paidAmount?: number;
  totalDue?: number;
  paymentStatus: 'pending' | 'deposit-paid' | 'fully-paid' | 'refunded' | 'paid' | 'partial';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  
  // Special Requests
  specialRequests?: string;
  
  // Vaccination Certificate
  vaccinationCertificateUrl?: string;
  
  // Terms & Conditions
  agreedToTerms: boolean;
  
  // Status & Metadata
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export const LUXURY_SUITES: { value: string; label: string }[] = [
  { value: 'sniffany-suite', label: 'Sniffany Suite' },
  { value: 'woofdorf', label: 'Woofdorf' },
  { value: 'barkingham-palace', label: 'Barkingham Palace' },
  { value: 'nasherville', label: 'Nasherville' },
  { value: 'lapdog-land', label: 'Lapdog Land Suite' },
  { value: 'huntington-manor', label: 'Huntington Manor Suite' },
  { value: 'pawduree', label: 'Pawduree' },
  { value: 'furrari', label: 'Furrari' },
  { value: 'tail-away', label: 'Tail Away' },
  { value: 'fairy-dogmother', label: 'The Fairy Dogmother' },
];

export const CATTERY_SUITES: { value: string; label: string }[] = [
  { value: 'clawrence-house', label: 'Clawrence House' },
  { value: 'twitcher', label: 'Twitcher' },
  { value: 'pussy-porchens', label: 'Pussy Porchens' },
  { value: 'ragdoll-ranch', label: 'Ragdoll Ranch' },
  { value: 'bengal-bay', label: 'Bengal Bay' },
  { value: 'paws-palace', label: 'Paws Palace' },
  { value: 'octopussy', label: 'Octopussy' },
  { value: 'catsby', label: 'Catsby' },
  { value: 'whiskers-lounge', label: 'Whiskers Lounge' },
  { value: 'hairy-potter', label: 'Hairy Potter' },
  { value: 'chalet-cat', label: 'Chalet Cat' },
  { value: 'cleocatara', label: 'Cleocatara' },
];

// Pricing constants
export const PRICING = {
  DOG_LUXURY_SUITE: 25,
  DOG_STANDARD: 20,
  CAT_LUXURY: 15,
  DOG_SHARING_EXTRA: 10,
  CAT_SHARING_EXTRA: 7.50,
  MAX_PETS: 3
};



