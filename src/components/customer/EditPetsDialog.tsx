import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
import type { Booking, Pet } from '../../lib/booking-types';

interface EditPetsDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedBooking: Booking) => void;
}

export default function EditPetsDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: EditPetsDialogProps) {
  const [pets, setPets] = useState<Pet[]>(booking.pets);
  const [additionalInfo, setAdditionalInfo] = useState({
    veterinarySurgery: booking.veterinarySurgery || '',
    petInsurance: booking.petInsurance || '',
    feedingInstructions: booking.feedingInstructions || '',
    medicalInstructions: booking.medicalInstructions || '',
    hasAggressionIssues: booking.hasAggressionIssues,
    aggressionDetails: booking.aggressionDetails || '',
    triesEscape: booking.triesEscape,
    escapeDetails: booking.escapeDetails || '',
    additionalNotes: booking.additionalNotes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updatePet = (index: number, field: keyof Pet, value: string) => {
    const updatedPets = [...pets];
    updatedPets[index] = { ...updatedPets[index], [field]: value };
    setPets(updatedPets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/customer/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pets,
          ...additionalInfo,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update pet details');
      }

      const updatedBooking = await response.json();
      onSuccess(updatedBooking);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pet details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pet Details</DialogTitle>
          <DialogDescription>
            Update your pet information and care instructions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pet Information */}
          {pets.map((pet, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-lg">Pet {index + 1}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pet Name *</Label>
                  <Input
                    value={pet.name}
                    onChange={(e) => updatePet(index, 'name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={pet.type}
                    onValueChange={(value: 'dog' | 'cat') => updatePet(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Breed *</Label>
                  <Input
                    value={pet.breed}
                    onChange={(e) => updatePet(index, 'breed', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sex *</Label>
                  <Select
                    value={pet.sex}
                    onValueChange={(value: 'male' | 'female') => updatePet(index, 'sex', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Age *</Label>
                  <Input
                    value={pet.age}
                    onChange={(e) => updatePet(index, 'age', e.target.value)}
                    placeholder="e.g., 3 years"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Microchip Number *</Label>
                  <Input
                    value={pet.microchipNumber}
                    onChange={(e) => updatePet(index, 'microchipNumber', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Special Requirements</Label>
                  <Textarea
                    value={pet.specialRequirements || ''}
                    onChange={(e) => updatePet(index, 'specialRequirements', e.target.value)}
                    placeholder="Any special needs or requirements"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Additional Care Information */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-lg">Care Instructions</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Veterinary Surgery</Label>
                <Input
                  value={additionalInfo.veterinarySurgery}
                  onChange={(e) =>
                    setAdditionalInfo({ ...additionalInfo, veterinarySurgery: e.target.value })
                  }
                  placeholder="Vet name and contact"
                />
              </div>

              <div className="space-y-2">
                <Label>Pet Insurance</Label>
                <Input
                  value={additionalInfo.petInsurance}
                  onChange={(e) =>
                    setAdditionalInfo({ ...additionalInfo, petInsurance: e.target.value })
                  }
                  placeholder="Insurance provider and policy number"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Feeding Instructions</Label>
                <Textarea
                  value={additionalInfo.feedingInstructions}
                  onChange={(e) =>
                    setAdditionalInfo({ ...additionalInfo, feedingInstructions: e.target.value })
                  }
                  placeholder="Food type, portions, feeding times"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Medical Instructions</Label>
                <Textarea
                  value={additionalInfo.medicalInstructions}
                  onChange={(e) =>
                    setAdditionalInfo({ ...additionalInfo, medicalInstructions: e.target.value })
                  }
                  placeholder="Medications, dosages, health conditions"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Additional Notes</Label>
                <Textarea
                  value={additionalInfo.additionalNotes}
                  onChange={(e) =>
                    setAdditionalInfo({ ...additionalInfo, additionalNotes: e.target.value })
                  }
                  placeholder="Any other information we should know"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
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
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
