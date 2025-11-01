'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CreateManualQuoteInput } from '@/lib/validators/manual-quote';

interface QuoteFormProps {
  form: UseFormReturn<CreateManualQuoteInput>;
}

export function QuoteForm({ form }: QuoteFormProps) {
  const { register, formState: { errors }, watch, setValue } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="quoteName">Quote Name *</Label>
            <Input
              id="quoteName"
              {...register('quoteName')}
              placeholder="e.g., Istanbul & Cappadocia Tour - 7 Days"
            />
            {errors.quoteName && (
              <p className="text-sm text-red-600 mt-1">{errors.quoteName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={watch('category') || 'B2C'}
              onValueChange={(value: string) => setValue('category', value as 'B2C' | 'B2B' | 'B2B_FIT')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B2C">B2C</SelectItem>
                <SelectItem value="B2B">B2B</SelectItem>
                <SelectItem value="B2B_FIT">B2B FIT</SelectItem>
                <SelectItem value="B2B_GROUPS">B2B Groups</SelectItem>
                <SelectItem value="INTERNAL">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="seasonName">Season Name</Label>
            <Input
              id="seasonName"
              {...register('seasonName')}
              placeholder="e.g., Summer 2025"
            />
          </div>

          <div>
            <Label htmlFor="validFrom">Valid From</Label>
            <Input
              id="validFrom"
              type="date"
              {...register('validFrom')}
            />
          </div>

          <div>
            <Label htmlFor="validTo">Valid To</Label>
            <Input
              id="validTo"
              type="date"
              {...register('validTo')}
            />
          </div>

          <div>
            <Label htmlFor="startDate">Tour Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
            />
            {errors.startDate && (
              <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="endDate">Tour End Date *</Label>
            <Input
              id="endDate"
              type="date"
              {...register('endDate')}
            />
            {errors.endDate && (
              <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tourType">Tour Type *</Label>
            <Select
              value={watch('tourType')}
              onValueChange={(value: string) => setValue('tourType', value as 'SIC' | 'PRIVATE')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIC">SIC (Seat-in-Coach)</SelectItem>
                <SelectItem value="PRIVATE">Private</SelectItem>
              </SelectContent>
            </Select>
            {errors.tourType && (
              <p className="text-sm text-red-600 mt-1">{errors.tourType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pax">Number of Passengers (PAX) *</Label>
            <Input
              id="pax"
              type="number"
              {...register('pax', { valueAsNumber: true })}
              placeholder="2"
              min="1"
            />
            {errors.pax && (
              <p className="text-sm text-red-600 mt-1">{errors.pax.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="markup">Markup (%) *</Label>
            <Input
              id="markup"
              type="number"
              step="0.01"
              {...register('markup', { valueAsNumber: true })}
              placeholder="15.00"
              min="0"
              max="100"
            />
            {errors.markup && (
              <p className="text-sm text-red-600 mt-1">{errors.markup.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tax">Tax (%) *</Label>
            <Input
              id="tax"
              type="number"
              step="0.01"
              {...register('tax', { valueAsNumber: true })}
              placeholder="8.00"
              min="0"
              max="100"
            />
            {errors.tax && (
              <p className="text-sm text-red-600 mt-1">{errors.tax.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="transportPricingMode">Transport Pricing Mode</Label>
            <Select
              value={watch('transportPricingMode') || 'total'}
              onValueChange={(value: string) => setValue('transportPricingMode', value as 'total' | 'vehicle')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total (Per Person)</SelectItem>
                <SelectItem value="vehicle">Per Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
