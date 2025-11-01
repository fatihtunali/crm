import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  transferRatesApi,
  type CreateTransferRateDto,
  type UpdateTransferRateDto,
} from '../endpoints/suppliers';
import { useToast } from '@/hooks/use-toast';

export function useTransferRates(params?: {
  serviceOfferingId?: number;
  seasonFrom?: string;
  seasonTo?: string;
}) {
  return useQuery({
    queryKey: ['transfer-rates', params],
    queryFn: () => transferRatesApi.getAll(params),
    enabled: !!params?.serviceOfferingId,
  });
}

export function useTransferRate(id: number) {
  return useQuery({
    queryKey: ['transfer-rates', id],
    queryFn: () => transferRatesApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateTransferRate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateTransferRateDto) => transferRatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-rates'] });
      toast({
        title: 'Success',
        description: 'Transfer rate created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create transfer rate',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTransferRate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTransferRateDto }) =>
      transferRatesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transfer-rates'] });
      queryClient.invalidateQueries({ queryKey: ['transfer-rates', variables.id] });
      toast({
        title: 'Success',
        description: 'Transfer rate updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update transfer rate',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTransferRate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => transferRatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-rates'] });
      toast({
        title: 'Success',
        description: 'Transfer rate deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete transfer rate',
        variant: 'destructive',
      });
    },
  });
}
