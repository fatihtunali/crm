import { apiClient } from '../client';
import {
  WebhookEvent,
  WebhookFilter,
  WebhookStats,
  PaginatedResponse,
} from '../types';

export const webhooksApi = {
  /**
   * Get all webhook events with filters
   */
  getAll: async (filters?: WebhookFilter): Promise<PaginatedResponse<WebhookEvent>> => {
    const queryParams = new URLSearchParams();

    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.provider) queryParams.append('provider', filters.provider);
    if (filters?.eventType) queryParams.append('eventType', filters.eventType);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters?.isVerified !== undefined)
      queryParams.append('isVerified', filters.isVerified.toString());

    const response = await apiClient.get<PaginatedResponse<WebhookEvent>>(
      `/webhooks?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get webhook statistics
   */
  getStats: async (): Promise<WebhookStats> => {
    const response = await apiClient.get<WebhookStats>('/webhooks/stats');
    return response.data;
  },

  /**
   * Get webhook event by ID
   */
  getById: async (id: number): Promise<WebhookEvent> => {
    const response = await apiClient.get<WebhookEvent>(`/webhooks/${id}`);
    return response.data;
  },

  /**
   * Retry failed webhook processing
   */
  retry: async (id: number): Promise<WebhookEvent> => {
    const response = await apiClient.post<WebhookEvent>(`/webhooks/${id}/retry`);
    return response.data;
  },
};
