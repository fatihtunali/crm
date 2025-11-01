import apiClient from '../client';
import {
  CustomerItinerary,
  GenerateItineraryDto,
  UpdateItineraryStatusDto,
  PaginatedResponse,
  QueryParams,
  ManualQuote,
} from '../types';

export const customerItinerariesApi = {
  // PUBLIC: Generate AI itinerary (no auth required)
  generate: async (data: GenerateItineraryDto, tenantId: number): Promise<CustomerItinerary> => {
    const response = await apiClient.post<CustomerItinerary>(
      `/customer-itineraries/generate?tenantId=${tenantId}`,
      data,
      {
        headers: {
          // Override auth header for public endpoint
          Authorization: '',
        },
      }
    );
    return response.data;
  },

  // PUBLIC: Get itinerary by UUID (no auth required)
  getByUuid: async (uuid: string): Promise<CustomerItinerary> => {
    const response = await apiClient.get<CustomerItinerary>(
      `/customer-itineraries/view/${uuid}`,
      {
        headers: {
          // Override auth header for public endpoint
          Authorization: '',
        },
      }
    );
    return response.data;
  },

  // PUBLIC: Request booking for itinerary (no auth required)
  requestBooking: async (uuid: string): Promise<CustomerItinerary> => {
    const response = await apiClient.post<CustomerItinerary>(
      `/customer-itineraries/view/${uuid}/request-booking`,
      {},
      {
        headers: {
          // Override auth header for public endpoint
          Authorization: '',
        },
      }
    );
    return response.data;
  },

  // PROTECTED: Get all customer itineraries with pagination
  getAll: async (params?: QueryParams): Promise<PaginatedResponse<CustomerItinerary>> => {
    const response = await apiClient.get<PaginatedResponse<CustomerItinerary>>('/customer-itineraries', {
      params,
    });
    return response.data;
  },

  // PROTECTED: Get customer itinerary by ID
  getById: async (id: number): Promise<CustomerItinerary> => {
    const response = await apiClient.get<CustomerItinerary>(`/customer-itineraries/${id}`);
    return response.data;
  },

  // PROTECTED: Update itinerary status
  updateStatus: async (uuid: string, data: UpdateItineraryStatusDto): Promise<CustomerItinerary> => {
    const response = await apiClient.put<CustomerItinerary>(
      `/customer-itineraries/${uuid}/status`,
      data
    );
    return response.data;
  },

  // PROTECTED: Convert customer itinerary to manual quote
  convertToManualQuote: async (id: number): Promise<ManualQuote> => {
    const response = await apiClient.post<ManualQuote>(
      `/customer-itineraries/${id}/convert-to-quote`
    );
    return response.data;
  },
};
