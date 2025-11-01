'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { CityNightsBuilder } from '@/components/public/city-nights-builder';
import { DateRangePicker } from '@/components/common/date-range-picker';
import { useGenerateItinerary } from '@/lib/api/hooks/use-customer-itineraries';
import { toast } from 'sonner';
import Link from 'next/link';

const itineraryRequestSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  customerPhone: z.string().min(5, 'Phone number must be at least 5 characters').optional().or(z.literal('')),
  destination: z.string().min(2, 'Destination is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  adults: z.number().int().min(1, 'At least 1 adult required'),
  children: z.number().int().min(0),
  hotelCategory: z.string().optional(),
  tourType: z.enum(['SIC', 'PRIVATE']).optional(),
  cityNights: z.string().min(1, 'Please add at least one city'),
  specialRequests: z.string().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type ItineraryRequestForm = z.infer<typeof itineraryRequestSchema>;

export default function ItineraryRequestPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const generateMutation = useGenerateItinerary();

  const form = useForm<ItineraryRequestForm>({
    resolver: zodResolver(itineraryRequestSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      destination: 'Turkey',
      startDate: '',
      endDate: '',
      adults: 2,
      children: 0,
      hotelCategory: '4 stars',
      tourType: 'SIC',
      cityNights: '',
      specialRequests: '',
    },
  });

  const onSubmit = async (formData: ItineraryRequestForm) => {
    try {
      const result = await generateMutation.mutateAsync({
        data: formData,
        tenantId: 1, // Default tenant ID for public portal
      });

      toast.success('Your itinerary has been generated!');
      router.push(`/${locale}/portal/itinerary/${result.uuid}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate itinerary');
    }
  };

  const handleNext = async () => {
    const fields = getStepFields(step);
    const isValid = await form.trigger(fields);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const getStepFields = (currentStep: number): (keyof ItineraryRequestForm)[] => {
    switch (currentStep) {
      case 1:
        return ['customerName', 'customerEmail', 'customerPhone'];
      case 2:
        return ['destination', 'startDate', 'endDate', 'adults', 'children'];
      case 3:
        return ['hotelCategory', 'tourType', 'cityNights'];
      case 4:
        return ['specialRequests'];
      default:
        return [];
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href={`/${locale}/portal`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Request Your AI-Generated Itinerary
        </h1>
        <p className="text-lg text-gray-600">
          Tell us about your travel plans, and we&apos;ll create a personalized itinerary for you
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= s
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < totalSteps && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <p className="text-xs text-center text-gray-600">Contact Info</p>
          <p className="text-xs text-center text-gray-600">Trip Details</p>
          <p className="text-xs text-center text-gray-600">Preferences</p>
          <p className="text-xs text-center text-gray-600">Review</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Your Contact Information'}
              {step === 2 && 'Trip Details'}
              {step === 3 && 'Your Preferences'}
              {step === 4 && 'Special Requests & Review'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Contact Information */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    {...form.register('customerName')}
                    placeholder="John Doe"
                  />
                  {form.formState.errors.customerName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.customerName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address (optional)
                  </label>
                  <Input
                    {...form.register('customerEmail')}
                    type="email"
                    placeholder="john@example.com"
                  />
                  {form.formState.errors.customerEmail && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.customerEmail.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (optional)
                  </label>
                  <Input
                    {...form.register('customerPhone')}
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                  />
                  {form.formState.errors.customerPhone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.customerPhone.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Trip Details */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination *
                  </label>
                  <Input
                    {...form.register('destination')}
                    placeholder="Turkey"
                  />
                  {form.formState.errors.destination && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.destination.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Dates *
                  </label>
                  <DateRangePicker
                    startDate={form.watch('startDate')}
                    endDate={form.watch('endDate')}
                    onStartDateChange={(date) => form.setValue('startDate', date)}
                    onEndDateChange={(date) => form.setValue('endDate', date)}
                    minDate={new Date().toISOString().split('T')[0]}
                  />
                  {(form.formState.errors.startDate || form.formState.errors.endDate) && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.startDate?.message || form.formState.errors.endDate?.message}
                    </p>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adults *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      {...form.register('adults', { valueAsNumber: true })}
                    />
                    {form.formState.errors.adults && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.adults.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Children
                    </label>
                    <Input
                      type="number"
                      min="0"
                      {...form.register('children', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Category
                  </label>
                  <Select
                    value={form.watch('hotelCategory')}
                    onValueChange={(val: string) => form.setValue('hotelCategory', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 stars">3 Stars</SelectItem>
                      <SelectItem value="4 stars">4 Stars</SelectItem>
                      <SelectItem value="5 stars">5 Stars</SelectItem>
                      <SelectItem value="Boutique">Boutique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tour Type
                  </label>
                  <Select
                    value={form.watch('tourType')}
                    onValueChange={(val: string) => form.setValue('tourType', val as 'SIC' | 'PRIVATE' | undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIC">SIC (Shared Tours)</SelectItem>
                      <SelectItem value="PRIVATE">Private Tours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City Itinerary *
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Select the cities you want to visit and how many nights you&apos;ll stay in each
                  </p>
                  <CityNightsBuilder
                    value={form.watch('cityNights')}
                    onChange={(value) => form.setValue('cityNights', value)}
                  />
                  {form.formState.errors.cityNights && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.cityNights.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Step 4: Special Requests & Review */}
            {step === 4 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (optional)
                  </label>
                  <Textarea
                    {...form.register('specialRequests')}
                    placeholder="Any special requirements, dietary restrictions, accessibility needs, or specific interests..."
                    rows={4}
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Review Your Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{form.watch('customerName')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destination:</span>
                      <span className="font-medium">{form.watch('destination')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dates:</span>
                      <span className="font-medium">
                        {form.watch('startDate')} to {form.watch('endDate')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Travelers:</span>
                      <span className="font-medium">
                        {form.watch('adults')} Adults, {form.watch('children')} Children
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Itinerary:</span>
                      <span className="font-medium">
                        {form.watch('cityNights').split(',').map(cn => cn.split(':')[0]).join(' → ')}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          <div className="ml-auto">
            {step < totalSteps ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={generateMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generateMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate My Itinerary
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
