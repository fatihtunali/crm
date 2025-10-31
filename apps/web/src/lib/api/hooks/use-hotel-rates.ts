import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  hotelRoomRatesApi,
  type HotelRoomRate,
  type CreateHotelRoomRateDto,
  type UpdateHotelRoomRateDto,
} from '../endpoints/suppliers';
import { useToast } from '@/hooks/use-toast';

export function useHotelRoomRates(params?: {
  serviceOfferingId?: number;
  seasonFrom?: string;
  seasonTo?: string;
}) {
  return useQuery({
    queryKey: ['hotel-room-rates', params],
    queryFn: () => hotelRoomRatesApi.getAll(params),
    enabled: !!params?.serviceOfferingId,
  });
}

export function useHotelRoomRate(id: number) {
  return useQuery({
    queryKey: ['hotel-room-rates', id],
    queryFn: () => hotelRoomRatesApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateHotelRoomRate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateHotelRoomRateDto) => hotelRoomRatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-room-rates'] });
      toast({
        title: 'Success',
        description: 'Hotel room rate created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create hotel room rate',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateHotelRoomRate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHotelRoomRateDto }) =>
      hotelRoomRatesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hotel-room-rates'] });
      queryClient.invalidateQueries({ queryKey: ['hotel-room-rates', variables.id] });
      toast({
        title: 'Success',
        description: 'Hotel room rate updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update hotel room rate',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteHotelRoomRate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => hotelRoomRatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-room-rates'] });
      toast({
        title: 'Success',
        description: 'Hotel room rate deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete hotel room rate',
        variant: 'destructive',
      });
    },
  });
}
