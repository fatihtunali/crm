'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  createManualQuoteExpenseSchema,
  type CreateManualQuoteExpenseInput,
} from '@/lib/validators/manual-quote';
import { ExpenseCategory } from '@/lib/api/types';

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateManualQuoteExpenseInput) => void;
  defaultValues?: Partial<CreateManualQuoteExpenseInput>;
  transportPricingMode?: string;
}

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'hotelAccommodation', label: 'Hotel Accommodation' },
  { value: 'meals', label: 'Meals' },
  { value: 'entranceFees', label: 'Entrance Fees' },
  { value: 'sicTourCost', label: 'SIC Tour Cost' },
  { value: 'tips', label: 'Tips' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'guide', label: 'Guide' },
  { value: 'guideDriverAccommodation', label: 'Guide/Driver Accommodation' },
  { value: 'parking', label: 'Parking' },
];

export function ExpenseForm({ open, onOpenChange, onSubmit, defaultValues, transportPricingMode = 'total' }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<CreateManualQuoteExpenseInput>({
    resolver: zodResolver(createManualQuoteExpenseSchema),
    defaultValues: defaultValues || {
      category: 'hotelAccommodation',
      price: 0,
    },
  });

  const category = watch('category');
  const isTransportation = category === 'transportation';
  const isHotel = category === 'hotelAccommodation';

  const handleFormSubmit = (data: CreateManualQuoteExpenseInput) => {
    onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={category}
                onValueChange={(value: string) => setValue('category', value as ExpenseCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>

            {isHotel && (
              <div className="col-span-2">
                <Label htmlFor="hotelCategory">Hotel Category</Label>
                <Select
                  value={watch('hotelCategory') || ''}
                  onValueChange={(value: string) => setValue('hotelCategory', value)}
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
            )}

            <div className="col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input {...register('location')} placeholder="e.g., Istanbul, Cappadocia" />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea {...register('description')} placeholder="Additional details" rows={2} />
            </div>

            <div>
              <Label htmlFor="price">Base Price Per Person *</Label>
              <Input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
              )}
            </div>

            {!isTransportation && (
              <div>
                <Label htmlFor="singleSupplement">Single Supplement</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('singleSupplement', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          {!isTransportation && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Child Pricing</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="child0to2">Age 0-2</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('child0to2', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="child3to5">Age 3-5</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('child3to5', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="child6to11">Age 6-11</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('child6to11', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          {isTransportation && transportPricingMode === 'vehicle' && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Vehicle-Based Pricing</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleCount">Number of Vehicles *</Label>
                  <Input
                    type="number"
                    {...register('vehicleCount', { valueAsNumber: true })}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerVehicle">Price Per Vehicle *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('pricePerVehicle', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{defaultValues ? 'Update' : 'Add'} Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
