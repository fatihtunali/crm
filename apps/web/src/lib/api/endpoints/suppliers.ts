import { api } from '../client';

export enum SupplierType {
  HOTEL = 'HOTEL',
  TRANSPORT = 'TRANSPORT',
  ACTIVITY_OPERATOR = 'ACTIVITY_OPERATOR',
  GUIDE_AGENCY = 'GUIDE_AGENCY',
  OTHER = 'OTHER',
}

export enum ServiceType {
  HOTEL_ROOM = 'HOTEL_ROOM',
  TRANSFER = 'TRANSFER',
  VEHICLE_HIRE = 'VEHICLE_HIRE',
  GUIDE_SERVICE = 'GUIDE_SERVICE',
  ACTIVITY = 'ACTIVITY',
}

export enum PricingModel {
  PER_ROOM_NIGHT = 'PER_ROOM_NIGHT',
  PER_PERSON_NIGHT = 'PER_PERSON_NIGHT',
  PER_TRANSFER = 'PER_TRANSFER',
  PER_KM = 'PER_KM',
  PER_HOUR = 'PER_HOUR',
  PER_DAY = 'PER_DAY',
  PER_HALF_DAY = 'PER_HALF_DAY',
  PER_PERSON = 'PER_PERSON',
  PER_GROUP = 'PER_GROUP',
}

export enum BoardType {
  RO = 'RO', // Room Only
  BB = 'BB', // Bed & Breakfast
  HB = 'HB', // Half Board
  FB = 'FB', // Full Board
  AI = 'AI', // All Inclusive
}

export interface Party {
  id: number;
  name: string;
  taxId?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: number;
  tenantId: number;
  partyId: number;
  party?: Party;
  type: SupplierType;
  bankName?: string;
  bankAccountNo?: string;
  bankIban?: string;
  bankSwift?: string;
  paymentTerms?: string;
  defaultCurrency: string;
  creditLimit?: number;
  commissionPct: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  partyId: number;
  type: SupplierType;
  bankName?: string;
  bankAccountNo?: string;
  bankIban?: string;
  bankSwift?: string;
  paymentTerms?: string;
  defaultCurrency?: string;
  creditLimit?: number;
  commissionPct?: number;
  isActive?: boolean;
}

export interface UpdateSupplierDto {
  type?: SupplierType;
  bankName?: string;
  bankAccountNo?: string;
  bankIban?: string;
  bankSwift?: string;
  paymentTerms?: string;
  defaultCurrency?: string;
  creditLimit?: number;
  commissionPct?: number;
  isActive?: boolean;
}

export interface ServiceOffering {
  id: number;
  tenantId: number;
  supplierId: number;
  supplier?: Supplier;
  serviceType: ServiceType;
  title: string;
  location?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Type-specific relations loaded optionally
  hotelRoom?: HotelRoomRate;
  transfer?: TransferRate;
  vehicle?: VehicleRate;
  guide?: GuideServiceRate;
  activity?: ActivityRate;
}

