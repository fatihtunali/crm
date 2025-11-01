import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsApi } from '../endpoints/quotations';
import {
  CreateQuotationDto,
  UpdateQuotationDto,
  QuotationStatus,
  SearchQuotationParams,
} from '../types';

const QUOTATIONS_KEY = 'quotations';

// Get all quotations with pagination and optional status filter
export function useQuotations(params?: {
  page?: number;
  limit?: number;
  status?: QuotationStatus;
}) {
  return useQuery({
    queryKey: [QUOTATIONS_KEY, params],
    queryFn: () => quotationsApi.getAll(params),
  });
}

// Search quotations with advanced filters
export function useQuotationSearch(params: SearchQuotationParams) {
  return useQuery({
    queryKey: [QUOTATIONS_KEY, 'search', params],
    queryFn: () => quotationsApi.search(params),
    enabled: !!(
      params.clientName ||
      params.tourName ||
      params.status ||
      params.createdFrom ||
      params.createdTo
    ),
  });
}

// Get quotation statistics
export function useQuotationStats() {
  return useQuery({
    queryKey: [QUOTATIONS_KEY, 'stats'],
    queryFn: () => quotationsApi.getStats(),
  });
}

// Get quotation by ID
export function useQuotation(id: number) {
  return useQuery({
    queryKey: [QUOTATIONS_KEY, id],
    queryFn: () => quotationsApi.getById(id),
    enabled: !!id,
  });
}

// Create quotation
export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuotationDto) => quotationsApi.create(data),
    onSuccess: () => {
      // Invalidate quotations list and stats
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
    },
  });
}

// Update quotation
export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateQuotationDto }) =>
      quotationsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific quotation, lists, and stats
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
    },
  });
}

// Send quotation (DRAFT → SENT)
export function useSendQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => quotationsApi.send(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
    },
  });
}

// Accept quotation (SENT → ACCEPTED)
export function useAcceptQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => quotationsApi.accept(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
    },
  });
}

// Reject quotation (SENT → REJECTED)
export function useRejectQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => quotationsApi.reject(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
    },
  });
}

// Delete quotation
export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => quotationsApi.delete(id),
    onSuccess: () => {
      // Invalidate all quotations queries
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_KEY] });
    },
  });
}
