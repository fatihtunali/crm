'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useCreateServiceOffering } from '@/lib/api/hooks/use-suppliers';
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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const serviceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.HOTEL_ROOM]: 'Hotel Room',
  [ServiceType.TRANSFER]: 'Transfer',
  [ServiceType.VEHICLE_HIRE]: 'Vehicle Hire',
  [ServiceType.GUIDE_SERVICE]: 'Guide Service',
  [ServiceType.ACTIVITY]: 'Activity',
};

export default function NewServiceOfferingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const typeParam = searchParams.get('type') as ServiceType;

  const [formData, setFormData] = useState({
    supplierId: '',
    serviceType: typeParam || ServiceType.HOTEL_ROOM,
    title: '',
    location: '',
    description: '',
  });

  const { data: suppliers } = useSuppliers();
  const createOffering = useCreateServiceOffering();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createOffering.mutateAsync({
      supplierId: parseInt(formData.supplierId),
      serviceType: formData.serviceType,
      title: formData.title,
      location: formData.location || undefined,
      description: formData.description || undefined,
    });

    router.push(`/${locale}/catalog`);
  };

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
        <h1 className="text-3xl font-bold text-gray-900">New Service Offering</h1>
        <p className="text-gray-700 mt-1 text-base">
          Add a new service to your catalog
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
              <Button type="submit" disabled={!formData.supplierId || !formData.title}>
                Create Service Offering
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>What&apos;s Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            After creating the service offering, you&apos;ll be able to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            <li>Add type-specific details (room types, vehicle specs, etc.)</li>
            <li>Set up rate cards with seasonal pricing</li>
            <li>Define pricing models (per night, per person, per group, etc.)</li>
            <li>Add service to bookings and quotations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
