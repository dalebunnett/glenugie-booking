


import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { baseUrl } from '../../lib/base-url';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { adminPost } from '../../lib/admin-fetch';

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

// Helper function to parse CSV properly (handles commas in quoted fields)
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === '\t' && !insideQuotes) {
      // Tab separator
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      // End of row
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else if (char === '\r') {
      // Skip carriage return
      continue;
    } else {
      currentField += char;
    }
  }

  // Add last field and row if not empty
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Parse DD/MM/YYYY to YYYY-MM-DD
function parseDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
}

// Map accommodation name to type
function mapAccommodationType(accommodation: string): string {
  const name = accommodation.toLowerCase();
  
  // Luxury dog suites
  if (name.includes('sniffany') || name.includes('woofdorf') || name.includes('barkingham') || 
      name.includes('nasherville') || name.includes('lapdog') || name.includes('huntington') ||
      name.includes('pawduree') || name.includes('furrari') || name.includes('tail away') ||
      name.includes('fairy dogmother')) {
    return 'luxury-suite';
  }
  
  // Cattery suites
  if (name.includes('clawrence') || name.includes('twitcher') || name.includes('pussy porchens') ||
      name.includes('ragdoll') || name.includes('bengal') || name.includes('paws palace') ||
      name.includes('octopussy') || name.includes('catsby') || name.includes('whiskers') ||
      name.includes('hairy potter') || name.includes('chalet cat') || name.includes('cleocatara')) {
    return 'cattery';
  }
  
  // Ruff's Retreat
  if (name.includes('ruff')) {
    return 'ruffs-retreat';
  }
  
  // The Village
  if (name.includes('village')) {
    return 'village';
  }
  
  return 'luxury-suite'; // Default
}

// Map accommodation name to slug
function mapAccommodationSlug(accommodation: string): string {
  const name = accommodation.toLowerCase();
  
  // Luxury dog suites
  if (name.includes('sniffany')) return 'sniffany-suite';
  if (name.includes('woofdorf')) return 'woofdorf';
  if (name.includes('barkingham')) return 'barkingham-palace';
  if (name.includes('nasherville')) return 'nasherville';
  if (name.includes('lapdog')) return 'lapdog-land-suite';
  if (name.includes('huntington')) return 'huntington-manor-suite';
  if (name.includes('pawduree')) return 'pawduree';
  if (name.includes('furrari')) return 'furrari';
  if (name.includes('tail away')) return 'tail-away';
  if (name.includes('fairy dogmother')) return 'the-fairy-dogmother';
  
  // Cattery suites
  if (name.includes('clawrence')) return 'clawrence-house';
  if (name.includes('twitcher')) return 'twitcher';
  if (name.includes('pussy porchens')) return 'pussy-porchens';
  if (name.includes('ragdoll')) return 'ragdoll-ranch';
  if (name.includes('bengal')) return 'bengal-bay';
  if (name.includes('paws palace')) return 'paws-palace';
  if (name.includes('octopussy')) return 'octopussy';
  if (name.includes('catsby')) return 'catsby';
  if (name.includes('whiskers')) return 'whiskers-lounge';
  if (name.includes('hairy potter')) return 'hairy-potter';
  if (name.includes('chalet cat')) return 'chalet-cat';
  if (name.includes('cleocatara')) return 'cleocatara';
  
  // Standard kennels
  if (name.includes('ruff')) return 'ruffs-retreat';
  if (name.includes('village')) return 'village';
  
  return accommodation.toLowerCase().replace(/\s+/g, '-');
}

