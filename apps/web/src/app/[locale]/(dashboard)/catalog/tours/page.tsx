'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CitySelector } from '@/components/common/city-selector';
import { DateRangePicker } from '@/components/common/date-range-picker';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import { CurrencyDisplay } from '@/components/common/currency-display';
import { useTours } from '@/lib/api/hooks/use-catalog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ToursCatalogPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [cityId, setCityId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tourType, setTourType] = useState<'SIC' | 'PRIVATE' | ''>('');

  const { data: tours = [], isLoading } = useTours(
    {
      cityId: cityId!,
      startDate,
      endDate,
      ...(tourType && { tourType }),
    },
    !!(cityId && startDate && endDate)
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
          <h1 className="text-3xl font-bold text-gray-900">Tours Catalog</h1>
          <p className="text-gray-700 mt-1 text-base">Browse available SIC tours</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <CitySelector
              value={cityId}
              onChange={setCityId}
              placeholder="Select city"
            />
            <Select value={tourType || undefined} onValueChange={(val: string) => setTourType(val as 'SIC' | 'PRIVATE' | '')}>
              <SelectTrigger>
                <SelectValue placeholder="Tour Type (All)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIC">SIC</SelectItem>
                <SelectItem value="PRIVATE">Private</SelectItem>
              </SelectContent>
            </Select>
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
      ) : !cityId || !startDate || !endDate ? (
        <EmptyState
          title="Select search criteria"
          description="Choose a city and date range to browse tours"
        />
      ) : tours.length === 0 ? (
        <EmptyState
          title="No tours found"
          description="Try adjusting your search criteria"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tours.map((tour) => (
            <Card key={tour.id}>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">{tour.name}</h3>
                {tour.description && (
                  <p className="text-sm text-gray-600 mb-3">{tour.description}</p>
                )}
                {tour.city && (
                  <p className="text-sm text-gray-600 mb-2">{tour.city.name}</p>
                )}
                {tour.duration && (
                  <Badge variant="outline" className="mb-3">{tour.duration}</Badge>
                )}
                {tour.pricing && tour.pricing.length > 0 && tour.pricing[0].ppRate && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-600">From</p>
                    <p className="text-lg font-semibold text-green-600">
                      <CurrencyDisplay amount={tour.pricing[0].ppRate} /> <span className="text-sm text-gray-600">/ person</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
