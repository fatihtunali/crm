'use client';

import React, { useState, useMemo } from 'react';
import { useCities } from '@/lib/api/hooks/use-catalog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from './loading-spinner';

interface CitySelectorProps {
  value: number | null;
  onChange: (cityId: number) => void;
  includeAirports?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
}

export function CitySelector({
  value,
  onChange,
  includeAirports = false,
  placeholder = 'Select a city',
  className = '',
  disabled = false,
  searchable = true,
}: CitySelectorProps) {
  const { data: cities = [], isLoading } = useCities(includeAirports);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = useMemo(() => {
    if (!searchQuery) return cities;
    const query = searchQuery.toLowerCase();
    return cities.filter(city =>
      city.name.toLowerCase().includes(query) ||
      city.code?.toLowerCase().includes(query)
    );
  }, [cities, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div className={className}>
      {searchable && cities.length > 5 && (
        <Input
          type="text"
          placeholder="Search cities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2"
          disabled={disabled}
        />
      )}
      <Select
        value={value?.toString()}
        onValueChange={(val: string) => onChange(parseInt(val, 10))}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredCities.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              No cities found
            </div>
          ) : (
            filteredCities.map((city) => (
              <SelectItem key={city.id} value={city.id.toString()}>
                {city.name}
                {city.code && ` (${city.code})`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
