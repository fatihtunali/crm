'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTransferFromSuppliers, useUpdateTransfer } from '@/lib/api/hooks/use-suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function EditTransferPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const id = parseInt(params.id as string);

  const { data: transfer, isLoading } = useTransferFromSuppliers(id);
  const updateTransfer = useUpdateTransfer();

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (transfer) {
      setFormData({
        vehicleClass: transfer.vehicleClass || '',
        maxPassengers: transfer.maxPassengers?.toString() || '',
        priceOneway: transfer.priceOneway?.toString() || '',
        priceRoundtrip: transfer.priceRoundtrip?.toString() || '',
        estimatedDurationHours: transfer.estimatedDurationHours?.toString() || '',
        notes: transfer.notes || '',
        seasonName: transfer.seasonName || '',
        startDate: transfer.startDate ? transfer.startDate.split('T')[0] : '',
        endDate: transfer.endDate ? transfer.endDate.split('T')[0] : '',
      });
    }
  }, [transfer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      maxPassengers: formData.maxPassengers ? parseInt(formData.maxPassengers) : null,
      priceOneway: formData.priceOneway ? parseFloat(formData.priceOneway) : null,
      priceRoundtrip: formData.priceRoundtrip ? parseFloat(formData.priceRoundtrip) : null,
      estimatedDurationHours: formData.estimatedDurationHours ? parseFloat(formData.estimatedDurationHours) : null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    };
    await updateTransfer.mutateAsync({ id, data });
    router.push(`/${locale}/suppliers/transfers`);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/${locale}/suppliers/transfers`}>
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transfers
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Edit Transfer: {transfer?.fromCity?.name} → {transfer?.toCity?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vehicle Class</Label>
                <Input
                  value={formData.vehicleClass}
                  onChange={(e) => setFormData({ ...formData, vehicleClass: e.target.value })}
                  placeholder="VITO, SPRINTER, ISUZU, COACH"
                />
              </div>
              <div>
                <Label>Max Passengers</Label>
                <Input
                  type="number"
                  value={formData.maxPassengers}
                  onChange={(e) => setFormData({ ...formData, maxPassengers: e.target.value })}
                />
              </div>
              <div>
                <Label>Price One-way (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceOneway}
                  onChange={(e) => setFormData({ ...formData, priceOneway: e.target.value })}
                />
              </div>
              <div>
                <Label>Price Round-trip (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceRoundtrip}
                  onChange={(e) => setFormData({ ...formData, priceRoundtrip: e.target.value })}
                />
              </div>
              <div>
                <Label>Estimated Duration (hours)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.estimatedDurationHours}
                  onChange={(e) => setFormData({ ...formData, estimatedDurationHours: e.target.value })}
                />
              </div>
              <div>
                <Label>Season Name</Label>
                <Input
                  value={formData.seasonName}
                  onChange={(e) => setFormData({ ...formData, seasonName: e.target.value })}
                  placeholder="Winter, Summer, etc."
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={updateTransfer.isPending}>
                {updateTransfer.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
