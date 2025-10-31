'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useVehicleRates,
  useCreateVehicleRate,
  useUpdateVehicleRate,
  useDeleteVehicleRate,
} from '@/lib/api/hooks/use-vehicle-rates';
import { PricingModel } from '@/lib/api/endpoints/suppliers';
import type { VehicleRate, CreateVehicleRateDto, ServiceOffering } from '@/lib/api/endpoints/suppliers';
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

interface VehicleRatesPageProps {
  offeringId: number;
  offering: ServiceOffering;
}

export default function VehicleRatesPage({ offeringId, offering }: VehicleRatesPageProps) {
  const params = useParams();
  const locale = params.locale as string;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<VehicleRate | null>(null);

  const { data: rates, isLoading } = useVehicleRates({
    serviceOfferingId: offeringId,
  });
  const createRate = useCreateVehicleRate();
  const updateRate = useUpdateVehicleRate();
  const deleteRate = useDeleteVehicleRate();

  const [formData, setFormData] = useState<Partial<CreateVehicleRateDto>>({
    serviceOfferingId: offeringId,
    pricingModel: PricingModel.PER_DAY,
    minRentalDays: 1,
    isActive: true,
  });

  const handleOpenDialog = (rate?: VehicleRate) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        serviceOfferingId: rate.serviceOfferingId,
        seasonFrom: rate.seasonFrom,
        seasonTo: rate.seasonTo,
        pricingModel: rate.pricingModel,
        costTry: rate.costTry,
        includedKmPerDay: rate.includedKmPerDay,
        extraKmChargeTry: rate.extraKmChargeTry,
        driverFeePerDayTry: rate.driverFeePerDayTry,
        oneWayFeeTry: rate.oneWayFeeTry,
        depositTry: rate.depositTry,
        insurancePerDayTry: rate.insurancePerDayTry,
        minRentalDays: rate.minRentalDays,
        notes: rate.notes,
        isActive: rate.isActive,
      });
    } else {
      setEditingRate(null);
      setFormData({
        serviceOfferingId: offeringId,
        pricingModel: PricingModel.PER_DAY,
        minRentalDays: 1,
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
          includedKmPerDay: formData.includedKmPerDay,
          extraKmChargeTry: formData.extraKmChargeTry,
          driverFeePerDayTry: formData.driverFeePerDayTry,
          oneWayFeeTry: formData.oneWayFeeTry,
          depositTry: formData.depositTry,
          insurancePerDayTry: formData.insurancePerDayTry,
          minRentalDays: formData.minRentalDays,
          notes: formData.notes,
          isActive: formData.isActive,
        },
      });
    } else {
      await createRate.mutateAsync(formData as CreateVehicleRateDto);
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
        <Link href={`/${locale}/suppliers/vehicles`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vehicles
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Hire Rates</h1>
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
                <TableHead>Daily Rate (TRY)</TableHead>
                <TableHead>KM Allowance</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Deposit</TableHead>
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
                        {rate.includedKmPerDay ? (
                          <>
                            <div>{rate.includedKmPerDay} km/day</div>
                            {rate.extraKmChargeTry && (
                              <div className="text-gray-500">+₺{rate.extraKmChargeTry}/km</div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">Unlimited</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {rate.driverFeePerDayTry && <div>Driver: ₺{rate.driverFeePerDayTry}/day</div>}
                        {rate.oneWayFeeTry && <div>One-way: ₺{rate.oneWayFeeTry}</div>}
                        {rate.insurancePerDayTry && <div>Insurance: ₺{rate.insurancePerDayTry}/day</div>}
                        {!rate.driverFeePerDayTry && !rate.oneWayFeeTry && !rate.insurancePerDayTry && (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {rate.depositTry ? `₺${rate.depositTry.toLocaleString()}` : '-'}
                      </span>
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
            <DialogTitle>{editingRate ? 'Edit Vehicle Rate' : 'Add New Vehicle Rate'}</DialogTitle>
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
                      <SelectItem value={PricingModel.PER_DAY}>
                        {pricingModelLabels[PricingModel.PER_DAY]}
                      </SelectItem>
                      <SelectItem value={PricingModel.PER_HALF_DAY}>
                        {pricingModelLabels[PricingModel.PER_HALF_DAY]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="costTry">Daily Rate (TRY) *</Label>
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

              {/* KM Allowance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="includedKmPerDay">Included KM per Day</Label>
                  <Input
                    id="includedKmPerDay"
                    type="number"
                    min="0"
                    value={formData.includedKmPerDay || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, includedKmPerDay: parseInt(e.target.value) || undefined })
                    }
                    placeholder="Leave empty for unlimited"
                  />
                </div>
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
              </div>

              {/* Fees */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="driverFeePerDayTry">Driver Fee (TRY/day)</Label>
                  <Input
                    id="driverFeePerDayTry"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.driverFeePerDayTry || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, driverFeePerDayTry: parseFloat(e.target.value) || undefined })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="oneWayFeeTry">One-Way Fee (TRY)</Label>
                  <Input
                    id="oneWayFeeTry"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.oneWayFeeTry || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, oneWayFeeTry: parseFloat(e.target.value) || undefined })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="insurancePerDayTry">Insurance (TRY/day)</Label>
                  <Input
                    id="insurancePerDayTry"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.insurancePerDayTry || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, insurancePerDayTry: parseFloat(e.target.value) || undefined })
                    }
                  />
                </div>
              </div>

              {/* Deposit and Min Rental */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="depositTry">Deposit (TRY)</Label>
                  <Input
                    id="depositTry"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.depositTry || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, depositTry: parseFloat(e.target.value) || undefined })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="minRentalDays">Min Rental Days</Label>
                  <Input
                    id="minRentalDays"
                    type="number"
                    min="1"
                    value={formData.minRentalDays || 1}
                    onChange={(e) =>
                      setFormData({ ...formData, minRentalDays: parseInt(e.target.value) || 1 })
                    }
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
