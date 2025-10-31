'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useCreateLead } from '@/lib/api/hooks/use-leads';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const leadSchema = z.object({
  clientId: z.string().optional(),
  source: z.string().optional(),
  inquiryDate: z.string().min(1, 'Inquiry date is required'),
  destination: z.string().optional(),
  paxAdults: z.string().optional(),
  paxChildren: z.string().optional(),
  budgetEur: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST']).optional(),
  notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

export default function NewLeadPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const createLeadMutation = useCreateLead();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      inquiryDate: new Date().toISOString().split('T')[0],
      status: 'NEW',
      paxAdults: '0',
      paxChildren: '0',
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      setError(null);

      const payload = {
        clientId: data.clientId ? parseInt(data.clientId) : undefined,
        source: data.source || undefined,
        inquiryDate: data.inquiryDate,
        destination: data.destination || undefined,
        paxAdults: data.paxAdults ? parseInt(data.paxAdults) : 0,
        paxChildren: data.paxChildren ? parseInt(data.paxChildren) : 0,
        budgetEur: data.budgetEur ? parseFloat(data.budgetEur) : undefined,
        status: data.status || 'NEW',
        notes: data.notes || undefined,
      };

      await createLeadMutation.mutateAsync(payload);
      router.push(`/${locale}/leads`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create lead');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/${locale}/leads`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Lead</h1>
        <p className="text-gray-700 mt-1">Add a new potential customer inquiry</p>
      </div>

      <Card className="border-2 border-blue-200 shadow-lg max-w-3xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500">
          <CardTitle className="text-white font-bold">Lead Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Inquiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('inquiryDate')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900 font-medium bg-white"
                />
                {errors.inquiryDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.inquiryDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  {...register('source')}
                  placeholder="e.g., Website, Referral, Email"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900 font-medium bg-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  {...register('destination')}
                  placeholder="e.g., Istanbul & Cappadocia"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900 font-medium bg-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900 font-medium bg-white"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUOTED">QUOTED</option>
                  <option value="WON">WON</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adults
                </label>
                <input
                  type="number"
                  {...register('paxAdults')}
                  min="0"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Children
                </label>
                <input
                  type="number"
                  {...register('paxChildren')}
                  min="0"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget (EUR)
                </label>
                <input
                  type="number"
                  {...register('budgetEur')}
                  step="0.01"
                  min="0"
                  placeholder="e.g., 2500.00"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900 font-medium bg-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client ID (Optional)
                </label>
                <input
                  type="number"
                  {...register('clientId')}
                  placeholder="Link to existing client"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900 font-medium bg-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                placeholder="Add any additional information about this lead..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900 font-medium bg-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3"
              >
                {isSubmitting ? 'Creating...' : 'Create Lead'}
              </Button>
              <Link href={`/${locale}/leads`} className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-gray-300 py-3"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
