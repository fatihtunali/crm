'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CitySelector } from '@/components/common/city-selector';
import { useCities } from '@/lib/api/hooks/use-catalog';
import { X } from 'lucide-react';

interface CityNight {
  cityId: number | null;
  cityName: string;
  nights: number;
}

interface CityNightsBuilderProps {
  value: string; // Format: "Istanbul:3,Cappadocia:2"
  onChange: (value: string) => void;
}

export function CityNightsBuilder({ value, onChange }: CityNightsBuilderProps) {
  const { data: cities = [] } = useCities();

  // Parse the value string into city-night pairs
  const parseCityNights = (str: string): CityNight[] => {
    if (!str) return [];
    return str.split(',').map((pair) => {
      const [cityName, nights] = pair.split(':');
      return {
        cityId: null,
        cityName: cityName.trim(),
        nights: parseInt(nights) || 1,
      };
    });
  };

  const [cityNights, setCityNights] = useState<CityNight[]>(() => parseCityNights(value));
  const [currentCityId, setCurrentCityId] = useState<number | null>(null);
  const [currentNights, setCurrentNights] = useState<number>(1);

  // Update the parent component when cityNights changes
  const updateValue = (newCityNights: CityNight[]) => {
    const formatted = newCityNights
      .filter((cn) => cn.cityName && cn.nights > 0)
      .map((cn) => `${cn.cityName}:${cn.nights}`)
      .join(',');
    onChange(formatted);
  };

  const handleCityChange = (cityId: number) => {
    setCurrentCityId(cityId);
    const city = cities.find((c) => c.id === cityId);
    if (city) {
      const newCityNights = [
        ...cityNights,
        {
          cityId,
          cityName: city.name,
          nights: currentNights,
        },
      ];
      setCityNights(newCityNights);
      updateValue(newCityNights);
      setCurrentCityId(null);
      setCurrentNights(1);
    }
  };

  const handleRemoveCity = (index: number) => {
    const newCityNights = cityNights.filter((_, i) => i !== index);
    setCityNights(newCityNights);
    updateValue(newCityNights);
  };

  const handleNightsChange = (index: number, nights: number) => {
    const newCityNights = [...cityNights];
    newCityNights[index].nights = Math.max(1, nights);
    setCityNights(newCityNights);
    updateValue(newCityNights);
  };

  const totalNights = cityNights.reduce((sum, cn) => sum + cn.nights, 0);

  return (
    <div className="space-y-4">
      {/* Existing City-Night Pairs */}
      {cityNights.length > 0 && (
        <div className="space-y-2">
          {cityNights.map((cityNight, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{cityNight.cityName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={cityNight.nights}
                      onChange={(e) => handleNightsChange(index, parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">nights</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCity(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="text-sm text-gray-600 text-right">
            Total: <span className="font-semibold">{totalNights} nights</span>
          </div>
        </div>
      )}

      {/* Add New City */}
      <Card className="border-dashed border-2">
        <CardContent className="pt-4">
          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add City
              </label>
              <CitySelector
                value={currentCityId}
                onChange={handleCityChange}
                placeholder="Select a city..."
                includeAirports={false}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nights
              </label>
              <Input
                type="number"
                min="1"
                value={currentNights}
                onChange={(e) => setCurrentNights(parseInt(e.target.value) || 1)}
                className="w-20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {cityNights.length === 0 && (
        <p className="text-sm text-gray-600 text-center py-4">
          Add cities to your itinerary by selecting from the dropdown above
        </p>
      )}
    </div>
  );
}
