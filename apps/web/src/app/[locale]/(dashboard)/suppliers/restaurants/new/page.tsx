'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCreateRestaurant, useSuppliers } from '@/lib/api/hooks/use-suppliers';
import { useCities } from '@/lib/api/hooks/use-catalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewRestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const { data: cities = [] } = useCities();
  const { data: suppliers = [] } = useSuppliers();
  const createRestaurant = useCreateRestaurant();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cityId: 0,
    supplierId: null as number | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createRestaurant.mutateAsync(formData);

    router.push(`/${locale}/suppliers/restaurants`);
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/suppliers/restaurants`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Restaurant</h1>
            <p className="text-gray-700 mt-1">Create a new restaurant in your catalog</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter restaurant name"
              />
            </div>

            <div>
              <Label htmlFor="cityId">City *</Label>
              <Select
                value={formData.cityId > 0 ? formData.cityId.toString() : ''}
                onValueChange={(value: string) => setFormData({ ...formData, cityId: parseInt(value) })}
                required
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
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Fine Dining, Casual, Fast Food"
              />
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
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Link href={`/${locale}/suppliers/restaurants`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={createRestaurant.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {createRestaurant.isPending ? 'Creating...' : 'Create Restaurant'}
          </Button>
        </div>
      </form>
    </div>
  );
}
