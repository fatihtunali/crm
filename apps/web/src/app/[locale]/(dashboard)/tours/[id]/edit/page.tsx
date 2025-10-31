'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTour, useUpdateTour } from '@/lib/api/hooks/use-tours';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { UpdateTourDto } from '@/lib/api/types';

export default function EditTourPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const tourId = parseInt(params.id as string);

  const { data: tour, isLoading } = useTour(tourId);
  const updateTour = useUpdateTour();

  const [formData, setFormData] = useState<UpdateTourDto>({
    code: '',
    name: '',
    description: '',
    baseCapacity: 1,
    seasonStart: '',
    seasonEnd: '',
    defaultMarkupPct: 25,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when tour data is loaded
  useEffect(() => {
    if (tour) {
      setFormData({
        code: tour.code || '',
        name: tour.name || '',
        description: tour.description || '',
        baseCapacity: tour.baseCapacity || 1,
        seasonStart: tour.seasonStart ? tour.seasonStart.split('T')[0] : '',
        seasonEnd: tour.seasonEnd ? tour.seasonEnd.split('T')[0] : '',
        defaultMarkupPct: tour.defaultMarkupPct || 25,
        isActive: tour.isActive,
      });
    }
  }, [tour]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.code?.trim()) {
      newErrors.code = 'Tour code is required';
    }
    if (!formData.name?.trim()) {
      newErrors.name = 'Tour name is required';
    }
    if (formData.baseCapacity && formData.baseCapacity < 1) {
      newErrors.baseCapacity = 'Base capacity must be at least 1';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateTour.mutateAsync({ id: tourId, data: formData });
      router.push(`/${locale}/tours/${tourId}`);
    } catch (error) {
      console.error('Failed to update tour:', error);
      alert('Failed to update tour. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="p-8">
        <p>Tour not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Tour</h1>
          <p className="text-gray-700 mt-1 text-base">
            Update tour information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Code - Required */}
              <div className="space-y-2">
                <Label htmlFor="code">
                  Tour Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="IST-7D"
                  className={errors.code ? 'border-red-500' : ''}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
              </div>

              {/* Name - Required */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tour Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="7 Days Istanbul & Cappadocia"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Explore the wonders of Istanbul and magical landscapes of Cappadocia"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Capacity */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pricing & Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Base Capacity */}
              <div className="space-y-2">
                <Label htmlFor="baseCapacity">
                  Base Capacity (pax) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="baseCapacity"
                  name="baseCapacity"
                  type="number"
                  min="1"
                  value={formData.baseCapacity}
                  onChange={handleNumberChange}
                  className={errors.baseCapacity ? 'border-red-500' : ''}
                />
                {errors.baseCapacity && (
                  <p className="text-sm text-red-500">{errors.baseCapacity}</p>
                )}
              </div>

              {/* Default Markup % */}
              <div className="space-y-2">
                <Label htmlFor="defaultMarkupPct">Default Markup (%)</Label>
                <Input
                  id="defaultMarkupPct"
                  name="defaultMarkupPct"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.defaultMarkupPct}
                  onChange={handleNumberChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Season */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Season Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Season Start */}
              <div className="space-y-2">
                <Label htmlFor="seasonStart">Season Start</Label>
                <Input
                  id="seasonStart"
                  name="seasonStart"
                  type="date"
                  value={formData.seasonStart}
                  onChange={handleChange}
                />
              </div>

              {/* Season End */}
              <div className="space-y-2">
                <Label htmlFor="seasonEnd">Season End</Label>
                <Input
                  id="seasonEnd"
                  name="seasonEnd"
                  type="date"
                  value={formData.seasonEnd}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Itinerary Note */}
        {tour.itineraries && tour.itineraries.length > 0 && (
          <Card className="mb-6 border-indigo-300">
            <CardContent className="p-4">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> This tour has {tour.itineraries.length} itinerary day(s).
                Itinerary editing is currently managed separately. The itinerary will remain unchanged when you update this tour.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateTour.isPending}
          >
            {updateTour.isPending ? 'Updating...' : 'Update Tour'}
          </Button>
        </div>
      </form>
    </div>
  );
}
