import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  suppliersApi,
  serviceOfferingsApi,
  type Supplier,
  type CreateSupplierDto,
  type UpdateSupplierDto,
  type ServiceOffering,
  type CreateServiceOfferingDto,
  type UpdateServiceOfferingDto,
  type SupplierType,
  type ServiceType,
} from '../endpoints/suppliers';
import { useToast } from '@/hooks/use-toast';

// Suppliers Hooks
export function useSuppliers(params?: { type?: SupplierType; includeInactive?: boolean }) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => suppliersApi.getAll(params),
  });
}

export function useSupplier(id: number) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => suppliersApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateSupplierDto) => suppliersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Success',
        description: 'Supplier created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create supplier',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierDto }) =>
      suppliersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', variables.id] });
      toast({
        title: 'Success',
        description: 'Supplier updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update supplier',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => suppliersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Success',
        description: 'Supplier deactivated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate supplier',
        variant: 'destructive',
      });
    },
  });
}

// Service Offerings Hooks
export function useServiceOfferings(params?: {
  serviceType?: ServiceType;
  supplierId?: number;
  includeInactive?: boolean;
}) {
  return useQuery({
    queryKey: ['service-offerings', params],
    queryFn: () => serviceOfferingsApi.getAll(params),
  });
}

export function useServiceOffering(id: number) {
  return useQuery({
    queryKey: ['service-offerings', id],
    queryFn: () => serviceOfferingsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateServiceOffering() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateServiceOfferingDto) => serviceOfferingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-offerings'] });
      toast({
        title: 'Success',
        description: 'Service offering created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create service offering',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateServiceOffering() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceOfferingDto }) =>
      serviceOfferingsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-offerings'] });
      queryClient.invalidateQueries({ queryKey: ['service-offerings', variables.id] });
      toast({
        title: 'Success',
        description: 'Service offering updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update service offering',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteServiceOffering() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => serviceOfferingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-offerings'] });
      toast({
        title: 'Success',
        description: 'Service offering deactivated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate service offering',
        variant: 'destructive',
      });
    },
  });
}
