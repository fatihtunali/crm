'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRestaurantFromSuppliers, useUpdateRestaurant, useSuppliers } from '@/lib/api/hooks/use-suppliers';
import { useCities } from '@/lib/api/hooks/use-catalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function RestaurantEditPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const restaurantId = parseInt(params.id as string);

  const { data: restaurant, isLoading } = useRestaurantFromSuppliers(restaurantId);
  const { data: cities = [] } = useCities();
  const { data: suppliers = [] } = useSuppliers();
  const updateRestaurant = useUpdateRestaurant();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cityId: 0,
    supplierId: null as number | null,
  });

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        category: restaurant.category || '',
        cityId: restaurant.city?.id || 0,
        supplierId: restaurant.supplier?.id || null,
      });
    }
  }, [restaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateRestaurant.mutateAsync({
      id: restaurantId,
      data: formData,
    });

    router.push(`/${locale}/suppliers/restaurants`);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Restaurant not found</h2>
          <Link href={`/${locale}/suppliers/restaurants`}>
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Restaurants
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
          <Link href={`/${locale}/suppliers/restaurants`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Restaurant</h1>
            <p className="text-gray-700 mt-1">Update restaurant information</p>
          </div>
        </div>
        <Link href={`/${locale}/suppliers/restaurants/${restaurantId}/menus`}>
          <Button variant="outline">
            Manage Menus
          </Button>
        </Link>
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
          <Button type="submit" disabled={updateRestaurant.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateRestaurant.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
