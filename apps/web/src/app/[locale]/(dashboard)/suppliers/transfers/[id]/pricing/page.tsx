'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useTransferFromSuppliers,
  useAllTransferPricing,
  useCreateTransferPricing,
  useUpdateTransferPricing,
  useDeleteTransferPricing
} from '@/lib/api/hooks/use-suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export default function TransferPricingPage() {
  const params = useParams();
  const locale = params.locale as string;
  const transferId = parseInt(params.id as string);

  const { data: transfer, isLoading: transferLoading } = useTransferFromSuppliers(transferId);
  const { data: pricing = [], isLoading: pricingLoading } = useAllTransferPricing(transferId);
  const createPricing = useCreateTransferPricing();
  const updatePricing = useUpdateTransferPricing();
  const deletePricing = useDeleteTransferPricing();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    seasonName: '',
    startDate: '',
    endDate: '',
    priceOneway: '',
    priceRoundtrip: '',
    estimatedDurationHours: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      seasonName: '',
      startDate: '',
      endDate: '',
      priceOneway: '',
      priceRoundtrip: '',
      estimatedDurationHours: '',
      notes: '',
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
        priceOneway: pricing.priceOneway?.toString() || '',
        priceRoundtrip: pricing.priceRoundtrip?.toString() || '',
        estimatedDurationHours: pricing.estimatedDurationHours?.toString() || '',
        notes: pricing.notes || '',
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
      priceOneway: formData.priceOneway ? parseFloat(formData.priceOneway) : null,
      priceRoundtrip: formData.priceRoundtrip ? parseFloat(formData.priceRoundtrip) : null,
      estimatedDurationHours: formData.estimatedDurationHours ? parseFloat(formData.estimatedDurationHours) : null,
      notes: formData.notes || null,
    };

    if (editingId) {
      await updatePricing.mutateAsync({ transferId, id: editingId, data });
    } else {
      await createPricing.mutateAsync({ transferId, data });
    }

    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to deactivate this pricing?')) {
      deletePricing.mutate({ transferId, id });
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

  if (transferLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Transfer not found</h2>
          <Link href={`/${locale}/suppliers/transfers`}>
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transfers
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
          <Link href={`/${locale}/suppliers/transfers/${transferId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transfer Seasonal Pricing</h1>
            <p className="text-gray-700 mt-1">
              {transfer.fromCity?.name} → {transfer.toCity?.name}
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Season
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{pricing?.length || 0} Seasonal Pricing Periods</CardTitle>
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
                  <TableHead>One-Way</TableHead>
                  <TableHead>Round-Trip</TableHead>
                  <TableHead>Duration (hrs)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricing?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No seasonal pricing found. Add your first season to get started.
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
                        <span className="font-semibold text-green-600">
                          {formatCurrency(rate.priceOneway)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(rate.priceRoundtrip)}
                        </span>
                      </TableCell>
                      <TableCell>{rate.estimatedDurationHours || '-'}</TableCell>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Seasonal Pricing' : 'Add New Seasonal Pricing'}</DialogTitle>
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
                  <Label htmlFor="estimatedDurationHours">Duration (hours)</Label>
                  <Input
                    id="estimatedDurationHours"
                    type="number"
                    step="0.5"
                    value={formData.estimatedDurationHours}
                    onChange={(e) => setFormData({ ...formData, estimatedDurationHours: e.target.value })}
                    placeholder="e.g., 2.5"
                  />
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

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* Notes */}
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
