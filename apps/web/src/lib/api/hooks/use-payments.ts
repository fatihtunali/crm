import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsClientApi, paymentsVendorApi } from '../endpoints/payments';
import {
  ClientPayment,
  VendorPayment,
  CreateClientPaymentDto,
  CreateVendorPaymentDto,
  UpdateClientPaymentDto,
  UpdateVendorPaymentDto,
} from '../types';

const PAYMENTS_CLIENT_KEY = 'payments-client';
const PAYMENTS_VENDOR_KEY = 'payments-vendor';

// ============ Client Payments ============

/**
 * Get all client payments with pagination
 */
export function useClientPayments(params?: {
  page?: number;
  limit?: number;
  bookingId?: number;
}) {
  return useQuery({
    queryKey: [PAYMENTS_CLIENT_KEY, params],
    queryFn: () => paymentsClientApi.getAll(params),
  });
}

/**
 * Get client payment statistics
 */
export function useClientPaymentStats() {
  return useQuery({
    queryKey: [PAYMENTS_CLIENT_KEY, 'stats'],
    queryFn: () => paymentsClientApi.getStats(),
  });
}

/**
 * Get client payment by ID
 */
export function useClientPayment(id: number) {
  return useQuery({
    queryKey: [PAYMENTS_CLIENT_KEY, id],
    queryFn: () => paymentsClientApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Create client payment
 */
export function useCreateClientPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientPaymentDto) => paymentsClientApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_CLIENT_KEY] });
    },
  });
}

/**
 * Update client payment
 */
export function useUpdateClientPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClientPaymentDto }) =>
      paymentsClientApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_CLIENT_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_CLIENT_KEY] });
    },
  });
}

/**
 * Delete client payment
 */
export function useDeleteClientPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => paymentsClientApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_CLIENT_KEY] });
    },
  });
}

// ============ Vendor Payments ============

/**
 * Get all vendor payments with pagination
 */
export function useVendorPayments(params?: {
  page?: number;
  limit?: number;
  bookingId?: number;
  vendorId?: number;
}) {
  return useQuery({
    queryKey: [PAYMENTS_VENDOR_KEY, params],
    queryFn: () => paymentsVendorApi.getAll(params),
  });
}

/**
 * Get vendor payment statistics
 */
export function useVendorPaymentStats() {
  return useQuery({
    queryKey: [PAYMENTS_VENDOR_KEY, 'stats'],
    queryFn: () => paymentsVendorApi.getStats(),
  });
}

/**
 * Get vendor payment by ID
 */
export function useVendorPayment(id: number) {
  return useQuery({
    queryKey: [PAYMENTS_VENDOR_KEY, id],
    queryFn: () => paymentsVendorApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Create vendor payment
 */
export function useCreateVendorPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVendorPaymentDto) => paymentsVendorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_VENDOR_KEY] });
    },
  });
}

/**
 * Update vendor payment
 */
export function useUpdateVendorPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVendorPaymentDto }) =>
      paymentsVendorApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_VENDOR_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_VENDOR_KEY] });
    },
  });
}

/**
 * Delete vendor payment
 */
export function useDeleteVendorPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => paymentsVendorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_VENDOR_KEY] });
    },
  });
}
