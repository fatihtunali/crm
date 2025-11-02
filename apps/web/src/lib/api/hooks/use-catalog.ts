import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../endpoints/catalog';
import {
  CatalogHotelParams,
  CatalogTourParams,
  CatalogTransferParams,
} from '../types';

const CATALOG_KEY = 'catalog';

// Get all cities for quote building
export function useCities(includeAirports: boolean = false) {
  return useQuery({
    queryKey: [CATALOG_KEY, 'cities', includeAirports],
    queryFn: () => catalogApi.getCities(includeAirports),
    staleTime: 1000 * 60 * 10, // 10 minutes - cities don't change often
  });
}

// Get all hotels for management (no date filtering)
export function useAllHotels(includeInactive: boolean = false) {
  return useQuery({
    queryKey: [CATALOG_KEY, 'hotels', 'all', includeInactive],
    queryFn: () => catalogApi.getAllHotels(includeInactive),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get hotels for a city with filters
export function useHotels(params: CatalogHotelParams, enabled: boolean = true) {
  return useQuery({
    queryKey: [CATALOG_KEY, 'hotels', params],
    queryFn: () => catalogApi.getHotels(params),
    enabled: enabled && !!params.cityId && !!params.startDate && !!params.endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get tours for a city
export function useTours(params: CatalogTourParams, enabled: boolean = true) {
  return useQuery({
    queryKey: [CATALOG_KEY, 'tours', params],
    queryFn: () => catalogApi.getTours(params),
    enabled: enabled && !!params.cityId && !!params.startDate && !!params.endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get transfers between cities
export function useTransfers(params: CatalogTransferParams, enabled: boolean = true) {
  return useQuery({
    queryKey: [CATALOG_KEY, 'transfers', params],
    queryFn: () => catalogApi.getTransfers(params),
    enabled: enabled && !!params.fromCityId && !!params.toCityId && !!params.startDate && !!params.endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
