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
import { useHotels } from '@/lib/api/hooks/use-catalog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HotelsCatalogPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [cityId, setCityId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState<string>('');
  const [isBoutique] = useState<boolean | undefined>();

  const { data: hotels = [], isLoading } = useHotels(
    {
      cityId: cityId!,
      startDate,
      endDate,
      ...(category && { category }),
      ...(isBoutique !== undefined && { isBoutique }),
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
          <h1 className="text-3xl font-bold text-gray-900">Hotels Catalog</h1>
          <p className="text-gray-700 mt-1 text-base">Browse available hotels</p>
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
            <Select value={category || undefined} onValueChange={(val: string) => setCategory(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Hotel Category (All)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3 stars">3 Stars</SelectItem>
                <SelectItem value="4 stars">4 Stars</SelectItem>
                <SelectItem value="5 stars">5 Stars</SelectItem>
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
          description="Choose a city and date range to browse hotels"
        />
      ) : hotels.length === 0 ? (
        <EmptyState
          title="No hotels found"
          description="Try adjusting your search criteria"
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotels.map((hotel) => (
            <Card key={hotel.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                  <Badge>{hotel.category}</Badge>
                </div>
                {hotel.city && (
                  <p className="text-sm text-gray-600 mb-2">{hotel.city.name}</p>
                )}
                {hotel.pricing && hotel.pricing.length > 0 && hotel.pricing[0].ppDblRate && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-600">From</p>
                    <p className="text-lg font-semibold text-indigo-600">
                      <CurrencyDisplay amount={hotel.pricing[0].ppDblRate} /> <span className="text-sm text-gray-600">/ person</span>
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
