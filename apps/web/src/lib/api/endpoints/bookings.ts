import { apiClient } from '../client';
import {
  Booking,
  CreateBookingDto,
  UpdateBookingDto,
  PaginatedResponse,
  BookingStatus,
  BookingStats,
  SearchBookingParams,
  PnLResponse,
} from '../types';

export const bookingsApi = {
  /**
   * Get all bookings with pagination and optional status filter
   */
  getAll: async (
    params?: { page?: number; limit?: number; status?: BookingStatus }
  ): Promise<PaginatedResponse<Booking>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await apiClient.get<PaginatedResponse<Booking>>(
      `/bookings?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Search bookings with advanced filters
   */
  search: async (params: SearchBookingParams): Promise<PaginatedResponse<Booking>> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.bookingCode) queryParams.append('bookingCode', params.bookingCode);
    if (params.clientName) queryParams.append('clientName', params.clientName);
    if (params.clientEmail) queryParams.append('clientEmail', params.clientEmail);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDateFrom) queryParams.append('startDateFrom', params.startDateFrom);
    if (params.startDateTo) queryParams.append('startDateTo', params.startDateTo);

    const response = await apiClient.get<PaginatedResponse<Booking>>(
      `/bookings/search?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get booking statistics by status
   */
  getStats: async (): Promise<BookingStats[]> => {
    const response = await apiClient.get<BookingStats[]>('/bookings/stats');
    return response.data;
  },

  /**
   * Get booking by ID with full details
   */
  getById: async (id: number): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Calculate P&L for a booking
   */
  getPnL: async (id: number): Promise<PnLResponse> => {
    const response = await apiClient.get<PnLResponse>(`/bookings/${id}/pnl`);
    return response.data;
  },

  /**
   * Create a new booking
   */
  create: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await apiClient.post<Booking>('/bookings', data);
    return response.data;
  },

  /**
   * Update booking
   */
  update: async (id: number, data: UpdateBookingDto): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}`, data);
    return response.data;
  },

  /**
   * Delete booking
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/bookings/${id}`);
  },
};
