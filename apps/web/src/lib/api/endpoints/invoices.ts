import { apiClient } from '../client';
import {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  PaginatedResponse,
  InvoiceStats,
} from '../types';

export const invoicesApi = {
  /**
   * Get all invoices with pagination and optional bookingId filter
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    bookingId?: number;
  }): Promise<PaginatedResponse<Invoice>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.bookingId) queryParams.append('bookingId', params.bookingId.toString());

    const response = await apiClient.get<PaginatedResponse<Invoice>>(
      `/invoices?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get invoice statistics by currency
   */
  getStats: async (): Promise<InvoiceStats[]> => {
    const response = await apiClient.get<InvoiceStats[]>('/invoices/stats');
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  getById: async (id: number): Promise<Invoice> => {
    const response = await apiClient.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  /**
   * Generate and download invoice PDF
   */
  downloadPDF: async (id: number): Promise<Blob> => {
    const response = await apiClient.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Create a new invoice
   */
  create: async (data: CreateInvoiceDto): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>('/invoices', data);
    return response.data;
  },

  /**
   * Update invoice
   */
  update: async (id: number, data: UpdateInvoiceDto): Promise<Invoice> => {
    const response = await apiClient.patch<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },

  /**
   * Delete invoice
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/invoices/${id}`);
  },
};
