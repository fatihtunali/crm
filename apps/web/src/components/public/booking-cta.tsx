'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MessageCircle, Check } from 'lucide-react';
import { useRequestBooking } from '@/lib/api/hooks/use-customer-itineraries';
import { toast } from 'sonner';

interface BookingCTAProps {
  uuid: string;
  customerEmail?: string;
  customerPhone?: string;
}

export function BookingCTA({ uuid, customerEmail, customerPhone }: BookingCTAProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingRequested, setBookingRequested] = useState(false);

  const requestBookingMutation = useRequestBooking();

  const handleRequestBooking = async () => {
    try {
      // TODO: Backend doesn't currently support notes, but we collect them for future use
      await requestBookingMutation.mutateAsync(uuid);
      setBookingRequested(true);
      toast.success('Booking request submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit booking request');
    }
  };

  if (bookingRequested) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-600 rounded-full p-2">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 text-lg">Booking Request Received!</h3>
              <p className="text-sm text-green-800">
                Our team will contact you shortly to confirm your booking.
              </p>
            </div>
          </div>
          <div className="border-t border-green-200 pt-4 mt-4">
            <p className="text-sm text-green-800">
              We&apos;ll reach out within 24 hours to finalize your travel arrangements.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showBookingForm) {
    return (
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-purple-900 text-lg mb-4">Request Booking</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-1">
                Additional Notes (optional)
              </label>
              <Textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Any questions or special requests before booking?"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRequestBooking}
                disabled={requestBookingMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {requestBookingMutation.isPending ? 'Submitting...' : 'Confirm Booking Request'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBookingForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <CardContent className="pt-6">
        <h3 className="font-semibold text-xl mb-2">Love This Itinerary?</h3>
        <p className="text-purple-100 mb-4">
          Click below to request a booking, and our team will reach out to finalize your travel plans.
        </p>
        <Button
          onClick={() => setShowBookingForm(true)}
          size="lg"
          className="w-full bg-white text-purple-600 hover:bg-purple-50"
        >
          Request Booking
        </Button>

        <div className="border-t border-purple-400 pt-4 mt-4">
          <p className="text-sm text-purple-100 mb-3">Or contact us directly:</p>
          <div className="space-y-2">
            {customerPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>{customerPhone}</span>
              </div>
            )}
            {customerEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>{customerEmail}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp: +90 123 456 7890</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
