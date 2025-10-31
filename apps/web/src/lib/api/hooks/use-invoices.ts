import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '../endpoints/invoices';
import {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
} from '../types';

const INVOICES_KEY = 'invoices';

/**
 * Get all invoices with pagination
 */
export function useInvoices(params?: {
  page?: number;
  limit?: number;
  bookingId?: number;
}) {
  return useQuery({
    queryKey: [INVOICES_KEY, params],
    queryFn: () => invoicesApi.getAll(params),
  });
}

/**
 * Get invoice statistics
 */
export function useInvoiceStats() {
  return useQuery({
    queryKey: [INVOICES_KEY, 'stats'],
    queryFn: () => invoicesApi.getStats(),
  });
}

/**
 * Get invoice by ID
 */
export function useInvoice(id: number) {
  return useQuery({
    queryKey: [INVOICES_KEY, id],
    queryFn: () => invoicesApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Create invoice
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceDto) => invoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
    },
  });
}

/**
 * Update invoice
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInvoiceDto }) =>
      invoicesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
    },
  });
}

/**
 * Delete invoice
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => invoicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
    },
  });
}

/**
 * Download invoice PDF
 */
export function useDownloadInvoicePDF() {
  return useMutation({
    mutationFn: async (id: number) => {
      const blob = await invoicesApi.downloadPDF(id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}
