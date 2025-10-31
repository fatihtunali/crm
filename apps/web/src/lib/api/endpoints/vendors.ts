import apiClient from '../client';
import {
  Vendor,
  CreateVendorDto,
  UpdateVendorDto,
  VendorType,
  PaginatedResponse,
  QueryParams,
} from '../types';

export const vendorsApi = {
  // Get all vendors with pagination and filters
  getAll: async (params?: QueryParams & { type?: VendorType }): Promise<PaginatedResponse<Vendor>> => {
    const response = await apiClient.get<PaginatedResponse<Vendor>>('/vendors', {
      params,
    });
    return response.data;
  },

  // Get vendor by ID
  getById: async (id: number): Promise<Vendor> => {
    const response = await apiClient.get<Vendor>(`/vendors/${id}`);
    return response.data;
  },

  // Search vendors
  search: async (query: string): Promise<Vendor[]> => {
    const response = await apiClient.get<Vendor[]>('/vendors/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Create new vendor
  create: async (data: CreateVendorDto): Promise<Vendor> => {
    const response = await apiClient.post<Vendor>('/vendors', data);
    return response.data;
  },

  // Update vendor
  update: async (id: number, data: UpdateVendorDto): Promise<Vendor> => {
    const response = await apiClient.patch<Vendor>(`/vendors/${id}`, data);
    return response.data;
  },

  // Delete vendor (soft delete)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/vendors/${id}`);
  },
};
