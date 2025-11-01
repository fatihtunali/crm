'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CitySelector } from '@/components/common/city-selector';
import { DateRangePicker } from '@/components/common/date-range-picker';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import { CurrencyDisplay } from '@/components/common/currency-display';
import { useTransfers } from '@/lib/api/hooks/use-catalog';

export default function TransfersCatalogPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [fromCityId, setFromCityId] = useState<number | null>(null);
  const [toCityId, setToCityId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: transfers = [], isLoading } = useTransfers(
    {
      fromCityId: fromCityId!,
      toCityId: toCityId!,
      startDate,
      endDate,
    },
    !!(fromCityId && toCityId && startDate && endDate)
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/${locale}/catalog`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfers Catalog</h1>
          <p className="text-gray-700 mt-1 text-base">Browse intercity transfer options</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <CitySelector
              value={fromCityId}
              onChange={setFromCityId}
              placeholder="From city"
            />
            <CitySelector
              value={toCityId}
              onChange={setToCityId}
              placeholder="To city"
            />
          </div>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !fromCityId || !toCityId || !startDate || !endDate ? (
        <EmptyState
          title="Select search criteria"
          description="Choose cities and date range to browse transfers"
        />
      ) : transfers.length === 0 ? (
        <EmptyState
          title="No transfers found"
          description="Try adjusting your search criteria"
        />
      ) : (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <Card key={transfer.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">
                        {transfer.fromCity?.name}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {transfer.toCity?.name}
                      </span>
                    </div>
                    <div className="flex gap-3 text-sm text-gray-600">
                      {transfer.vehicleType && (
                        <Badge variant="outline">{transfer.vehicleType}</Badge>
                      )}
                      {transfer.capacity && (
                        <span>Capacity: {transfer.capacity} pax</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Price per vehicle</p>
                    <p className="text-lg font-semibold text-orange-600">
                      <CurrencyDisplay amount={transfer.pricePerVehicle} />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
