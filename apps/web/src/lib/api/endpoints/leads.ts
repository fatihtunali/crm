import apiClient from '../client';
import {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  LeadStats,
  LeadStatus,
  PaginatedResponse,
  QueryParams,
} from '../types';

export const leadsApi = {
  // Get all leads with pagination and filters
  getAll: async (params?: QueryParams & { status?: LeadStatus }): Promise<PaginatedResponse<Lead>> => {
    const response = await apiClient.get<PaginatedResponse<Lead>>('/leads', {
      params,
    });
    return response.data;
  },

  // Get lead by ID
  getById: async (id: number): Promise<Lead> => {
    const response = await apiClient.get<Lead>(`/leads/${id}`);
    return response.data;
  },

  // Get leads statistics by status
  getStats: async (): Promise<LeadStats[]> => {
    const response = await apiClient.get<LeadStats[]>('/leads/stats');
    return response.data;
  },

  // Create new lead
  create: async (data: CreateLeadDto): Promise<Lead> => {
    const response = await apiClient.post<Lead>('/leads', data);
    return response.data;
  },

  // Update lead
  update: async (id: number, data: UpdateLeadDto): Promise<Lead> => {
    const response = await apiClient.patch<Lead>(`/leads/${id}`, data);
    return response.data;
  },

  // Delete lead (soft delete)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/leads/${id}`);
  },
};
