'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  useServiceOffering,
  useUpdateServiceOffering,
} from '@/lib/api/hooks/use-suppliers';
import { useSuppliers } from '@/lib/api/hooks/use-suppliers';
import { ServiceType } from '@/lib/api/endpoints/suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const serviceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.HOTEL_ROOM]: 'Hotel Room',
  [ServiceType.TRANSFER]: 'Transfer',
  [ServiceType.VEHICLE_HIRE]: 'Vehicle Hire',
  [ServiceType.GUIDE_SERVICE]: 'Guide Service',
  [ServiceType.ACTIVITY]: 'Activity',
};

export default function EditServiceOfferingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const id = parseInt(params.id as string);

  const { data: offeringResponse, isLoading } = useServiceOffering(id);
  const { data: suppliers } = useSuppliers();
  const updateOffering = useUpdateServiceOffering();

  const [formData, setFormData] = useState({
    supplierId: '',
    serviceType: ServiceType.HOTEL_ROOM,
    title: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    if (offeringResponse?.data) {
      const offering = offeringResponse.data;
      setFormData({
        supplierId: offering.supplierId.toString(),
        serviceType: offering.serviceType,
        title: offering.title,
        location: offering.location || '',
        description: offering.description || '',
      });
    }
  }, [offeringResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateOffering.mutateAsync({
      id,
      data: {
        title: formData.title,
        location: formData.location || undefined,
        description: formData.description || undefined,
      },
    });

    router.push(`/${locale}/catalog`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!offeringResponse?.data) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Service offering not found</h2>
          <Link href={`/${locale}/catalog`}>
            <Button className="mt-4">Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const offering = offeringResponse.data;

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/${locale}/catalog`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Service Offering</h1>
        <p className="text-gray-700 mt-1 text-base">
          Update details for {offering.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, serviceType: value as ServiceType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(serviceTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="supplierId">Supplier *</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value: string) => setFormData({ ...formData, supplierId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.party?.name} ({supplier.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Deluxe Room with Sea View"
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Istanbul, Turkey"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Detailed description of the service..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Link href={`/${locale}/catalog`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={!formData.supplierId || !formData.title || updateOffering.isPending}
              >
                {updateOffering.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Additional Features</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Continue building your service offering:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            <li>Add type-specific details (room types, vehicle specs, etc.)</li>
            <li>Set up rate cards with seasonal pricing</li>
            <li>Define pricing models (per night, per person, per group, etc.)</li>
            <li>Manage availability and blackout dates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
