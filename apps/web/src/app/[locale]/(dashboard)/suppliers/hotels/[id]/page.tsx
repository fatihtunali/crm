'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHotelFromSuppliers, useUpdateHotel, useSuppliers } from '@/lib/api/hooks/use-suppliers';
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

export default function HotelEditPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const hotelId = parseInt(params.id as string);

  const { data: hotel, isLoading } = useHotelFromSuppliers(hotelId);
  const { data: cities = [] } = useCities();
  const { data: suppliers = [] } = useSuppliers({ type: SupplierType.HOTEL });
  const updateHotel = useUpdateHotel();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    cityId: 0,
    supplierId: null as number | null,
    isBoutique: false,
    starRating: null as number | null,
    hotelCategory: '',
    roomCount: null as number | null,
    contactPhone: '',
    contactEmail: '',
    notes: '',
  });

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        category: hotel.category || '',
        address: hotel.address || '',
        cityId: hotel.city?.id || 0,
        supplierId: hotel.supplier?.id || null,
        isBoutique: hotel.isBoutique || false,
        starRating: hotel.starRating || null,
        hotelCategory: hotel.hotelCategory || '',
        roomCount: hotel.roomCount || null,
        contactPhone: hotel.contactPhone || '',
        contactEmail: hotel.contactEmail || '',
        notes: hotel.notes || '',
      });
    }
  }, [hotel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateHotel.mutateAsync({
      id: hotelId,
      data: formData,
    });

    router.push(`/${locale}/suppliers/hotels`);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Hotel not found</h2>
          <Link href={`/${locale}/suppliers/hotels`}>
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hotels
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
          <Link href={`/${locale}/suppliers/hotels`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Hotel</h1>
            <p className="text-gray-700 mt-1">Update hotel information</p>
          </div>
        </div>
        <Link href={`/${locale}/suppliers/hotels/${hotelId}/rates`}>
          <Button variant="outline">
            Manage Rates
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
                <Label htmlFor="name">Hotel Name *</Label>
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
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isBoutique"
                  checked={formData.isBoutique}
                  onChange={(e) =>
                    setFormData({ ...formData, isBoutique: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isBoutique" className="cursor-pointer">
                  Boutique Hotel
                </Label>
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
                <Label htmlFor="starRating">Star Rating</Label>
                <Input
                  id="starRating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.starRating || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, starRating: e.target.value ? parseInt(e.target.value) : null })
                  }
                />
              </div>

              <div>
                <Label htmlFor="hotelCategory">Hotel Category</Label>
                <Input
                  id="hotelCategory"
                  value={formData.hotelCategory}
                  onChange={(e) => setFormData({ ...formData, hotelCategory: e.target.value })}
                  placeholder="e.g., budget, standard_3star"
                />
              </div>

              <div>
                <Label htmlFor="roomCount">Room Count</Label>
                <Input
                  id="roomCount"
                  type="number"
                  value={formData.roomCount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, roomCount: e.target.value ? parseInt(e.target.value) : null })
                  }
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Link href={`/${locale}/suppliers/hotels`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={updateHotel.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateHotel.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
