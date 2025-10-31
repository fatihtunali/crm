import { apiClient } from '../client';
import {
  ClientPayment,
  VendorPayment,
  CreateClientPaymentDto,
  CreateVendorPaymentDto,
  UpdateClientPaymentDto,
  UpdateVendorPaymentDto,
  PaginatedResponse,
  PaymentClientStats,
  PaymentVendorStats,
} from '../types';

export const paymentsClientApi = {
  /**
   * Get all client payments with pagination and optional bookingId filter
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    bookingId?: number;
  }): Promise<PaginatedResponse<ClientPayment>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.bookingId) queryParams.append('bookingId', params.bookingId.toString());

    const response = await apiClient.get<PaginatedResponse<ClientPayment>>(
      `/payment-client?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get client payment statistics
   */
  getStats: async (): Promise<PaymentClientStats[]> => {
    const response = await apiClient.get<PaymentClientStats[]>('/payment-client/stats');
    return response.data;
  },

  /**
   * Get client payment by ID
   */
  getById: async (id: number): Promise<ClientPayment> => {
    const response = await apiClient.get<ClientPayment>(`/payment-client/${id}`);
    return response.data;
  },

  /**
   * Create a new client payment
   */
  create: async (data: CreateClientPaymentDto): Promise<ClientPayment> => {
    const idempotencyKey = crypto.randomUUID();
    const response = await apiClient.post<ClientPayment>('/payment-client', data, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
    return response.data;
  },

  /**
   * Update client payment
   */
  update: async (id: number, data: UpdateClientPaymentDto): Promise<ClientPayment> => {
    const response = await apiClient.patch<ClientPayment>(`/payment-client/${id}`, data);
    return response.data;
  },

  /**
   * Delete client payment
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/payment-client/${id}`);
  },
};

export const paymentsVendorApi = {
  /**
   * Get all vendor payments with pagination and optional filters
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    bookingId?: number;
    vendorId?: number;
  }): Promise<PaginatedResponse<VendorPayment>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.bookingId) queryParams.append('bookingId', params.bookingId.toString());
    if (params?.vendorId) queryParams.append('vendorId', params.vendorId.toString());

    const response = await apiClient.get<PaginatedResponse<VendorPayment>>(
      `/payment-vendor?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get vendor payment statistics
   */
  getStats: async (): Promise<PaymentVendorStats[]> => {
    const response = await apiClient.get<PaymentVendorStats[]>('/payment-vendor/stats');
    return response.data;
  },

  /**
   * Get vendor payment by ID
   */
  getById: async (id: number): Promise<VendorPayment> => {
    const response = await apiClient.get<VendorPayment>(`/payment-vendor/${id}`);
    return response.data;
  },

  /**
   * Create a new vendor payment
   */
  create: async (data: CreateVendorPaymentDto): Promise<VendorPayment> => {
    const idempotencyKey = crypto.randomUUID();
    const response = await apiClient.post<VendorPayment>('/payment-vendor', data, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
    return response.data;
  },

  /**
   * Update vendor payment
   */
  update: async (id: number, data: UpdateVendorPaymentDto): Promise<VendorPayment> => {
    const response = await apiClient.patch<VendorPayment>(`/payment-vendor/${id}`, data);
    return response.data;
  },

  /**
   * Delete vendor payment
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/payment-vendor/${id}`);
  },
};