export default function BookingsImporter({ onImportComplete }: { onImportComplete?: () => void }) {
  const [csvData, setCsvData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const loadSampleData = () => {
    const sampleData = `ID\tStatus\tCheck-in\tCheck-out\tAccommodation Type\tAccommodation\tFirst Name\tLast Name\tEmail\tPhone\tCountry\tAddress\tCity\tState / County\tPostcode\tEmergency Contact Name\tEmergency Contact Number\tFull Guest Name\tmicrochipnumber1\tbreed\tsex\tage\tvet\tinsurance\tfeeding\tbehaviour\tescape\tpetname2\tmicrochipnumber2\tbreed2\tsex2\tage2\tpetname3\tmicrochipnumber3\tbreed3\tsex3\tage3\tMedical instructions\tBehaviour info\tEscape info\tPaid\tTotal
1\tConfirmed\t15/05/2026\t20/05/2026\tLuxury Suite\tSniffany Suite\tJohn\tSmith\tjohn.smith@email.com\t07700900123\tGB\t123 Main St\tLondon\tGreater London\tSW1A 1AA\tJane Doe\t07700900456\tMax\t123456789012345\tGolden Retriever\tMale\t5 years\tCity Vets\tPetplan\tDry food twice daily\tFriendly\tNo\t\t\t\t\t\t\t\t\t\t\tNone\tVery friendly\tDoes not escape\t£50.00\t£250.00`;
    setCsvData(sampleData);
    toast.success('Sample data loaded! Click Import Bookings to process.');
  };

  const handleCSVImport = async () => {
    if (!csvData.trim()) {
      toast.error('Please paste CSV data');
      return;
    }

    setIsImporting(true);
    setResult(null);
    toast.info('Starting import...');

    try {
      // Parse CSV with proper handling of tabs and quotes
      const rows = parseCSV(csvData);
      
      if (rows.length < 2) {
        throw new Error('CSV must contain headers and at least one data row');
      }

      const headers = rows[0].map(h => h.trim());
      console.log('Headers:', headers);
      
      // Create a flexible header mapping function
      const findHeader = (possibleNames: string[]) => {
        const lowerHeaders = headers.map(h => h.toLowerCase());
        for (const name of possibleNames) {
          const index = lowerHeaders.findIndex(h => h.includes(name.toLowerCase()));
          if (index !== -1) return index;
        }
        return -1;
      };
      
      const bookings = [];
      const errors: string[] = [];

      for (let i = 1; i < rows.length; i++) {
        try {
          const values = rows[i];
          
          // Helper to get value by flexible header matching
          const getValue = (possibleNames: string[]) => {
            const idx = findHeader(possibleNames);
            return idx !== -1 ? (values[idx] || '').trim() : '';
          };

          console.log(`Processing row ${i}:`, values);

          // Extract check-in and check-out dates
          const checkIn = parseDate(getValue(['check-in', 'checkin', 'check in', 'arrival']));
          const checkOut = parseDate(getValue(['check-out', 'checkout', 'check out', 'departure']));

          if (!checkIn || !checkOut) {
            errors.push(`Row ${i}: Missing check-in or check-out date`);
            continue;
          }

          // Calculate number of nights
          const checkInDate = new Date(checkIn);
          const checkOutDate = new Date(checkOut);
          const numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

          // Extract accommodation info
          const accommodation = getValue(['accommodation', 'accommodation type', 'kennel', 'suite']);
          const accommodationType = mapAccommodationType(accommodation);
          const specificSuite = mapAccommodationSlug(accommodation);

          // Extract customer info
          const firstName = getValue(['first name', 'firstname', 'first_name']);
          const lastName = getValue(['last name', 'lastname', 'last_name', 'surname']);
          const customerName = `${firstName} ${lastName}`.trim() || getValue(['name', 'customer name', 'full name']);
          const email = getValue(['email', 'e-mail', 'customer email']);
          const phone = getValue(['phone', 'telephone', 'mobile', 'contact number']);

          // Skip rows with no customer information (likely empty rows)
          if (!customerName && !email && !phone && !petName1) {
            console.log(`Skipping empty row ${i}`);
            continue;
          }

          // Extract pet information
          const pets = [];
          
          // Pet 1
          const petName1 = getValue(['full guest name', 'pet name', 'pet information', 'petname', 'pet 1 name', 'guest name']);
          const microchip1 = getValue(['microchipnumber1', 'microchip number 1', 'microchip 1', 'microchip']);
          const breed1 = getValue(['breed', 'breed1', 'pet breed']);
          const sex1 = getValue(['sex', 'sex1', 'gender', 'gender1']);
          const age1 = getValue(['age', 'age1', 'pet age']);
          
          if (petName1) {
            pets.push({
              name: petName1,
              type: accommodationType === 'cattery' ? 'cat' : 'dog',
              breed: breed1,
              sex: sex1.toLowerCase().includes('female') ? 'female' : 'male',
              age: age1,
              microchipNumber: microchip1,
              specialRequirements: ''
            });
          }

          // Pet 2
          const petName2 = getValue(['petname2', 'pet name 2', 'pet 2 name']);
          const microchip2 = getValue(['microchipnumber2', 'microchip number 2', 'microchip 2']);
          const breed2 = getValue(['breed2', 'breed 2', 'pet 2 breed']);
          const sex2 = getValue(['sex2', 'sex 2', 'gender2', 'gender 2']);
          const age2 = getValue(['age2', 'age 2', 'pet 2 age']);
          
          if (petName2) {
            pets.push({
              name: petName2,
              type: accommodationType === 'cattery' ? 'cat' : 'dog',
              breed: breed2,
              sex: sex2.toLowerCase().includes('female') ? 'female' : 'male',
              age: age2,
              microchipNumber: microchip2,
              specialRequirements: ''
            });
          }

          // Pet 3
          const petName3 = getValue(['petname3', 'pet name 3', 'pet 3 name']);
          const microchip3 = getValue(['microchipnumber3', 'microchip number 3', 'microchip 3']);
          const breed3 = getValue(['breed3', 'breed 3', 'pet 3 breed']);
          const sex3 = getValue(['sex3', 'sex 3', 'gender3', 'gender 3']);
          const age3 = getValue(['age3', 'age 3', 'pet 3 age']);
          
          if (petName3) {
            pets.push({
              name: petName3,
              type: accommodationType === 'cattery' ? 'cat' : 'dog',
              breed: breed3,
              sex: sex3.toLowerCase().includes('female') ? 'female' : 'male',
              age: age3,
              microchipNumber: microchip3,
              specialRequirements: ''
            });
          }

          // Parse payment amounts
          const paidStr = getValue(['paid', 'amount paid', 'deposit']);
          const totalStr = getValue(['total', 'total price', 'total amount', 'total due', 'balance']);
          
          const paidAmount = parseFloat(paidStr.replace(/[£,$,]/g, '')) || 0;
          const totalAmount = parseFloat(totalStr.replace(/[£,$,]/g, '')) || paidAmount;
          const totalDue = totalAmount - paidAmount;

          // Additional info
          const emergencyContactName = getValue(['emergency contact name', 'emergency name', 'emergency contact']);
          const emergencyContactNumber = getValue(['emergency contact number', 'emergency number', 'emergency phone']);
          const veterinarySurgery = getValue(['vet', 'veterinary', 'vet surgery']);
          const petInsurance = getValue(['insurance', 'pet insurance']);
          const feedingInstructions = getValue(['feeding', 'feeding instructions', 'diet']);
          const medicalInstructions = getValue(['medical instructions', 'medical', 'medication']);
          const behaviourInfo = getValue(['behaviour info', 'behaviour', 'behavior']);
          const escapeInfo = getValue(['escape info', 'escape']);
          const hasAggressionIssues = behaviourInfo.toLowerCase().includes('yes');
          const triesEscape = escapeInfo.toLowerCase().includes('yes');

          // Status mapping
          const statusStr = getValue(['status', 'booking status']);
          let status = 'confirmed';
          if (statusStr.toLowerCase().includes('cancel')) {
            status = 'cancelled';
          } else if (statusStr.toLowerCase().includes('pending')) {
            status = 'pending';
          }

          const booking = {
            customerName,
            customerEmail: email,
            customerPhone: phone,
            customerAddress: getValue(['address', 'street address']),
            customerCity: getValue(['city', 'town']),
            customerCounty: getValue(['state / county', 'county', 'state']),
            customerPostcode: getValue(['postcode', 'post code', 'zip']),
            customerCountry: getValue(['country']) || 'GB',
            emergencyContactName,
            emergencyContactNumber,
            pets,
            veterinarySurgery,
            petInsurance,
            feedingInstructions,
            medicalInstructions,
            hasAggressionIssues,
            aggressionDetails: hasAggressionIssues ? behaviourInfo : '',
            triesEscape,
            escapeDetails: triesEscape ? escapeInfo : '',
            additionalNotes: getValue(['customer note', 'notes', 'comments']),
            accommodationType,
            specificSuite,
            checkIn,
            checkOut,
            numberOfNights,
            totalPrice: totalAmount,
            paidAmount: paidAmount,
            totalDue: totalDue,
            depositAmount: paidAmount,
            specialRequests: getValue(['services', 'special requests', 'extras']),
            status,
            paymentStatus: totalDue <= 0 ? 'paid' : 'partial'
          };

          // Log for debugging
          console.log(`Row ${i} booking:`, {
            customerName,
            email,
            phone,
            checkIn,
            checkOut,
            accommodationType,
            pets: pets.length,
            total: totalAmount,
            paid: paidAmount,
            due: totalDue
          });

          bookings.push(booking);
        } catch (rowError) {
          errors.push(`Row ${i}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`);
        }
      }

      console.log('Parsed bookings:', bookings);

      if (bookings.length === 0) {
        toast.warning('No valid bookings found in the data');
        setResult({
          success: false,
          imported: 0,
          failed: 0,
          errors: ['No valid bookings could be parsed from the data']
        });
        return;
      }

      toast.info(`Sending ${bookings.length} booking(s) to server...`);

      // Send to backend for saving
      const sessionId = localStorage.getItem('admin_session');
      const response = await fetch(`${baseUrl}/api/admin/bookings/import`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({ bookings })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Import failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Ensure errors is always an array
      const backendErrors = Array.isArray(data.errors) ? data.errors : [];
      
      setResult({
        success: data.success || false,
        imported: data.imported || 0,
        failed: data.failed || 0,
        errors: [...errors, ...backendErrors]
      });

      if (data.success) {
        toast.success(`Successfully imported ${data.imported} booking(s)!`);
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        toast.error('Import failed - check errors below');
      }
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Import failed: ${errorMessage}`);
      setResult({
        success: false,
        imported: 0,
        failed: 0,
        errors: ['Failed to import: ' + errorMessage]
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Alert>
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold">Import Existing Bookings</p>
            <p className="text-sm">
              Paste your booking data with headers from Excel/CSV. The system will automatically map the fields.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Tip:</strong> Copy directly from Excel (Ctrl+C) and paste here. Tab-separated values work best.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* CSV Import */}
      <Card>
        <CardHeader>
          <CardTitle>Import Bookings</CardTitle>
          <CardDescription>
            Paste data with the following columns (tab-separated from Excel):
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
            <div className="whitespace-nowrap">
              ID, Status, Check-in, Check-out, Accommodation Type, Accommodation, First Name, Last Name, 
              Email, Phone, Country, Address, City, State/County, Postcode, Emergency Contact Name, 
              Emergency Contact Number, Full Guest Name, microchipnumber1, breed, sex, age, vet, insurance, 
              feeding, behaviour, escape, petname2, microchipnumber2, breed2, sex2, age2, petname3, 
              microchipnumber3, breed3, sex3, age3, Medical instructions, Behaviour info, Escape info, Total
            </div>
          </div>

          <div>
            <Label htmlFor="csv-data">Paste Your Data Here</Label>
            <Textarea
              id="csv-data"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste data from Excel (with headers in first row)"
              rows={12}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCSVImport} disabled={isImporting || !csvData.trim()} className="flex-1">
              {isImporting ? 'Importing...' : 'Import Bookings'}
            </Button>
            <Button onClick={loadSampleData} variant="outline" disabled={isImporting}>
              Load Sample Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Result */}
      {result && (
        <Card className={result.success ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <CardTitle className={result.success ? 'text-green-600' : 'text-red-600'}>
              Import {result.success ? 'Successful' : 'Completed with Errors'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Successfully Imported</p>
                <p className="text-2xl font-bold text-green-600">{result.imported}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{result.failed}</p>
              </div>
            </div>
            
            {Array.isArray(result.errors) && result.errors.length > 0 && (
              <div className="mt-4">
                <Label className="text-red-600">Errors / Warnings:</Label>
                <div className="mt-2 space-y-1 max-h-64 overflow-y-auto bg-muted p-3 rounded">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">• {error}</p>
                  ))}
                </div>
              </div>
            )}
            
            {result.imported > 0 && (
              <Alert className="mt-4 border-green-500">
                <AlertDescription className="text-green-600">
                  ✅ {result.imported} booking{result.imported > 1 ? 's' : ''} successfully imported!
                  {result.failed > 0 && ` (${result.failed} row${result.failed > 1 ? 's' : ''} skipped due to errors)`}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}





















