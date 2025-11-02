'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useHotelFromSuppliers,
  useAllHotelPricing,
  useCreateHotelPricing,
  useUpdateHotelPricing,
  useDeleteHotelPricing
} from '@/lib/api/hooks/use-suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function HotelRatesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const hotelId = parseInt(params.id as string);

  const { data: hotel, isLoading: hotelLoading } = useHotelFromSuppliers(hotelId);
  const { data: pricing = [], isLoading: pricingLoading } = useAllHotelPricing(hotelId);
  const createPricing = useCreateHotelPricing();
  const updatePricing = useUpdateHotelPricing();
  const deletePricing = useDeleteHotelPricing();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    ppDblRate: '',
    singleSupplement: '',
    child0to2: '',
    child3to5: '',
    child6to11: '',
  });

  const resetForm = () => {
    setFormData({
      startDate: '',
      endDate: '',
      ppDblRate: '',
      singleSupplement: '',
      child0to2: '',
      child3to5: '',
      child6to11: '',
    });
    setEditingId(null);
  };

  const handleOpenDialog = (pricing?: any) => {
    if (pricing) {
      setEditingId(pricing.id);
      setFormData({
        startDate: pricing.startDate ? new Date(pricing.startDate).toISOString().split('T')[0] : '',
        endDate: pricing.endDate ? new Date(pricing.endDate).toISOString().split('T')[0] : '',
        ppDblRate: pricing.ppDblRate?.toString() || '',
        singleSupplement: pricing.singleSupplement?.toString() || '',
        child0to2: pricing.child0to2?.toString() || '',
        child3to5: pricing.child3to5?.toString() || '',
        child6to11: pricing.child6to11?.toString() || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      ppDblRate: parseFloat(formData.ppDblRate),
      singleSupplement: formData.singleSupplement ? parseFloat(formData.singleSupplement) : null,
      child0to2: formData.child0to2 ? parseFloat(formData.child0to2) : null,
      child3to5: formData.child3to5 ? parseFloat(formData.child3to5) : null,
      child6to11: formData.child6to11 ? parseFloat(formData.child6to11) : null,
    };

    if (editingId) {
      await updatePricing.mutateAsync({ hotelId, id: editingId, data });
    } else {
      await createPricing.mutateAsync({ hotelId, data });
    }

    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to deactivate this pricing?')) {
      deletePricing.mutate({ hotelId, id });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount: any) => {
    if (!amount) return '-';
    return `₺${parseFloat(amount).toFixed(2)}`;
  };

  if (hotelLoading) {
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
          <Link href={`/${locale}/suppliers/hotels/${hotelId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hotel Rates</h1>
            <p className="text-gray-700 mt-1">{hotel.name}</p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{pricing?.length || 0} Rate Periods</CardTitle>
        </CardHeader>
        <CardContent>
          {pricingLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Season</TableHead>
                  <TableHead>Per Person (Double)</TableHead>
                  <TableHead>Single Supplement</TableHead>
                  <TableHead>Child 0-2</TableHead>
                  <TableHead>Child 3-5</TableHead>
                  <TableHead>Child 6-11</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricing?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      No pricing rates found. Add your first rate to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  pricing?.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatDate(rate.startDate)} - {formatDate(rate.endDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(rate.ppDblRate)}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(rate.singleSupplement)}</TableCell>
                      <TableCell>{formatCurrency(rate.child0to2)}</TableCell>
                      <TableCell>{formatCurrency(rate.child3to5)}</TableCell>
                      <TableCell>{formatCurrency(rate.child6to11)}</TableCell>
                      <TableCell>
                        <Badge variant={rate.isActive ? 'default' : 'secondary'}>
                          {rate.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(rate)}
                            title="Edit Rate"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(rate.id)}
                            disabled={!rate.isActive || deletePricing.isPending}
                            title="Deactivate Rate"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Rate' : 'Add New Rate'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Season Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Main Rates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ppDblRate">Per Person (Double) *</Label>
                  <Input
                    id="ppDblRate"
                    type="number"
                    step="0.01"
                    value={formData.ppDblRate}
                    onChange={(e) => setFormData({ ...formData, ppDblRate: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="singleSupplement">Single Supplement</Label>
                  <Input
                    id="singleSupplement"
                    type="number"
                    step="0.01"
                    value={formData.singleSupplement}
                    onChange={(e) => setFormData({ ...formData, singleSupplement: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Child Rates */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Child Rates (per night)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="child0to2" className="text-xs">Child 0-2 years</Label>
                    <Input
                      id="child0to2"
                      type="number"
                      step="0.01"
                      value={formData.child0to2}
                      onChange={(e) => setFormData({ ...formData, child0to2: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="child3to5" className="text-xs">Child 3-5 years</Label>
                    <Input
                      id="child3to5"
                      type="number"
                      step="0.01"
                      value={formData.child3to5}
                      onChange={(e) => setFormData({ ...formData, child3to5: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="child6to11" className="text-xs">Child 6-11 years</Label>
                    <Input
                      id="child6to11"
                      type="number"
                      step="0.01"
                      value={formData.child6to11}
                      onChange={(e) => setFormData({ ...formData, child6to11: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPricing.isPending || updatePricing.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {editingId ? 'Update' : 'Create'} Rate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
