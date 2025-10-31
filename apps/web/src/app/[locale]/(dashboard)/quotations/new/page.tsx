'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCreateQuotation } from '@/lib/api/hooks/use-quotations';
import { useLeads } from '@/lib/api/hooks/use-leads';
import { useTours } from '@/lib/api/hooks/use-tours';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { CreateQuotationDto } from '@/lib/api/types';

export default function NewQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const createQuotation = useCreateQuotation();

  const { data: leadsData } = useLeads({ page: 1, limit: 100 });
  const { data: toursData } = useTours({ page: 1, limit: 100 });

  const [formData, setFormData] = useState<CreateQuotationDto>({
    leadId: undefined,
    tourId: undefined,
    calcCostTry: 0,
    sellPriceEur: 0,
    exchangeRateUsed: 32.5, // default exchange rate
    validUntil: '',
    status: 'DRAFT',
    notes: '',
    customJson: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.exchangeRateUsed || formData.exchangeRateUsed <= 0) {
      newErrors.exchangeRateUsed = 'Exchange rate is required and must be positive';
    }
    if (!formData.sellPriceEur || formData.sellPriceEur < 0) {
      newErrors.sellPriceEur = 'Selling price must be 0 or positive';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const quotation = await createQuotation.mutateAsync(formData);
      router.push(`/${locale}/quotations/${quotation.id}`);
    } catch (error) {
      console.error('Failed to create quotation:', error);
      alert('Failed to create quotation. Please try again.');
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Quotation</h1>
          <p className="text-gray-700 mt-1 text-base">
            Create a new tour quotation
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Lead & Tour Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Lead & Tour Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Lead Selection */}
              <div className="space-y-2">
                <Label htmlFor="leadId">Lead</Label>
                <select
                  id="leadId"
                  name="leadId"
                  value={formData.leadId || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      leadId: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select a lead (optional)</option>
                  {leadsData?.data.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      #{lead.id} - {lead.client?.name || 'Unknown'} -{' '}
                      {lead.destination || 'No destination'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tour Selection */}
              <div className="space-y-2">
                <Label htmlFor="tourId">Tour</Label>
                <select
                  id="tourId"
                  name="tourId"
                  value={formData.tourId || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tourId: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select a tour (optional)</option>
                  {toursData?.data.map((tour) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.code} - {tour.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Calculated Cost (TRY) */}
              <div className="space-y-2">
                <Label htmlFor="calcCostTry">Calculated Cost (TRY)</Label>
                <Input
                  id="calcCostTry"
                  name="calcCostTry"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.calcCostTry}
                  onChange={handleNumberChange}
                />
              </div>

              {/* Selling Price (EUR) - Required */}
              <div className="space-y-2">
                <Label htmlFor="sellPriceEur">
                  Selling Price (EUR) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sellPriceEur"
                  name="sellPriceEur"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sellPriceEur}
                  onChange={handleNumberChange}
                  className={errors.sellPriceEur ? 'border-red-500' : ''}
                />
                {errors.sellPriceEur && (
                  <p className="text-sm text-red-500">{errors.sellPriceEur}</p>
                )}
              </div>

              {/* Exchange Rate - Required */}
              <div className="space-y-2">
                <Label htmlFor="exchangeRateUsed">
                  Exchange Rate (TRY/EUR) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="exchangeRateUsed"
                  name="exchangeRateUsed"
                  type="number"
                  min="0"
                  step="0.0001"
                  value={formData.exchangeRateUsed}
                  onChange={handleNumberChange}
                  className={errors.exchangeRateUsed ? 'border-red-500' : ''}
                />
                {errors.exchangeRateUsed && (
                  <p className="text-sm text-red-500">{errors.exchangeRateUsed}</p>
                )}
              </div>
            </div>

            {/* Profit Calculation Display */}
            {formData.sellPriceEur > 0 && formData.exchangeRateUsed > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  Estimated Profit
                </div>
                <div className="text-2xl font-bold text-indigo-900">
                  €
                  {(
                    formData.sellPriceEur -
                    (formData.calcCostTry || 0) / formData.exchangeRateUsed
                  ).toFixed(2)}{' '}
                  (
                  {formData.sellPriceEur > 0
                    ? (
                        ((formData.sellPriceEur -
                          (formData.calcCostTry || 0) / formData.exchangeRateUsed) /
                          formData.sellPriceEur) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Valid Until */}
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="datetime-local"
                value={formData.validUntil}
                onChange={handleChange}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes or special requests..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createQuotation.isPending}>
            {createQuotation.isPending ? 'Creating...' : 'Create Quotation'}
          </Button>
        </div>
      </form>
    </div>
  );
}
