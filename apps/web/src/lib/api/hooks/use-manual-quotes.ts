import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { manualQuotesApi } from '../endpoints/manual-quotes';
import {
  CreateManualQuoteDto,
  UpdateManualQuoteDto,
  CreateManualQuoteDayDto,
  UpdateManualQuoteDayDto,
  CreateManualQuoteExpenseDto,
  UpdateManualQuoteExpenseDto,
  QueryParams,
} from '../types';

const MANUAL_QUOTES_KEY = 'manual-quotes';

// Get all manual quotes with pagination
export function useManualQuotes(params?: QueryParams) {
  return useQuery({
    queryKey: [MANUAL_QUOTES_KEY, params],
    queryFn: () => manualQuotesApi.getAll(params),
  });
}

// Get manual quote by ID
export function useManualQuote(id: number) {
  return useQuery({
    queryKey: [MANUAL_QUOTES_KEY, id],
    queryFn: () => manualQuotesApi.getById(id),
    enabled: !!id,
  });
}

// Create manual quote
export function useCreateManualQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateManualQuoteDto) => manualQuotesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MANUAL_QUOTES_KEY] });
    },
  });
}

// Update manual quote
export function useUpdateManualQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateManualQuoteDto }) =>
      manualQuotesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [MANUAL_QUOTES_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [MANUAL_QUOTES_KEY] });
    },
  });
}

// Delete manual quote
export function useDeleteManualQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => manualQuotesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MANUAL_QUOTES_KEY] });
    },
  });
}

// Add day to manual quote
export function useAddDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, data }: { quoteId: number; data: CreateManualQuoteDayDto }) =>
      manualQuotesApi.addDay(quoteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [MANUAL_QUOTES_KEY, variables.quoteId] });
    },
  });
}

// Update day in manual quote
export function useUpdateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, dayId, data }: { quoteId: number; dayId: number; data: UpdateManualQuoteDayDto }) =>
      manualQuotesApi.updateDay(quoteId, dayId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [MANUAL_QUOTES_KEY, variables.quoteId] });
    },
  });
}

// Remove day from manual quote
export function useRemoveDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, dayId }: { quoteId: number; dayId: number }) =>
      manualQuotesApi.removeDay(quoteId, dayId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [MANUAL_QUOTES_KEY, variables.quoteId] });
    },
  });
}

// Add expense to day
export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, dayId, data }: { quoteId: number; dayId: number; data: CreateManualQuoteExpenseDto }) =>
      manualQuotesApi.addExpense(quoteId, dayId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [MANUAL_QUOTES_KEY, variables.quoteId] });
    },
  });
}

// Update expense
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, expenseId, data }: { quoteId: number; expenseId: number; data: UpdateManualQuoteExpenseDto }) =>
      manualQuotesApi.updateExpense(quoteId, expenseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [MANUAL_QUOTES_KEY, variables.quoteId] });
    },
  });
}

// Remove expense
export function useRemoveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, expenseId }: { quoteId: number; expenseId: number }) =>
      manualQuotesApi.removeExpense(quoteId, expenseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [MANUAL_QUOTES_KEY, variables.quoteId] });
    },
  });
}

// Recalculate pricing
export function useRecalculatePricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: number) => manualQuotesApi.recalculatePricing(quoteId),
    onSuccess: (_, quoteId) => {
      queryClient.invalidateQueries({ queryKey: [MANUAL_QUOTES_KEY, quoteId] });
    },
  });
}
