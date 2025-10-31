import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  partiesApi,
  contactsApi,
  type Party,
  type CreatePartyDto,
  type UpdatePartyDto,
  type Contact,
  type CreateContactDto,
  type UpdateContactDto,
} from '../endpoints/parties';
import { useToast } from '@/hooks/use-toast';

// Parties Hooks
export function useParties(params?: { search?: string; includeInactive?: boolean }) {
  return useQuery({
    queryKey: ['parties', params],
    queryFn: () => partiesApi.getAll(params),
  });
}

export function useParty(id: number) {
  return useQuery({
    queryKey: ['parties', id],
    queryFn: () => partiesApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateParty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePartyDto) => partiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast({
        title: 'Success',
        description: 'Party created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create party',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateParty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePartyDto }) =>
      partiesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      queryClient.invalidateQueries({ queryKey: ['parties', variables.id] });
      toast({
        title: 'Success',
        description: 'Party updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update party',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteParty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => partiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      toast({
        title: 'Success',
        description: 'Party deactivated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deactivate party',
        variant: 'destructive',
      });
    },
  });
}

// Contacts Hooks
export function useContacts(partyId: number) {
  return useQuery({
    queryKey: ['contacts', partyId],
    queryFn: () => contactsApi.getAll(partyId),
    enabled: !!partyId,
  });
}

export function useContact(id: number) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateContactDto) => contactsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.partyId] });
      toast({
        title: 'Success',
        description: 'Contact created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create contact',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateContactDto }) =>
      contactsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.id] });
      toast({
        title: 'Success',
        description: 'Contact updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update contact',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete contact',
        variant: 'destructive',
      });
    },
  });
}
