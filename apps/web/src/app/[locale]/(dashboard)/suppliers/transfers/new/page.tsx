'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCreateTransfer, useSuppliers } from '@/lib/api/hooks/use-suppliers';
import { SupplierType } from '@/lib/api/endpoints/suppliers';
import { useCities } from '@/lib/api/hooks/use-catalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewTransferPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const { data: cities = [] } = useCities();
  const { data: suppliers = [] } = useSuppliers({ type: SupplierType.TRANSPORT });
  const createTransfer = useCreateTransfer();

  const [formData, setFormData] = useState({
    fromCityId: 0,
    toCityId: 0,
    supplierId: null as number | null,
    vehicleClass: '',
    maxPassengers: '',
    priceOneway: '',
    priceRoundtrip: '',
    estimatedDurationHours: '',
    notes: '',
    seasonName: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fromCityId || !formData.toCityId) {
      alert('Please select from and to cities');
      return;
    }

    const data = {
      fromCityId: formData.fromCityId,
      toCityId: formData.toCityId,
      supplierId: formData.supplierId || null,
      vehicleClass: formData.vehicleClass || null,
      maxPassengers: formData.maxPassengers ? parseInt(formData.maxPassengers) : null,
      priceOneway: formData.priceOneway ? parseFloat(formData.priceOneway) : null,
      priceRoundtrip: formData.priceRoundtrip ? parseFloat(formData.priceRoundtrip) : null,
      estimatedDurationHours: formData.estimatedDurationHours ? parseFloat(formData.estimatedDurationHours) : null,
      notes: formData.notes || null,
      seasonName: formData.seasonName || null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    };

    await createTransfer.mutateAsync(data);
    router.push(`/${locale}/suppliers/transfers`);
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/suppliers/transfers`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Transfer</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fromCityId">From City *</Label>
                <Select
                  value={formData.fromCityId ? formData.fromCityId.toString() : ''}
                  onValueChange={(value: string) => setFormData({ ...formData, fromCityId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select from city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city: any) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="toCityId">To City *</Label>
                <Select
                  value={formData.toCityId ? formData.toCityId.toString() : ''}
                  onValueChange={(value: string) => setFormData({ ...formData, toCityId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select to city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city: any) => (
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
                  value={formData.supplierId ? formData.supplierId.toString() : ''}
                  onValueChange={(value: string) => setFormData({ ...formData, supplierId: value ? parseInt(value) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Supplier</SelectItem>
                    {suppliers.map((supplier: any) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.party?.name || supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vehicleClass">Vehicle Class</Label>
                <Select
                  value={formData.vehicleClass}
                  onValueChange={(value: string) => setFormData({ ...formData, vehicleClass: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VITO">VITO</SelectItem>
                    <SelectItem value="SPRINTER">SPRINTER</SelectItem>
                    <SelectItem value="ISUZU">ISUZU</SelectItem>
                    <SelectItem value="COACH">COACH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxPassengers">Max Passengers</Label>
                <Input
                  id="maxPassengers"
                  type="number"
                  value={formData.maxPassengers}
                  onChange={(e) => setFormData({ ...formData, maxPassengers: e.target.value })}
                  placeholder="e.g., 6"
                />
              </div>

              <div>
                <Label htmlFor="estimatedDurationHours">Estimated Duration (hours)</Label>
                <Input
                  id="estimatedDurationHours"
                  type="number"
                  step="0.5"
                  value={formData.estimatedDurationHours}
                  onChange={(e) => setFormData({ ...formData, estimatedDurationHours: e.target.value })}
                  placeholder="e.g., 2.5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Season Information */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Season</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="priceOneway">Price One-Way</Label>
                <Input
                  id="priceOneway"
                  type="number"
                  step="0.01"
                  value={formData.priceOneway}
                  onChange={(e) => setFormData({ ...formData, priceOneway: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="priceRoundtrip">Price Round-Trip</Label>
                <Input
                  id="priceRoundtrip"
                  type="number"
                  step="0.01"
                  value={formData.priceRoundtrip}
                  onChange={(e) => setFormData({ ...formData, priceRoundtrip: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="seasonName">Season Name</Label>
                <Input
                  id="seasonName"
                  type="text"
                  value={formData.seasonName}
                  onChange={(e) => setFormData({ ...formData, seasonName: e.target.value })}
                  placeholder="e.g., High Season, Low Season"
                />
              </div>

              <div>
                <Label htmlFor="startDate">Season Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="endDate">Season End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link href={`/${locale}/suppliers/transfers`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={createTransfer.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Create Transfer
          </Button>
        </div>
      </form>
    </div>
  );
}
