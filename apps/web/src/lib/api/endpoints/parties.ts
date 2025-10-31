import { api } from '../client';

export interface Contact {
  id: number;
  partyId: number;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Party {
  id: number;
  tenantId: number;
  name: string;
  taxId?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  contacts?: Contact[];
}

export interface CreatePartyDto {
  name: string;
  taxId?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdatePartyDto {
  name?: string;
  taxId?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CreateContactDto {
  partyId: number;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface UpdateContactDto {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

// Parties API
export const partiesApi = {
  getAll: (params?: { search?: string; includeInactive?: boolean }) =>
    api.get<Party[]>('/parties', { params }),

  getOne: (id: number) =>
    api.get<Party>(`/parties/${id}`),

  create: (data: CreatePartyDto) =>
    api.post<Party>('/parties', data),

  update: (id: number, data: UpdatePartyDto) =>
    api.patch<Party>(`/parties/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/parties/${id}`),
};

// Contacts API
export const contactsApi = {
  getAll: (partyId: number) =>
    api.get<Contact[]>(`/contacts?partyId=${partyId}`),

  getOne: (id: number) =>
    api.get<Contact>(`/contacts/${id}`),

  create: (data: CreateContactDto) =>
    api.post<Contact>('/contacts', data),

  update: (id: number, data: UpdateContactDto) =>
    api.patch<Contact>(`/contacts/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/contacts/${id}`),
};