// Type definitions for service-specific rates
export interface GuideServiceRate {
  id: number;
  tenantId: number;
  serviceOfferingId: number;
  pricingModel: PricingModel;
  costTry: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityRate {
  id: number;
  tenantId: number;
  serviceOfferingId: number;
  pricingModel: PricingModel;
  costTry: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceOfferingDto {
  supplierId: number;
  serviceType: ServiceType;
  title: string;
  location?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateServiceOfferingDto {
  title?: string;
  location?: string;
  description?: string;
  isActive?: boolean;
}

// Suppliers API
export const suppliersApi = {
  getAll: async (params?: { type?: SupplierType; includeInactive?: boolean }) => {
    const response = await api.get<Supplier[]>('/suppliers', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data: CreateSupplierDto) => {
    const response = await api.post<Supplier>('/suppliers', data);
    return response.data;
  },

  update: async (id: number, data: UpdateSupplierDto) => {
    const response = await api.patch<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<{ message: string }>(`/suppliers/${id}`);
    return response.data;
  },

  // Hotel Management
  getAllHotels: async (includeInactive: boolean = false) => {
    const response = await api.get<any[]>('/suppliers/hotels', { params: { includeInactive } });
    return response.data;
  },

  getHotel: async (id: number) => {
    const response = await api.get<any>(`/suppliers/hotels/${id}`);
    return response.data;
  },

  createHotel: async (data: any) => {
    const response = await api.post<any>('/suppliers/hotels', data);
    return response.data;
  },

  updateHotel: async (id: number, data: any) => {
    const response = await api.patch<any>(`/suppliers/hotels/${id}`, data);
    return response.data;
  },

  deleteHotel: async (id: number) => {
    const response = await api.delete<any>(`/suppliers/hotels/${id}`);
    return response.data;
  },

  // Hotel Pricing Management
  getAllHotelPricing: async (hotelId: number) => {
    const response = await api.get<any[]>(`/suppliers/hotels/${hotelId}/pricing`);
    return response.data;
  },

  getHotelPricing: async (hotelId: number, id: number) => {
    const response = await api.get<any>(`/suppliers/hotels/${hotelId}/pricing/${id}`);
    return response.data;
  },

  createHotelPricing: async (hotelId: number, data: any) => {
    const response = await api.post<any>(`/suppliers/hotels/${hotelId}/pricing`, data);
    return response.data;
  },

  updateHotelPricing: async (hotelId: number, id: number, data: any) => {
    const response = await api.patch<any>(`/suppliers/hotels/${hotelId}/pricing/${id}`, data);
    return response.data;
  },

  deleteHotelPricing: async (hotelId: number, id: number) => {
    const response = await api.delete<any>(`/suppliers/hotels/${hotelId}/pricing/${id}`);
    return response.data;
  },

  // Transfer (Intercity Transfer) Management
  getAllTransfers: async (includeInactive: boolean = false) => {
    const response = await api.get<any[]>('/suppliers/intercity-transfers', { params: { includeInactive } });
    return response.data;
  },

  getTransfer: async (id: number) => {
    const response = await api.get<any>(`/suppliers/intercity-transfers/${id}`);
    return response.data;
  },

  createTransfer: async (data: any) => {
    const response = await api.post<any>('/suppliers/intercity-transfers', data);
    return response.data;
  },

  updateTransfer: async (id: number, data: any) => {
    const response = await api.patch<any>(`/suppliers/intercity-transfers/${id}`, data);
    return response.data;
  },

  deleteTransfer: async (id: number) => {
    const response = await api.delete<any>(`/suppliers/intercity-transfers/${id}`);
    return response.data;
  },

  // Transfer Pricing Management
  getAllTransferPricing: async (transferId: number) => {
    const response = await api.get<any[]>(`/suppliers/intercity-transfers/${transferId}/pricing`);
    return response.data;
  },

  getTransferPricing: async (transferId: number, id: number) => {
    const response = await api.get<any>(`/suppliers/intercity-transfers/${transferId}/pricing/${id}`);
    return response.data;
  },

  createTransferPricing: async (transferId: number, data: any) => {
    const response = await api.post<any>(`/suppliers/intercity-transfers/${transferId}/pricing`, data);
    return response.data;
  },

  updateTransferPricing: async (transferId: number, id: number, data: any) => {
    const response = await api.patch<any>(`/suppliers/intercity-transfers/${transferId}/pricing/${id}`, data);
    return response.data;
  },

  deleteTransferPricing: async (transferId: number, id: number) => {
    const response = await api.delete<any>(`/suppliers/intercity-transfers/${transferId}/pricing/${id}`);
    return response.data;
  },

  // Tour Management
  getAllTours: async (includeInactive: boolean = false) => {
    const response = await api.get<any[]>('/suppliers/tours', { params: { includeInactive } });
    return response.data;
  },

  getTour: async (id: number) => {
    const response = await api.get<any>(`/suppliers/tours/${id}`);
    return response.data;
  },

  createTour: async (data: any) => {
    const response = await api.post<any>('/suppliers/tours', data);
    return response.data;
  },

  updateTour: async (id: number, data: any) => {
    const response = await api.patch<any>(`/suppliers/tours/${id}`, data);
    return response.data;
  },

  deleteTour: async (id: number) => {
    const response = await api.delete<any>(`/suppliers/tours/${id}`);
    return response.data;
  },

  // Tour Pricing Management
  getAllTourPricing: async (tourId: number) => {
    const response = await api.get<any[]>(`/suppliers/tours/${tourId}/pricing`);
    return response.data;
  },

  getTourPricing: async (tourId: number, id: number) => {
    const response = await api.get<any>(`/suppliers/tours/${tourId}/pricing/${id}`);
    return response.data;
  },

  createTourPricing: async (tourId: number, data: any) => {
    const response = await api.post<any>(`/suppliers/tours/${tourId}/pricing`, data);
    return response.data;
  },

  updateTourPricing: async (tourId: number, id: number, data: any) => {
    const response = await api.patch<any>(`/suppliers/tours/${tourId}/pricing/${id}`, data);
    return response.data;
  },

  deleteTourPricing: async (tourId: number, id: number) => {
    const response = await api.delete<any>(`/suppliers/tours/${tourId}/pricing/${id}`);
    return response.data;
  },

  // Restaurant Management
  getAllRestaurants: async (includeInactive: boolean = false) => {
    const response = await api.get<any[]>('/suppliers/restaurants', { params: { includeInactive } });
    return response.data;
  },

  getRestaurant: async (id: number) => {
    const response = await api.get<any>(`/suppliers/restaurants/${id}`);
    return response.data;
  },

  createRestaurant: async (data: any) => {
    const response = await api.post<any>('/suppliers/restaurants', data);
    return response.data;
  },

  updateRestaurant: async (id: number, data: any) => {
    const response = await api.patch<any>(`/suppliers/restaurants/${id}`, data);
    return response.data;
  },

  deleteRestaurant: async (id: number) => {
    const response = await api.delete<any>(`/suppliers/restaurants/${id}`);
    return response.data;
  },

  // Restaurant Menu Management
  getAllRestaurantMenus: async (restaurantId: number) => {
    const response = await api.get<any[]>(`/suppliers/restaurants/${restaurantId}/menus`);
    return response.data;
  },

  getRestaurantMenu: async (restaurantId: number, id: number) => {
    const response = await api.get<any>(`/suppliers/restaurants/${restaurantId}/menus/${id}`);
    return response.data;
  },

  createRestaurantMenu: async (restaurantId: number, data: any) => {
    const response = await api.post<any>(`/suppliers/restaurants/${restaurantId}/menus`, data);
    return response.data;
  },

  updateRestaurantMenu: async (restaurantId: number, id: number, data: any) => {
    const response = await api.patch<any>(`/suppliers/restaurants/${restaurantId}/menus/${id}`, data);
    return response.data;
  },

  deleteRestaurantMenu: async (restaurantId: number, id: number) => {
    const response = await api.delete<any>(`/suppliers/restaurants/${restaurantId}/menus/${id}`);
    return response.data;
  },
};

// Service Offerings API
export const serviceOfferingsApi = {
  getAll: (params?: { serviceType?: ServiceType; supplierId?: number; includeInactive?: boolean }) =>
    api.get<ServiceOffering[]>('/service-offerings', { params }),

  getOne: (id: number) =>
    api.get<ServiceOffering>(`/service-offerings/${id}`),

  create: (data: CreateServiceOfferingDto) =>
    api.post<ServiceOffering>('/service-offerings', data),

  update: (id: number, data: UpdateServiceOfferingDto) =>
    api.patch<ServiceOffering>(`/service-offerings/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/service-offerings/${id}`),
};

// Hotel Room Rate Types
export interface HotelRoomRate {
  id: number;
  tenantId: number;
  serviceOfferingId: number;
  seasonFrom: string;
  seasonTo: string;
  boardType: BoardType;
  // Pricing structure
  pricePerPersonDouble: number; // Base price per person in double room
  singleSupplement: number; // Extra charge for single occupancy
  pricePerPersonTriple: number; // Price per person in triple room
  // Child pricing slabs (per night)
  childPrice0to2: number; // 00-02.99 years
  childPrice3to5: number; // 03-05.99 years
  childPrice6to11: number; // 06-11.99 years
  // Additional fields
  allotment?: number;
  releaseDays?: number;
  minStay?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHotelRoomRateDto {
  serviceOfferingId: number;
  seasonFrom: string;
  seasonTo: string;
  boardType: BoardType;
  // Pricing structure
  pricePerPersonDouble: number;
  singleSupplement: number;
  pricePerPersonTriple: number;
  // Child pricing slabs
  childPrice0to2: number;
  childPrice3to5: number;
  childPrice6to11: number;
  // Additional fields
  allotment?: number;
  releaseDays?: number;
  minStay?: number;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateHotelRoomRateDto {
  seasonFrom?: string;
  seasonTo?: string;
  boardType?: BoardType;
  // Pricing structure
  pricePerPersonDouble?: number;
  singleSupplement?: number;
  pricePerPersonTriple?: number;
  // Child pricing slabs
  childPrice0to2?: number;
  childPrice3to5?: number;
  childPrice6to11?: number;
  // Additional fields
  allotment?: number;
  releaseDays?: number;
  minStay?: number;
  notes?: string;
  isActive?: boolean;
}

// Hotel Room Rates API
export const hotelRoomRatesApi = {
  getAll: (params?: { serviceOfferingId?: number; seasonFrom?: string; seasonTo?: string }) =>
    api.get<HotelRoomRate[]>('/hotels/rates', { params }),

  getOne: (id: number) =>
    api.get<HotelRoomRate>(`/hotels/rates/${id}`),

  create: (data: CreateHotelRoomRateDto) =>
    api.post<HotelRoomRate>('/hotels/rates', data),

  update: (id: number, data: UpdateHotelRoomRateDto) =>
    api.patch<HotelRoomRate>(`/hotels/rates/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/hotels/rates/${id}`),
};

// Transfer Rate Types
export interface TransferRate {
  id: number;
  tenantId: number;
  serviceOfferingId: number;
  seasonFrom: string;
  seasonTo: string;
  pricingModel: PricingModel;
  baseCostTry: number;
  includedKm?: number;
  includedHours?: number;
  extraKmTry?: number;
  extraHourTry?: number;
  nightSurchargePct?: number;
  holidaySurchargePct?: number;
  waitingTimeFree?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransferRateDto {
  serviceOfferingId: number;
  seasonFrom: string;
  seasonTo: string;
  pricingModel: PricingModel;
  baseCostTry: number;
  includedKm?: number;
  includedHours?: number;
  extraKmTry?: number;
  extraHourTry?: number;
  nightSurchargePct?: number;
  holidaySurchargePct?: number;
  waitingTimeFree?: number;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateTransferRateDto {
  seasonFrom?: string;
  seasonTo?: string;
  pricingModel?: PricingModel;
  baseCostTry?: number;
  includedKm?: number;
  includedHours?: number;
  extraKmTry?: number;
  extraHourTry?: number;
  nightSurchargePct?: number;
  holidaySurchargePct?: number;
  waitingTimeFree?: number;
  notes?: string;
  isActive?: boolean;
}

// Transfer Rates API
export const transferRatesApi = {
  getAll: async (params?: { serviceOfferingId?: number; seasonFrom?: string; seasonTo?: string }) => {
    const response = await api.get<TransferRate[]>('/transfers/rates', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get<TransferRate>(`/transfers/rates/${id}`);
    return response.data;
  },

  create: async (data: CreateTransferRateDto) => {
    const response = await api.post<TransferRate>('/transfers/rates', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTransferRateDto) => {
    const response = await api.patch<TransferRate>(`/transfers/rates/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<{ message: string }>(`/transfers/rates/${id}`);
    return response.data;
  },
};

// Vehicle Hire Rate Types
export interface VehicleRate {
  id: number;
  tenantId: number;
  serviceOfferingId: number;
  seasonFrom: string;
  seasonTo: string;
  pricingModel: PricingModel;
  costTry: number;
  includedKmPerDay?: number;
  extraKmChargeTry?: number;
  driverFeePerDayTry?: number;
  oneWayFeeTry?: number;
  depositTry?: number;
  insurancePerDayTry?: number;
  minRentalDays?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleRateDto {
  serviceOfferingId: number;
  seasonFrom: string;
  seasonTo: string;
  pricingModel: PricingModel;
  costTry: number;
  includedKmPerDay?: number;
  extraKmChargeTry?: number;
  driverFeePerDayTry?: number;
  oneWayFeeTry?: number;
  depositTry?: number;
  insurancePerDayTry?: number;
  minRentalDays?: number;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateVehicleRateDto {
  seasonFrom?: string;
  seasonTo?: string;
  pricingModel?: PricingModel;
  costTry?: number;
  includedKmPerDay?: number;
  extraKmChargeTry?: number;
  driverFeePerDayTry?: number;
  oneWayFeeTry?: number;
  depositTry?: number;
  insurancePerDayTry?: number;
  minRentalDays?: number;
  notes?: string;
  isActive?: boolean;
}

// Vehicle Rates API
export const vehicleRatesApi = {
  getAll: (params?: { serviceOfferingId?: number; seasonFrom?: string; seasonTo?: string }) =>
    api.get<VehicleRate[]>('/vehicles/rates', { params }),

  getOne: (id: number) =>
    api.get<VehicleRate>(`/vehicles/rates/${id}`),

  create: (data: CreateVehicleRateDto) =>
    api.post<VehicleRate>('/vehicles/rates', data),

  update: (id: number, data: UpdateVehicleRateDto) =>
    api.patch<VehicleRate>(`/vehicles/rates/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/vehicles/rates/${id}`),
};
