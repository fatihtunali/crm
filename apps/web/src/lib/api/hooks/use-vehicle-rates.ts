import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  vehicleRatesApi,
  type VehicleRate,
  type CreateVehicleRateDto,
  type UpdateVehicleRateDto,
} from '../endpoints/suppliers';
import { useToast } from '@/hooks/use-toast';

export function useVehicleRates(params?: {
  serviceOfferingId?: number;
  seasonFrom?: string;
  seasonTo?: string;
}) {
  return useQuery({
    queryKey: ['vehicle-rates', params],
    queryFn: () => vehicleRatesApi.getAll(params),
    enabled: !!params?.serviceOfferingId,
  });
}

export function useVehicleRate(id: number) {
  return useQuery({
    queryKey: ['vehicle-rates', id],
    queryFn: () => vehicleRatesApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateVehicleRate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateVehicleRateDto) => vehicleRatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-rates'] });
      toast({
        title: 'Success',
        description: 'Vehicle rate created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create vehicle rate',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateVehicleRate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVehicleRateDto }) =>
      vehicleRatesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-rates'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-rates', variables.id] });
      toast({
        title: 'Success',
        description: 'Vehicle rate updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update vehicle rate',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteVehicleRate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => vehicleRatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-rates'] });
      toast({
        title: 'Success',
        description: 'Vehicle rate deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete vehicle rate',
        variant: 'destructive',
      });
    },
  });
}
