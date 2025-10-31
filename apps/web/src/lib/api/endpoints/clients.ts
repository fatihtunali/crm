import apiClient from '../client';
import {
  Client,
  CreateClientDto,
  UpdateClientDto,
  PaginatedResponse,
  QueryParams,
} from '../types';

export const clientsApi = {
  // Get all clients with pagination and filters
  getAll: async (params?: QueryParams): Promise<PaginatedResponse<Client>> => {
    const response = await apiClient.get<PaginatedResponse<Client>>('/clients', {
      params,
    });
    return response.data;
  },

  // Get client by ID
  getById: async (id: number): Promise<Client> => {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response.data;
  },

  // Search clients
  search: async (query: string): Promise<Client[]> => {
    const response = await apiClient.get<Client[]>('/clients/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Create new client
  create: async (data: CreateClientDto): Promise<Client> => {
    const response = await apiClient.post<Client>('/clients', data);
    return response.data;
  },

  // Update client
  update: async (id: number, data: UpdateClientDto): Promise<Client> => {
    const response = await apiClient.patch<Client>(`/clients/${id}`, data);
    return response.data;
  },

  // Delete client (soft delete)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },
};
