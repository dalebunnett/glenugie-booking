// DEBUG VERSION - Testing date blocking
import { useState, useEffect } from 'react';
import { Calendar } from './ui/calendar';
import { baseUrl } from '../lib/base-url';

export default function BookingFormDebug() {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();

  useEffect(() => {
    // Fetch availability for a test suite
    const fetchAvailability = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/availability/sniffany`);
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 RAW DATA:', data);
          
          const booked: Date[] = [];
          data?.forEach((booking: any) => {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            
            const current = new Date(checkIn);
            while (current < checkOut) {
              const dateKey = current.toISOString().split('T')[0];
              const [year, month, day] = dateKey.split('-').map(Number);
              const date = new Date(Date.UTC(year, month - 1, day));
              booked.push(date);
              console.log('📅 Adding booked date:', dateKey, '→', date.toISOString());
              current.setDate(current.getDate() + 1);
            }
          });
          
          setBookedDates(booked);
          console.log('✅ Total booked dates:', booked.length);
          console.log('✅ Booked dates:', booked.map(d => d.toISOString().split('T')[0]).join(', '));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchAvailability();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Date Blocking Debug</h1>
      
      <div className="mb-4 p-4 bg-muted rounded">
        <p className="font-semibold">Booked Dates ({bookedDates.length}):</p>
        <p className="text-sm">{bookedDates.map(d => d.toISOString().split('T')[0]).join(', ')}</p>
      </div>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        disabled={(date) => {
          const normalizedDate = new Date(date);
          normalizedDate.setHours(0, 0, 0, 0);
          const dateStr = normalizedDate.toISOString().split('T')[0];
          
          const isBooked = bookedDates.some(bookedDate => {
            const normalizedBookedDate = new Date(bookedDate);
            normalizedBookedDate.setHours(0, 0, 0, 0);
            const bookedStr = normalizedBookedDate.toISOString().split('T')[0];
            const match = bookedStr === dateStr;
            if (match) {
              console.log('🔴 BLOCKING:', dateStr, 'matches', bookedStr);
            }
            return match;
          });
          
          return isBooked;
        }}
        modifiers={{
          booked: bookedDates
        }}
        modifiersClassNames={{
          booked: 'bg-red-500 text-white line-through opacity-50'
        }}
        className="rounded-md border"
      />
      
      {selectedDate && (
        <div className="mt-4 p-4 bg-muted rounded">
          <p>Selected: {selectedDate.toISOString().split('T')[0]}</p>
        </div>
      )}
    </div>
  );
}
