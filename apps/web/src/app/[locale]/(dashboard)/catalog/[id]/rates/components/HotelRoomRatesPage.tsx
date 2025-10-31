'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useHotelRoomRates,
  useCreateHotelRoomRate,
  useUpdateHotelRoomRate,
  useDeleteHotelRoomRate,
} from '@/lib/api/hooks/use-hotel-rates';
import { BoardType, PricingModel } from '@/lib/api/endpoints/suppliers';
import type { HotelRoomRate, CreateHotelRoomRateDto, ServiceOffering } from '@/lib/api/endpoints/suppliers';
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

const boardTypeLabels: Record<BoardType, string> = {
  [BoardType.RO]: 'Room Only',
  [BoardType.BB]: 'Bed & Breakfast',
  [BoardType.HB]: 'Half Board',
  [BoardType.FB]: 'Full Board',
  [BoardType.AI]: 'All Inclusive',
};

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

interface HotelRoomRatesPageProps {
  offeringId: number;
  offering: ServiceOffering;
}

export default function HotelRoomRatesPage({ offeringId, offering }: HotelRoomRatesPageProps) {
  const params = useParams();
  const locale = params.locale as string;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<HotelRoomRate | null>(null);

  const { data: rates, isLoading } = useHotelRoomRates({
    serviceOfferingId: offeringId,
  });
  const createRate = useCreateHotelRoomRate();
  const updateRate = useUpdateHotelRoomRate();
  const deleteRate = useDeleteHotelRoomRate();

  const [formData, setFormData] = useState<Partial<CreateHotelRoomRateDto>>({
    serviceOfferingId: offeringId,
    pricingModel: PricingModel.PER_ROOM_NIGHT,
    boardType: BoardType.BB,
    occupancyAdults: 2,
    occupancyChildren: 0,
    minStay: 1,
    isActive: true,
  });

  const handleOpenDialog = (rate?: HotelRoomRate) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        serviceOfferingId: rate.serviceOfferingId,
        seasonFrom: rate.seasonFrom,
        seasonTo: rate.seasonTo,
        pricingModel: rate.pricingModel,
        boardType: rate.boardType,
        occupancyAdults: rate.occupancyAdults,
        occupancyChildren: rate.occupancyChildren,
        costTry: rate.costTry,
        allotment: rate.allotment,
        releaseDays: rate.releaseDays,
        minStay: rate.minStay,
        notes: rate.notes,
        isActive: rate.isActive,
      });
    } else {
      setEditingRate(null);
      setFormData({
        serviceOfferingId: offeringId,
        pricingModel: PricingModel.PER_ROOM_NIGHT,
        boardType: BoardType.BB,
        occupancyAdults: 2,
        occupancyChildren: 0,
        minStay: 1,
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
          boardType: formData.boardType,
          occupancyAdults: formData.occupancyAdults,
          occupancyChildren: formData.occupancyChildren,
          costTry: formData.costTry,
          allotment: formData.allotment,
          releaseDays: formData.releaseDays,
          minStay: formData.minStay,
          notes: formData.notes,
          isActive: formData.isActive,
        },
      });
    } else {
      await createRate.mutateAsync(formData as CreateHotelRoomRateDto);
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
        <Link href={`/${locale}/suppliers/hotels`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hotels
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotel Room Rates</h1>
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
                <TableHead>Board Type</TableHead>
                <TableHead>Pricing Model</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Cost (TRY)</TableHead>
                <TableHead>Allotment</TableHead>
                <TableHead>Min Stay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
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
                      <Badge variant="outline">{boardTypeLabels[rate.boardType]}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{pricingModelLabels[rate.pricingModel]}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{rate.occupancyAdults} Adults</div>
                        {rate.occupancyChildren > 0 && (
                          <div className="text-gray-500">{rate.occupancyChildren} Children</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">₺{rate.costTry.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{rate.allotment || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{rate.minStay || 1} night(s)</span>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRate ? 'Edit Rate' : 'Add New Rate'}</DialogTitle>
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

              {/* Board Type and Pricing Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="boardType">Board Type *</Label>
                  <Select
                    value={formData.boardType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, boardType: value as BoardType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(boardTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      <SelectItem value={PricingModel.PER_ROOM_NIGHT}>
                        {pricingModelLabels[PricingModel.PER_ROOM_NIGHT]}
                      </SelectItem>
                      <SelectItem value={PricingModel.PER_PERSON_NIGHT}>
                        {pricingModelLabels[PricingModel.PER_PERSON_NIGHT]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Occupancy */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupancyAdults">Adults *</Label>
                  <Input
                    id="occupancyAdults"
                    type="number"
                    min="0"
                    value={formData.occupancyAdults || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, occupancyAdults: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="occupancyChildren">Children</Label>
                  <Input
                    id="occupancyChildren"
                    type="number"
                    min="0"
                    value={formData.occupancyChildren || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, occupancyChildren: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Cost */}
              <div>
                <Label htmlFor="costTry">Cost (TRY) *</Label>
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

              {/* Additional Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="allotment">Allotment (Rooms)</Label>
                  <Input
                    id="allotment"
                    type="number"
                    min="0"
                    value={formData.allotment || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, allotment: parseInt(e.target.value) || undefined })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="releaseDays">Release Days</Label>
                  <Input
                    id="releaseDays"
                    type="number"
                    min="0"
                    value={formData.releaseDays || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, releaseDays: parseInt(e.target.value) || undefined })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="minStay">Min Stay (Nights)</Label>
                  <Input
                    id="minStay"
                    type="number"
                    min="1"
                    value={formData.minStay || 1}
                    onChange={(e) =>
                      setFormData({ ...formData, minStay: parseInt(e.target.value) || 1 })
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
