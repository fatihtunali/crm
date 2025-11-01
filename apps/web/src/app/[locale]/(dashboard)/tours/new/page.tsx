'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCreateTour } from '@/lib/api/hooks/use-tours';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { CreateTourDto, CreateItineraryDto } from '@/lib/api/types';

export default function NewTourPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const createTour = useCreateTour();

  const [formData, setFormData] = useState<CreateTourDto>({
    code: '',
    name: '',
    description: '',
    baseCapacity: 1,
    seasonStart: '',
    seasonEnd: '',
    defaultMarkupPct: 25,
    isActive: true,
    itineraries: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const addItineraryDay = () => {
    const newDay: CreateItineraryDto = {
      dayNumber: (formData.itineraries?.length || 0) + 1,
      title: '',
      description: '',
      transport: '',
      accommodation: '',
      meals: '',
    };
    setFormData((prev) => ({
      ...prev,
      itineraries: [...(prev.itineraries || []), newDay],
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itineraries: prev.itineraries?.filter((_, i) => i !== index).map((day, i) => ({
        ...day,
        dayNumber: i + 1,
      })),
    }));
  };

  const updateItineraryDay = (
    index: number,
    field: keyof CreateItineraryDto,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      itineraries: prev.itineraries?.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) {
      newErrors.code = 'Tour code is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Tour name is required';
    }
    if (formData.baseCapacity < 1) {
      newErrors.baseCapacity = 'Base capacity must be at least 1';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const tour = await createTour.mutateAsync(formData);
      router.push(`/${locale}/tours/${tour.id}`);
    } catch (error) {
      console.error('Failed to create tour:', error);
      alert('Failed to create tour. Please try again.');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">New Tour</h1>
          <p className="text-gray-700 mt-1 text-base">
            Create a new tour package with itinerary
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

        {/* Itinerary */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Itinerary</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItineraryDay}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.itineraries && formData.itineraries.length > 0 ? (
              formData.itineraries.map((day, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Day {day.dayNumber}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItineraryDay(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`day-${index}-title`}>
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`day-${index}-title`}
                        value={day.title}
                        onChange={(e) =>
                          updateItineraryDay(index, 'title', e.target.value)
                        }
                        placeholder="Istanbul City Tour"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`day-${index}-description`}>Description</Label>
                      <Textarea
                        id={`day-${index}-description`}
                        value={day.description}
                        onChange={(e) =>
                          updateItineraryDay(index, 'description', e.target.value)
                        }
                        placeholder="Visit Hagia Sophia, Blue Mosque, and Grand Bazaar"
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor={`day-${index}-transport`}>Transport</Label>
                        <Input
                          id={`day-${index}-transport`}
                          value={day.transport}
                          onChange={(e) =>
                            updateItineraryDay(index, 'transport', e.target.value)
                          }
                          placeholder="Private bus transfer"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`day-${index}-accommodation`}>Accommodation</Label>
                        <Input
                          id={`day-${index}-accommodation`}
                          value={day.accommodation}
                          onChange={(e) =>
                            updateItineraryDay(index, 'accommodation', e.target.value)
                          }
                          placeholder="Grand Istanbul Hotel 5*"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`day-${index}-meals`}>Meals</Label>
                        <Input
                          id={`day-${index}-meals`}
                          value={day.meals}
                          onChange={(e) =>
                            updateItineraryDay(index, 'meals', e.target.value)
                          }
                          placeholder="Breakfast, Lunch, Dinner"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No itinerary days added yet. Click &quot;Add Day&quot; to start building your tour itinerary.
              </p>
            )}
          </CardContent>
        </Card>

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
            disabled={createTour.isPending}
          >
            {createTour.isPending ? 'Creating...' : 'Create Tour'}
          </Button>
        </div>
      </form>
    </div>
  );
}
