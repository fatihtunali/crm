import { apiClient } from '../client';
import {
  Quotation,
  CreateQuotationDto,
  UpdateQuotationDto,
  PaginatedResponse,
  QuotationStatus,
  QuotationStats,
  SearchQuotationParams,
} from '../types';

export const quotationsApi = {
  /**
   * Get all quotations with pagination and optional status filter
   */
  getAll: async (
    params?: { page?: number; limit?: number; status?: QuotationStatus }
  ): Promise<PaginatedResponse<Quotation>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await apiClient.get<PaginatedResponse<Quotation>>(
      `/quotations?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Search quotations with advanced filters
   */
  search: async (params: SearchQuotationParams): Promise<PaginatedResponse<Quotation>> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.clientName) queryParams.append('clientName', params.clientName);
    if (params.tourName) queryParams.append('tourName', params.tourName);
    if (params.status) queryParams.append('status', params.status);
    if (params.createdFrom) queryParams.append('createdFrom', params.createdFrom);
    if (params.createdTo) queryParams.append('createdTo', params.createdTo);
    if (params.validUntil) queryParams.append('validUntil', params.validUntil);

    const response = await apiClient.get<PaginatedResponse<Quotation>>(
      `/quotations/search?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get quotation statistics by status
   */
  getStats: async (): Promise<QuotationStats[]> => {
    const response = await apiClient.get<QuotationStats[]>('/quotations/stats');
    return response.data;
  },

  /**
   * Get quotation by ID with full details
   */
  getById: async (id: number): Promise<Quotation> => {
    const response = await apiClient.get<Quotation>(`/quotations/${id}`);
    return response.data;
  },

  /**
   * Create a new quotation
   */
  create: async (data: CreateQuotationDto): Promise<Quotation> => {
    const response = await apiClient.post<Quotation>('/quotations', data);
    return response.data;
  },

  /**
   * Update quotation
   */
  update: async (id: number, data: UpdateQuotationDto): Promise<Quotation> => {
    const response = await apiClient.patch<Quotation>(`/quotations/${id}`, data);
    return response.data;
  },

  /**
   * Send quotation to client (DRAFT → SENT)
   */
  send: async (id: number): Promise<Quotation> => {
    const response = await apiClient.post<Quotation>(`/quotations/${id}/send`);
    return response.data;
  },

  /**
   * Accept quotation (SENT → ACCEPTED)
   */
  accept: async (id: number): Promise<Quotation> => {
    const response = await apiClient.post<Quotation>(`/quotations/${id}/accept`);
    return response.data;
  },

  /**
   * Reject quotation (SENT → REJECTED)
   */
  reject: async (id: number): Promise<Quotation> => {
    const response = await apiClient.post<Quotation>(`/quotations/${id}/reject`);
    return response.data;
  },

  /**
   * Delete quotation
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/quotations/${id}`);
  },
};
