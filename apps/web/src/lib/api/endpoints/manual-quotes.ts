import apiClient from '../client';
import {
  ManualQuote,
  CreateManualQuoteDto,
  UpdateManualQuoteDto,
  CreateManualQuoteDayDto,
  UpdateManualQuoteDayDto,
  CreateManualQuoteExpenseDto,
  UpdateManualQuoteExpenseDto,
  PaginatedResponse,
  QueryParams,
  PricingTable,
} from '../types';

export const manualQuotesApi = {
  // Get all manual quotes with pagination
  getAll: async (params?: QueryParams): Promise<PaginatedResponse<ManualQuote>> => {
    const response = await apiClient.get<PaginatedResponse<ManualQuote>>('/manual-quotes', {
      params,
    });
    return response.data;
  },

  // Get manual quote by ID
  getById: async (id: number): Promise<ManualQuote> => {
    const response = await apiClient.get<ManualQuote>(`/manual-quotes/${id}`);
    return response.data;
  },

  // Create new manual quote
  create: async (data: CreateManualQuoteDto): Promise<ManualQuote> => {
    const response = await apiClient.post<ManualQuote>('/manual-quotes', data);
    return response.data;
  },

  // Update manual quote
  update: async (id: number, data: UpdateManualQuoteDto): Promise<ManualQuote> => {
    const response = await apiClient.put<ManualQuote>(`/manual-quotes/${id}`, data);
    return response.data;
  },

  // Delete manual quote
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/manual-quotes/${id}`);
  },

  // Add a day to manual quote
  addDay: async (quoteId: number, data: CreateManualQuoteDayDto): Promise<ManualQuote> => {
    const response = await apiClient.post<ManualQuote>(`/manual-quotes/${quoteId}/days`, data);
    return response.data;
  },

  // Update a day in manual quote
  updateDay: async (quoteId: number, dayId: number, data: UpdateManualQuoteDayDto): Promise<ManualQuote> => {
    const response = await apiClient.put<ManualQuote>(`/manual-quotes/${quoteId}/days/${dayId}`, data);
    return response.data;
  },

  // Remove a day from manual quote
  removeDay: async (quoteId: number, dayId: number): Promise<ManualQuote> => {
    const response = await apiClient.delete<ManualQuote>(`/manual-quotes/${quoteId}/days/${dayId}`);
    return response.data;
  },

  // Add expense to a day
  addExpense: async (quoteId: number, dayId: number, data: CreateManualQuoteExpenseDto): Promise<ManualQuote> => {
    const response = await apiClient.post<ManualQuote>(`/manual-quotes/${quoteId}/days/${dayId}/expenses`, data);
    return response.data;
  },

  // Update expense
  updateExpense: async (quoteId: number, expenseId: number, data: UpdateManualQuoteExpenseDto): Promise<ManualQuote> => {
    const response = await apiClient.put<ManualQuote>(`/manual-quotes/${quoteId}/expenses/${expenseId}`, data);
    return response.data;
  },

  // Remove expense
  removeExpense: async (quoteId: number, expenseId: number): Promise<ManualQuote> => {
    const response = await apiClient.delete<ManualQuote>(`/manual-quotes/${quoteId}/expenses/${expenseId}`);
    return response.data;
  },

  // Recalculate pricing for manual quote
  recalculatePricing: async (quoteId: number): Promise<PricingTable> => {
    const response = await apiClient.post<PricingTable>(`/manual-quotes/${quoteId}/calculate`);
    return response.data;
  },
};
