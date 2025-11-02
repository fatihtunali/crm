import apiClient from '../client';
import {
  City,
  QuoteHotel,
  SICTour,
  IntercityTransfer,
  CatalogHotelParams,
  CatalogTourParams,
  CatalogTransferParams,
} from '../types';

export const catalogApi = {
  // Get all cities for quote building
  getCities: async (includeAirports: boolean = false): Promise<City[]> => {
    const response = await apiClient.get<{ success: boolean; data: City[] }>('/catalog/cities', {
      params: { includeAirports },
    });
    return response.data.data;
  },

  // Get all hotels for management (no date filtering)
  getAllHotels: async (includeInactive: boolean = false): Promise<QuoteHotel[]> => {
    const response = await apiClient.get<{ success: boolean; data: QuoteHotel[] }>('/catalog/hotels/all', {
      params: { includeInactive },
    });
    return response.data.data;
  },

  // Get hotels for a city with date range and filters
  getHotels: async (params: CatalogHotelParams): Promise<QuoteHotel[]> => {
    const response = await apiClient.get<{ success: boolean; data: QuoteHotel[] }>('/catalog/hotels', {
      params,
    });
    return response.data.data;
  },

  // Get SIC tours for a city with date range
  getTours: async (params: CatalogTourParams): Promise<SICTour[]> => {
    const response = await apiClient.get<{ success: boolean; data: SICTour[] }>('/catalog/tours', {
      params,
    });
    return response.data.data;
  },

  // Get intercity transfers
  getTransfers: async (params: CatalogTransferParams): Promise<IntercityTransfer[]> => {
    const response = await apiClient.get<{ success: boolean; data: IntercityTransfer[] }>('/catalog/transfers', {
      params,
    });
    return response.data.data;
  },
};
