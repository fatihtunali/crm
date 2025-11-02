'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useTourFromSuppliers,
  useAllTourPricing,
  useCreateTourPricing,
  useUpdateTourPricing,
  useDeleteTourPricing
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

export default function TourPricingPage() {
  const params = useParams();
  const locale = params.locale as string;
  const tourId = parseInt(params.id as string);

  const { data: tour, isLoading: tourLoading } = useTourFromSuppliers(tourId);
  const { data: pricing = [], isLoading: pricingLoading } = useAllTourPricing(tourId);
  const createPricing = useCreateTourPricing();
  const updatePricing = useUpdateTourPricing();
  const deletePricing = useDeleteTourPricing();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    seasonName: '',
    startDate: '',
    endDate: '',
    currency: 'EUR',
    sicPrice2Pax: '',
    sicPrice4Pax: '',
    sicPrice6Pax: '',
    sicPrice8Pax: '',
    sicPrice10Pax: '',
    pvtPrice2Pax: '',
    pvtPrice4Pax: '',
    pvtPrice6Pax: '',
    pvtPrice8Pax: '',
    pvtPrice10Pax: '',
  });

  const resetForm = () => {
    setFormData({
      seasonName: '',
      startDate: '',
      endDate: '',
      currency: 'EUR',
      sicPrice2Pax: '',
      sicPrice4Pax: '',
      sicPrice6Pax: '',
      sicPrice8Pax: '',
      sicPrice10Pax: '',
      pvtPrice2Pax: '',
      pvtPrice4Pax: '',
      pvtPrice6Pax: '',
      pvtPrice8Pax: '',
      pvtPrice10Pax: '',
    });
    setEditingId(null);
  };

  const handleOpenDialog = (pricing?: any) => {
    if (pricing) {
      setEditingId(pricing.id);
      setFormData({
        seasonName: pricing.seasonName || '',
        startDate: pricing.startDate ? new Date(pricing.startDate).toISOString().split('T')[0] : '',
        endDate: pricing.endDate ? new Date(pricing.endDate).toISOString().split('T')[0] : '',
        currency: pricing.currency || 'EUR',
        sicPrice2Pax: pricing.sicPrice2Pax?.toString() || '',
        sicPrice4Pax: pricing.sicPrice4Pax?.toString() || '',
        sicPrice6Pax: pricing.sicPrice6Pax?.toString() || '',
        sicPrice8Pax: pricing.sicPrice8Pax?.toString() || '',
        sicPrice10Pax: pricing.sicPrice10Pax?.toString() || '',
        pvtPrice2Pax: pricing.pvtPrice2Pax?.toString() || '',
        pvtPrice4Pax: pricing.pvtPrice4Pax?.toString() || '',
        pvtPrice6Pax: pricing.pvtPrice6Pax?.toString() || '',
        pvtPrice8Pax: pricing.pvtPrice8Pax?.toString() || '',
        pvtPrice10Pax: pricing.pvtPrice10Pax?.toString() || '',
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
      seasonName: formData.seasonName || null,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      currency: formData.currency || 'EUR',
      sicPrice2Pax: formData.sicPrice2Pax ? parseFloat(formData.sicPrice2Pax) : null,
      sicPrice4Pax: formData.sicPrice4Pax ? parseFloat(formData.sicPrice4Pax) : null,
      sicPrice6Pax: formData.sicPrice6Pax ? parseFloat(formData.sicPrice6Pax) : null,
      sicPrice8Pax: formData.sicPrice8Pax ? parseFloat(formData.sicPrice8Pax) : null,
      sicPrice10Pax: formData.sicPrice10Pax ? parseFloat(formData.sicPrice10Pax) : null,
      pvtPrice2Pax: formData.pvtPrice2Pax ? parseFloat(formData.pvtPrice2Pax) : null,
      pvtPrice4Pax: formData.pvtPrice4Pax ? parseFloat(formData.pvtPrice4Pax) : null,
      pvtPrice6Pax: formData.pvtPrice6Pax ? parseFloat(formData.pvtPrice6Pax) : null,
      pvtPrice8Pax: formData.pvtPrice8Pax ? parseFloat(formData.pvtPrice8Pax) : null,
      pvtPrice10Pax: formData.pvtPrice10Pax ? parseFloat(formData.pvtPrice10Pax) : null,
    };

    if (editingId) {
      await updatePricing.mutateAsync({ tourId, id: editingId, data });
    } else {
      await createPricing.mutateAsync({ tourId, data });
    }

    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to deactivate this pricing?')) {
      deletePricing.mutate({ tourId, id });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount: any, currency: string = 'EUR') => {
    if (!amount) return '-';
    const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '₺';
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  };

  if (tourLoading) {
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
          <Link href={`/${locale}/suppliers/tours/${tourId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tour Pricing</h1>
            <p className="text-gray-700 mt-1">{tour.name}</p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Pricing
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{pricing?.length || 0} Pricing Periods</CardTitle>
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
                  <TableHead>Period</TableHead>
                  <TableHead>SIC (2/4/6 pax)</TableHead>
                  <TableHead>Private (2/4/6 pax)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricing?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No pricing periods found. Add your first pricing to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  pricing?.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>
                        <div className="font-medium">{rate.seasonName || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(rate.startDate)} - {formatDate(rate.endDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>{formatCurrency(rate.sicPrice2Pax, rate.currency)} / {formatCurrency(rate.sicPrice4Pax, rate.currency)} / {formatCurrency(rate.sicPrice6Pax, rate.currency)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>{formatCurrency(rate.pvtPrice2Pax, rate.currency)} / {formatCurrency(rate.pvtPrice4Pax, rate.currency)} / {formatCurrency(rate.pvtPrice6Pax, rate.currency)}</div>
                        </div>
                      </TableCell>
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
                            title="Edit Pricing"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(rate.id)}
                            disabled={!rate.isActive || deletePricing.isPending}
                            title="Deactivate Pricing"
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Pricing' : 'Add New Pricing'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Season Info */}
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="TRY">TRY (₺)</option>
                  </select>
                </div>
              </div>

              {/* Date Range */}
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

              {/* SIC Pricing */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">SIC Tour Pricing (per person)</Label>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="sicPrice2Pax" className="text-xs">2 Pax</Label>
                    <Input
                      id="sicPrice2Pax"
                      type="number"
                      step="0.01"
                      value={formData.sicPrice2Pax}
                      onChange={(e) => setFormData({ ...formData, sicPrice2Pax: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sicPrice4Pax" className="text-xs">4 Pax</Label>
                    <Input
                      id="sicPrice4Pax"
                      type="number"
                      step="0.01"
                      value={formData.sicPrice4Pax}
                      onChange={(e) => setFormData({ ...formData, sicPrice4Pax: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sicPrice6Pax" className="text-xs">6 Pax</Label>
                    <Input
                      id="sicPrice6Pax"
                      type="number"
                      step="0.01"
                      value={formData.sicPrice6Pax}
                      onChange={(e) => setFormData({ ...formData, sicPrice6Pax: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sicPrice8Pax" className="text-xs">8 Pax</Label>
                    <Input
                      id="sicPrice8Pax"
                      type="number"
                      step="0.01"
                      value={formData.sicPrice8Pax}
                      onChange={(e) => setFormData({ ...formData, sicPrice8Pax: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sicPrice10Pax" className="text-xs">10 Pax</Label>
                    <Input
                      id="sicPrice10Pax"
                      type="number"
                      step="0.01"
                      value={formData.sicPrice10Pax}
                      onChange={(e) => setFormData({ ...formData, sicPrice10Pax: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Private Tour Pricing */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Private Tour Pricing (per person)</Label>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="pvtPrice2Pax" className="text-xs">2 Pax</Label>
                    <Input
                      id="pvtPrice2Pax"
                      type="number"
                      step="0.01"
                      value={formData.pvtPrice2Pax}
                      onChange={(e) => setFormData({ ...formData, pvtPrice2Pax: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pvtPrice4Pax" className="text-xs">4 Pax</Label>
                    <Input
                      id="pvtPrice4Pax"
                      type="number"
                      step="0.01"
                      value={formData.pvtPrice4Pax}
                      onChange={(e) => setFormData({ ...formData, pvtPrice4Pax: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pvtPrice6Pax" className="text-xs">6 Pax</Label>
                    <Input
                      id="pvtPrice6Pax"
                      type="number"
                      step="0.01"
                      value={formData.pvtPrice6Pax}
                      onChange={(e) => setFormData({ ...formData, pvtPrice6Pax: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pvtPrice8Pax" className="text-xs">8 Pax</Label>
                    <Input
                      id="pvtPrice8Pax"
                      type="number"
                      step="0.01"
                      value={formData.pvtPrice8Pax}
                      onChange={(e) => setFormData({ ...formData, pvtPrice8Pax: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pvtPrice10Pax" className="text-xs">10 Pax</Label>
                    <Input
                      id="pvtPrice10Pax"
                      type="number"
                      step="0.01"
                      value={formData.pvtPrice10Pax}
                      onChange={(e) => setFormData({ ...formData, pvtPrice10Pax: e.target.value })}
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
                {editingId ? 'Update' : 'Create'} Pricing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
