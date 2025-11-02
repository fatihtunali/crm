'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTourFromSuppliers, useUpdateTour, useSuppliers } from '@/lib/api/hooks/use-suppliers';
import { SupplierType } from '@/lib/api/endpoints/suppliers';
import { useCities } from '@/lib/api/hooks/use-catalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function TourEditPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const tourId = parseInt(params.id as string);

  const { data: tour, isLoading } = useTourFromSuppliers(tourId);
  const { data: cities = [] } = useCities();
  const { data: suppliers = [] } = useSuppliers({ type: SupplierType.ACTIVITY_OPERATOR });
  const updateTour = useUpdateTour();

  const [formData, setFormData] = useState({
    tourName: '',
    description: '',
    cityId: 0,
    supplierId: null as number | null,
    duration: '',
    tourCode: '',
    durationDays: null as number | null,
    durationHours: null as number | null,
    durationType: 'days',
    tourType: '',
    inclusions: '',
    exclusions: '',
    photoUrl1: '',
    photoUrl2: '',
    photoUrl3: '',
  });

  useEffect(() => {
    if (tour) {
      setFormData({
        tourName: tour.tourName || '',
        description: tour.description || '',
        cityId: tour.city?.id || 0,
        supplierId: tour.supplier?.id || null,
        duration: tour.duration || '',
        tourCode: tour.tourCode || '',
        durationDays: tour.durationDays || null,
        durationHours: tour.durationHours || null,
        durationType: tour.durationType || 'days',
        tourType: tour.tourType || '',
        inclusions: tour.inclusions || '',
        exclusions: tour.exclusions || '',
        photoUrl1: tour.photoUrl1 || '',
        photoUrl2: tour.photoUrl2 || '',
        photoUrl3: tour.photoUrl3 || '',
      });
    }
  }, [tour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateTour.mutateAsync({
      id: tourId,
      data: formData,
    });

    router.push(`/${locale}/suppliers/tours`);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Tour not found</h2>
          <Link href={`/${locale}/suppliers/tours`}>
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tours
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/suppliers/tours`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Tour</h1>
            <p className="text-gray-700 mt-1">Update tour information</p>
          </div>
        </div>
        <Link href={`/${locale}/suppliers/tours/${tourId}/pricing`}>
          <Button variant="outline">
            Manage Pricing
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tourName">Tour Name *</Label>
                <Input
                  id="tourName"
                  value={formData.tourName}
                  onChange={(e) => setFormData({ ...formData, tourName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cityId">City *</Label>
                <Select
                  value={formData.cityId.toString()}
                  onValueChange={(value: string) => setFormData({ ...formData, cityId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="supplierId">Supplier</Label>
                <Select
                  value={formData.supplierId?.toString() || 'none'}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, supplierId: value === 'none' ? null : parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Supplier</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.party?.name || `Supplier ${supplier.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., Full Day, Half Day, 3 hours"
                />
              </div>

              <div>
                <Label htmlFor="tourCode">Tour Code</Label>
                <Input
                  id="tourCode"
                  value={formData.tourCode}
                  onChange={(e) => setFormData({ ...formData, tourCode: e.target.value })}
                  placeholder="e.g., IST-001"
                />
              </div>

              <div>
                <Label htmlFor="tourType">Tour Type</Label>
                <Select
                  value={formData.tourType}
                  onValueChange={(value: string) => setFormData({ ...formData, tourType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tour type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIC">SIC (Seat-in-Coach)</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="durationType">Duration Type</Label>
                <Select
                  value={formData.durationType}
                  onValueChange={(value: string) => setFormData({ ...formData, durationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="durationDays">Duration (Days)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  min="1"
                  value={formData.durationDays || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, durationDays: e.target.value ? parseInt(e.target.value) : null })
                  }
                />
              </div>

              <div>
                <Label htmlFor="durationHours">Duration (Hours)</Label>
                <Input
                  id="durationHours"
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={formData.durationHours || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, durationHours: e.target.value ? parseFloat(e.target.value) : null })
                  }
                />
              </div>

              <div>
                <Label htmlFor="inclusions">Inclusions</Label>
                <Textarea
                  id="inclusions"
                  value={formData.inclusions}
                  onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                  rows={3}
                  placeholder="What's included in the tour"
                />
              </div>

              <div>
                <Label htmlFor="exclusions">Exclusions</Label>
                <Textarea
                  id="exclusions"
                  value={formData.exclusions}
                  onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                  rows={3}
                  placeholder="What's not included"
                />
              </div>

              <div>
                <Label htmlFor="photoUrl1">Photo URL 1</Label>
                <Input
                  id="photoUrl1"
                  value={formData.photoUrl1}
                  onChange={(e) => setFormData({ ...formData, photoUrl1: e.target.value })}
                  placeholder="https://example.com/photo1.jpg"
                />
              </div>

              <div>
                <Label htmlFor="photoUrl2">Photo URL 2</Label>
                <Input
                  id="photoUrl2"
                  value={formData.photoUrl2}
                  onChange={(e) => setFormData({ ...formData, photoUrl2: e.target.value })}
                  placeholder="https://example.com/photo2.jpg"
                />
              </div>

              <div>
                <Label htmlFor="photoUrl3">Photo URL 3</Label>
                <Input
                  id="photoUrl3"
                  value={formData.photoUrl3}
                  onChange={(e) => setFormData({ ...formData, photoUrl3: e.target.value })}
                  placeholder="https://example.com/photo3.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Link href={`/${locale}/suppliers/tours`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={updateTour.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateTour.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
