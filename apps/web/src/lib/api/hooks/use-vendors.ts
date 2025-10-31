import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorsApi } from '../endpoints/vendors';
import {
  Vendor,
  CreateVendorDto,
  UpdateVendorDto,
  VendorType,
  QueryParams,
} from '../types';

const VENDORS_KEY = 'vendors';

// Get all vendors with pagination
export function useVendors(params?: QueryParams & { type?: VendorType }) {
  return useQuery({
    queryKey: [VENDORS_KEY, params],
    queryFn: () => vendorsApi.getAll(params),
  });
}

// Get vendor by ID
export function useVendor(id: number) {
  return useQuery({
    queryKey: [VENDORS_KEY, id],
    queryFn: () => vendorsApi.getById(id),
    enabled: !!id,
  });
}

// Search vendors
export function useVendorSearch(query: string) {
  return useQuery({
    queryKey: [VENDORS_KEY, 'search', query],
    queryFn: () => vendorsApi.search(query),
    enabled: query.length > 0,
  });
}

// Create vendor
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVendorDto) => vendorsApi.create(data),
    onSuccess: () => {
      // Invalidate vendors list
      queryClient.invalidateQueries({ queryKey: [VENDORS_KEY] });
    },
  });
}

// Update vendor
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVendorDto }) =>
      vendorsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific vendor and lists
      queryClient.invalidateQueries({ queryKey: [VENDORS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [VENDORS_KEY] });
    },
  });
}

// Delete vendor
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vendorsApi.delete(id),
    onSuccess: () => {
      // Invalidate all vendors queries
      queryClient.invalidateQueries({ queryKey: [VENDORS_KEY] });
    },
  });
}
