'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useTransferRates,
  useCreateTransferRate,
  useUpdateTransferRate,
  useDeleteTransferRate,
} from '@/lib/api/hooks/use-transfer-rates';
import { PricingModel } from '@/lib/api/endpoints/suppliers';
import type { TransferRate, CreateTransferRateDto, ServiceOffering } from '@/lib/api/endpoints/suppliers';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const pricingModelLabels: Record<PricingModel, string> = {
  [PricingModel.PER_ROOM_NIGHT]: 'Per Room / Night',
  [PricingModel.PER_PERSON_NIGHT]: 'Per Person / Night',
  [PricingModel.PER_TRANSFER]: 'Per Transfer',
  [PricingModel.PER_KM]: 'Per KM',
  [PricingModel.PER_HOUR]: 'Per Hour',
  [PricingModel.PER_DAY]: 'Per Day',
  [PricingModel.PER_HALF_DAY]: 'Per Half Day',
  [PricingModel.PER_PERSON]: 'Per Person',
  [PricingModel.PER_GROUP]: 'Per Group',
};

interface TransferRatesPageProps {
  offeringId: number;
  offering: ServiceOffering;
}

export default function TransferRatesPage({ offeringId, offering }: TransferRatesPageProps) {
  const params = useParams();
  const locale = params.locale as string;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<TransferRate | null>(null);

  const { data: rates, isLoading } = useTransferRates({
    serviceOfferingId: offeringId,
  });
  const createRate = useCreateTransferRate();
  const updateRate = useUpdateTransferRate();
  const deleteRate = useDeleteTransferRate();

  const [formData, setFormData] = useState<Partial<CreateTransferRateDto>>({
    serviceOfferingId: offeringId,
    pricingModel: PricingModel.PER_TRANSFER,
    isActive: true,
  });

  const handleOpenDialog = (rate?: TransferRate) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        serviceOfferingId: rate.serviceOfferingId,
        seasonFrom: rate.seasonFrom,
        seasonTo: rate.seasonTo,
        pricingModel: rate.pricingModel,
        costTry: rate.costTry,
        includedKm: rate.includedKm,
        includedHours: rate.includedHours,
        extraKmChargeTry: rate.extraKmChargeTry,
        extraHourChargeTry: rate.extraHourChargeTry,
        nightSurchargePercent: rate.nightSurchargePercent,
        holidaySurchargePercent: rate.holidaySurchargePercent,
        waitingTimeFreeMinutes: rate.waitingTimeFreeMinutes,
        waitingTimeChargePerHourTry: rate.waitingTimeChargePerHourTry,
        notes: rate.notes,
        isActive: rate.isActive,
      });
    } else {
      setEditingRate(null);
      setFormData({
        serviceOfferingId: offeringId,
        pricingModel: PricingModel.PER_TRANSFER,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRate) {
      await updateRate.mutateAsync({
        id: editingRate.id,
        data: {
          seasonFrom: formData.seasonFrom,
          seasonTo: formData.seasonTo,
          pricingModel: formData.pricingModel,
          costTry: formData.costTry,
          includedKm: formData.includedKm,
          includedHours: formData.includedHours,
          extraKmChargeTry: formData.extraKmChargeTry,
          extraHourChargeTry: formData.extraHourChargeTry,
          nightSurchargePercent: formData.nightSurchargePercent,
          holidaySurchargePercent: formData.holidaySurchargePercent,
          waitingTimeFreeMinutes: formData.waitingTimeFreeMinutes,
          waitingTimeChargePerHourTry: formData.waitingTimeChargePerHourTry,
          notes: formData.notes,
          isActive: formData.isActive,
        },
      });
    } else {
      await createRate.mutateAsync(formData as CreateTransferRateDto);
    }

    handleCloseDialog();
  };

  const handleDelete = async (id: number, seasonInfo: string) => {
    if (confirm(`Are you sure you want to delete the rate for ${seasonInfo}?`)) {
      await deleteRate.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/${locale}/suppliers/transfers`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transfers
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfer Rates</h1>
          <p className="text-gray-700 mt-1 text-base">
            {offering.title}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Rate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{rates?.data?.length || 0} Rate(s)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Season</TableHead>
                <TableHead>Pricing Model</TableHead>
                <TableHead>Base Cost (TRY)</TableHead>
                <TableHead>Included</TableHead>
                <TableHead>Extra Charges</TableHead>
                <TableHead>Surcharges</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No rates configured yet
                  </TableCell>
                </TableRow>
              ) : (
                rates?.data?.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {new Date(rate.seasonFrom).toLocaleDateString('en-GB')}
                        </div>
                        <div className="text-gray-500">
                          to {new Date(rate.seasonTo).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{pricingModelLabels[rate.pricingModel]}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">₺{rate.costTry.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {rate.includedKm && <div>{rate.includedKm} km</div>}
                        {rate.includedHours && <div>{rate.includedHours} hours</div>}
                        {!rate.includedKm && !rate.includedHours && <span className="text-gray-400">-</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {rate.extraKmChargeTry && <div>₺{rate.extraKmChargeTry}/km</div>}
                        {rate.extraHourChargeTry && <div>₺{rate.extraHourChargeTry}/hr</div>}
                        {!rate.extraKmChargeTry && !rate.extraHourChargeTry && <span className="text-gray-400">-</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {rate.nightSurchargePercent && <div>Night: {rate.nightSurchargePercent}%</div>}
                        {rate.holidaySurchargePercent && <div>Holiday: {rate.holidaySurchargePercent}%</div>}
                        {!rate.nightSurchargePercent && !rate.holidaySurchargePercent && <span className="text-gray-400">-</span>}
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDelete(
                              rate.id,
                              `${new Date(rate.seasonFrom).toLocaleDateString()} - ${new Date(rate.seasonTo).toLocaleDateString()}`
                            )
                          }
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
        </CardContent>
      </Card>

      {/* Add/Edit Rate Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRate ? 'Edit Transfer Rate' : 'Add New Transfer Rate'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Season Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seasonFrom">Season From *</Label>
                  <Input
                    id="seasonFrom"
                    type="date"
                    value={formData.seasonFrom || ''}
                    onChange={(e) => setFormData({ ...formData, seasonFrom: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="seasonTo">Season To *</Label>
                  <Input
                    id="seasonTo"
                    type="date"
                    value={formData.seasonTo || ''}
                    onChange={(e) => setFormData({ ...formData, seasonTo: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Pricing Model and Base Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricingModel">Pricing Model *</Label>
                  <Select
                    value={formData.pricingModel}
                    onValueChange={(value) =>
                      setFormData({ ...formData, pricingModel: value as PricingModel })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PricingModel.PER_TRANSFER}>
                        {pricingModelLabels[PricingModel.PER_TRANSFER]}
                      </SelectItem>
                      <SelectItem value={PricingModel.PER_KM}>
                        {pricingModelLabels[PricingModel.PER_KM]}
                      </SelectItem>
                      <SelectItem value={PricingModel.PER_HOUR}>
                        {pricingModelLabels[PricingModel.PER_HOUR]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="costTry">Base Cost (TRY) *</Label>
                  <Input
                    id="costTry"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costTry || ''}
                    onChange={(e) => setFormData({ ...formData, costTry: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Included KM and Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="includedKm">Included KM</Label>
                  <Input
                    id="includedKm"
                    type="number"
                    min="0"
                    value={formData.includedKm || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, includedKm: parseInt(e.target.value) || undefined })
                    }
                    placeholder="For per transfer pricing"
                  />
                </div>
                <div>
                  <Label htmlFor="includedHours">Included Hours</Label>
                  <Input
                    id="includedHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.includedHours || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, includedHours: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="For per transfer pricing"
                  />
                </div>
              </div>

              {/* Extra Charges */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="extraKmChargeTry">Extra KM Charge (TRY)</Label>
                  <Input
                    id="extraKmChargeTry"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.extraKmChargeTry || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, extraKmChargeTry: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="Per km beyond included"
                  />
                </div>
                <div>
                  <Label htmlFor="extraHourChargeTry">Extra Hour Charge (TRY)</Label>
                  <Input
                    id="extraHourChargeTry"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.extraHourChargeTry || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, extraHourChargeTry: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="Per hour beyond included"
                  />
                </div>
              </div>

              {/* Surcharges */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nightSurchargePercent">Night Surcharge (%)</Label>
                  <Input
                    id="nightSurchargePercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.nightSurchargePercent || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, nightSurchargePercent: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="e.g., 25 for 25%"
                  />
                </div>
                <div>
                  <Label htmlFor="holidaySurchargePercent">Holiday Surcharge (%)</Label>
                  <Input
                    id="holidaySurchargePercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.holidaySurchargePercent || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, holidaySurchargePercent: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="e.g., 30 for 30%"
                  />
                </div>
              </div>

              {/* Waiting Time Policy */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waitingTimeFreeMinutes">Free Waiting Time (minutes)</Label>
                  <Input
                    id="waitingTimeFreeMinutes"
                    type="number"
                    min="0"
                    value={formData.waitingTimeFreeMinutes || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, waitingTimeFreeMinutes: parseInt(e.target.value) || undefined })
                    }
                    placeholder="e.g., 30"
                  />
                </div>
                <div>
                  <Label htmlFor="waitingTimeChargePerHourTry">Waiting Time Charge (TRY/hour)</Label>
                  <Input
                    id="waitingTimeChargePerHourTry"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.waitingTimeChargePerHourTry || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, waitingTimeChargePerHourTry: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="After free time expires"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional rate details or conditions"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRate ? 'Update Rate' : 'Create Rate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
