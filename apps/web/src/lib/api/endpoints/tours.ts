import { apiClient } from '../client';
import {
  Tour,
  CreateTourDto,
  UpdateTourDto,
  PaginatedResponse,
  QueryParams,
} from '../types';

export const toursApi = {
  /**
   * Get all tours with pagination
   */
  getAll: async (params?: QueryParams): Promise<PaginatedResponse<Tour>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const response = await apiClient.get<PaginatedResponse<Tour>>(
      `/tours?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get tour by ID with full itinerary
   */
  getById: async (id: number): Promise<Tour> => {
    const response = await apiClient.get<Tour>(`/tours/${id}`);
    return response.data;
  },

  /**
   * Search tours by code, name or description
   */
  search: async (query: string): Promise<Tour[]> => {
    const response = await apiClient.get<Tour[]>(`/tours/search?q=${query}`);
    return response.data;
  },

  /**
   * Create a new tour with itinerary
   */
  create: async (data: CreateTourDto): Promise<Tour> => {
    const response = await apiClient.post<Tour>('/tours', data);
    return response.data;
  },

  /**
   * Update tour
   */
  update: async (id: number, data: UpdateTourDto): Promise<Tour> => {
    const response = await apiClient.patch<Tour>(`/tours/${id}`, data);
    return response.data;
  },

  /**
   * Deactivate tour (soft delete)
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tours/${id}`);
  },
};
