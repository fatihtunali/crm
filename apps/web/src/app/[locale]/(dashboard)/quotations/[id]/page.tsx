'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  useQuotation,
  useSendQuotation,
  useAcceptQuotation,
  useRejectQuotation,
} from '@/lib/api/hooks/use-quotations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Edit,
  Send,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Euro,
  Calendar,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { QuotationStatus } from '@/lib/api/types';

const statusColors: Record<QuotationStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
};

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const quotationId = parseInt(params.id as string);

  const { data: quotation, isLoading } = useQuotation(quotationId);
  const sendQuotation = useSendQuotation();
  const acceptQuotation = useAcceptQuotation();
  const rejectQuotation = useRejectQuotation();

  const handleSend = async () => {
    if (confirm('Send this quotation to the client?')) {
      try {
        await sendQuotation.mutateAsync(quotationId);
        alert('Quotation sent successfully');
      } catch (error) {
        console.error('Failed to send quotation:', error);
        alert('Failed to send quotation. Please try again.');
      }
    }
  };

  const handleAccept = async () => {
    if (confirm('Mark this quotation as accepted?')) {
      await acceptQuotation.mutateAsync(quotationId);
    }
  };

  const handleReject = async () => {
    if (confirm('Mark this quotation as rejected?')) {
      await rejectQuotation.mutateAsync(quotationId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-8">
        <p>Quotation not found</p>
      </div>
    );
  }

  const profit = quotation.sellPriceEur - quotation.calcCostTry / quotation.exchangeRateUsed;
  const marginPercent =
    quotation.sellPriceEur > 0 ? (profit / quotation.sellPriceEur) * 100 : 0;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quotation #{quotation.id}
            </h1>
            <p className="text-gray-700 mt-1 text-base">View quotation details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {quotation.status === 'DRAFT' && (
            <>
              <Button onClick={handleSend} variant="outline">
                <Send className="mr-2 h-4 w-4" />
                Send to Client
              </Button>
              <Link href={`/${locale}/quotations/${quotation.id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </>
          )}
          {quotation.status === 'SENT' && (
            <>
              <Button onClick={handleReject} variant="outline">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={handleAccept}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Client/Lead Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Client/Lead Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotation.lead && (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Client Name
                  </label>
                  <p className="text-gray-900 mt-1">
                    {quotation.lead.client?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Lead ID
                  </label>
                  <p className="text-gray-900 mt-1">
                    <Link
                      href={`/${locale}/leads/${quotation.leadId}`}
                      className="text-indigo-600 hover:underline"
                    >
                      #{quotation.leadId}
                    </Link>
                  </p>
                </div>
                {quotation.lead.destination && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Destination
                    </label>
                    <p className="text-gray-900 mt-1">
                      {quotation.lead.destination}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Tour Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Tour Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotation.tour ? (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Tour Name
                  </label>
                  <p className="text-gray-900 mt-1">
                    <Link
                      href={`/${locale}/tours/${quotation.tourId}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {quotation.tour.name}
                    </Link>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Tour Code
                  </label>
                  <p className="text-gray-900 mt-1">{quotation.tour.code}</p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No tour selected</p>
            )}
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Pricing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Selling Price (EUR)
              </label>
              <p className="text-gray-900 mt-1 text-2xl font-bold text-green-600">
                €{parseFloat(quotation.sellPriceEur.toString()).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Calculated Cost (TRY)
              </label>
              <p className="text-gray-900 mt-1">
                ₺{parseFloat(quotation.calcCostTry.toString()).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Exchange Rate
              </label>
              <p className="text-gray-900 mt-1">
                {parseFloat(quotation.exchangeRateUsed.toString()).toFixed(4)}
              </p>
            </div>
            <div className="border-t pt-4">
              <label className="text-sm font-semibold text-gray-600">
                Estimated Profit
              </label>
              <p
                className={`text-gray-900 mt-1 text-xl font-bold ${
                  profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                €{profit.toFixed(2)} ({marginPercent.toFixed(1)}%)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status & Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Status & Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Status</label>
              <p className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    statusColors[quotation.status]
                  }`}
                >
                  {quotation.status}
                </span>
              </p>
            </div>
            {quotation.validUntil && (
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Valid Until
                </label>
                <p className="text-gray-900 mt-1">
                  {new Date(quotation.validUntil).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Created At
              </label>
              <p className="text-gray-900 mt-1">
                {new Date(quotation.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Last Updated
              </label>
              <p className="text-gray-900 mt-1">
                {new Date(quotation.updatedAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {quotation.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 whitespace-pre-wrap">{quotation.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Custom Data */}
        {quotation.customJson && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Custom Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(quotation.customJson, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
