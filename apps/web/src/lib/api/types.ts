// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    tenantId: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  sub: number;
  email: string;
  tenant_id: number;
  roles: string[];
  iat: number;
  exp: number;
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'AGENT' | 'OPERATIONS' | 'ACCOUNTING' | 'GUIDE' | 'VENDOR';
  tenant_id: number;
  phone?: string;
  preferred_language: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// Lead Types
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'WON' | 'LOST';

export interface Lead {
  id: number;
  clientId?: number;
  client?: Client;
  source?: string;
  inquiryDate: string;
  destination?: string;
  paxAdults: number;
  paxChildren: number;
  budgetEur?: number;
  status: LeadStatus;
  notes?: string;
  tenantId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  clientId?: number;
  source?: string;
  inquiryDate: string;
  destination?: string;
  paxAdults?: number;
  paxChildren?: number;
  budgetEur?: number;
  status?: LeadStatus;
  notes?: string;
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {}

export interface LeadStats {
  status: LeadStatus;
  count: number;
}

// Client Types
export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  nationality?: string;
  preferredLanguage?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  notes?: string;
  tenantId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  email?: string;
  phone?: string;
  nationality?: string;
  preferredLanguage?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  notes?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
  isActive?: boolean;
}

// Vendor Types
export type VendorType = 'HOTEL' | 'TRANSPORT' | 'GUIDE' | 'ACTIVITY';

export interface Vendor {
  id: number;
  name: string;
  type: VendorType;
  contactName?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  address?: string;
  notes?: string;
  tenantId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorDto {
  name: string;
  type: VendorType;
  contactName?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}

// Tour Types
export interface Itinerary {
  id: number;
  tenantId: number;
  tourId: number;
  dayNumber: number;
  title: string;
  description?: string;
  transport?: string;
  accommodation?: string;
  meals?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tour {
  id: number;
  tenantId: number;
  code: string;
  name: string;
  description?: string;
  baseCapacity: number;
  seasonStart?: string;
  seasonEnd?: string;
  defaultMarkupPct: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  itineraries?: Itinerary[];
}

export interface CreateItineraryDto {
  dayNumber: number;
  title: string;
  description?: string;
  transport?: string;
  accommodation?: string;
  meals?: string;
}

export interface CreateTourDto {
  code: string;
  name: string;
  description?: string;
  baseCapacity: number;
  seasonStart?: string;
  seasonEnd?: string;
  defaultMarkupPct?: number;
  isActive?: boolean;
  itineraries?: CreateItineraryDto[];
}

export interface UpdateTourDto extends Partial<Omit<CreateTourDto, 'itineraries'>> {
  isActive?: boolean;
}

// Quotation Types
export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Quotation {
  id: number;
  tenantId: number;
  leadId?: number;
  lead?: Lead;
  tourId?: number;
  tour?: Tour;
  customJson?: any;
  calcCostTry: number;
  sellPriceEur: number;
  exchangeRateUsed: number;
  validUntil?: string;
  status: QuotationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuotationDto {
  leadId?: number;
  tourId?: number;
  customJson?: any;
  calcCostTry?: number;
  sellPriceEur?: number;
  exchangeRateUsed: number;
  validUntil?: string;
  status?: QuotationStatus;
  notes?: string;
}

export interface UpdateQuotationDto extends Partial<CreateQuotationDto> {}

export interface QuotationStats {
  status: QuotationStatus;
  count: number;
}

export interface SearchQuotationParams extends QueryParams {
  clientName?: string;
  tourName?: string;
  status?: QuotationStatus;
  createdFrom?: string;
  createdTo?: string;
  validUntil?: string;
}

// Booking Types
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type ItemType = 'HOTEL' | 'TRANSPORT' | 'GUIDE' | 'ACTIVITY' | 'FEE' | 'OTHER';

export interface BookingItem {
  id: number;
  tenantId: number;
  bookingId: number;
  itemType: ItemType;
  vendorId?: number;
  vendor?: Vendor;
  qty: number;
  unitCostTry: number;
  unitPriceEur: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  tenantId: number;
  quotationId?: number;
  quotation?: Quotation;
  clientId: number;
  client?: Client;
  bookingCode: string;
  startDate: string;
  endDate: string;
  lockedExchangeRate: number;
  totalCostTry: number;
  totalSellEur: number;
  depositDueEur: number;
  balanceDueEur: number;
  status: BookingStatus;
  notes?: string;
  items?: BookingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  quotationId?: number;
  clientId: number;
  bookingCode: string;
  startDate: string;
  endDate: string;
  lockedExchangeRate: number;
  totalCostTry?: number;
  totalSellEur?: number;
  depositDueEur?: number;
  balanceDueEur?: number;
  status?: BookingStatus;
  notes?: string;
}

export interface UpdateBookingDto extends Partial<CreateBookingDto> {}

export interface BookingStats {
  status: BookingStatus;
  count: number;
}

export interface SearchBookingParams extends QueryParams {
  bookingCode?: string;
  clientName?: string;
  clientEmail?: string;
  status?: BookingStatus;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface PnLResponse {
  bookingId: number;
  bookingCode: string;
  lockedExchangeRate: number;
  itemsCount: number;
  totalRevenueEur: number;
  totalCostTry: number;
  totalCostEur: number;
  profitLossEur: number;
  marginPercent: number;
}

// Payment Types
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'ONLINE' | 'OTHER';

export interface ClientPayment {
  id: number;
  tenantId: number;
  bookingId: number;
  booking?: Booking;
  amountEur: number;
  method: PaymentMethod;
  paidAt: string;
  txnRef?: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorPayment {
  id: number;
  tenantId: number;
  bookingId: number;
  booking?: Booking;
  vendorId: number;
  vendor?: Vendor;
  amountTry: number;
  dueAt: string;
  paidAt?: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientPaymentDto {
  bookingId: number;
  amountEur: number;
  method: PaymentMethod;
  paidAt: string;
  txnRef?: string;
  status?: PaymentStatus;
  notes?: string;
}

export interface UpdateClientPaymentDto extends Partial<CreateClientPaymentDto> {}

export interface CreateVendorPaymentDto {
  bookingId: number;
  vendorId: number;
  amountTry: number;
  dueAt: string;
  paidAt?: string;
  status?: PaymentStatus;
  notes?: string;
}

export interface UpdateVendorPaymentDto extends Partial<CreateVendorPaymentDto> {}

export interface PaymentClientStats {
  method: PaymentMethod;
  status: PaymentStatus;
  _sum: {
    amountEur: number;
  };
  _count: {
    id: number;
  };
}

export interface PaymentVendorStats {
  status: PaymentStatus;
  _sum: {
    amountTry: number;
  };
  _count: {
    id: number;
  };
}

// Invoice Types
export interface Invoice {
  id: number;
  bookingId: number;
  booking?: Booking;
  number: string;
  issueDate: string;
  currency: string;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  vatRate: number;
  pdfUrl?: string;
  tenantId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDto {
  bookingId: number;
  number: string;
  issueDate: string;
  currency?: string;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  vatRate?: number;
  pdfUrl?: string;
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> {}

export interface InvoiceStats {
  currency: string;
  _sum: {
    grossAmount: number;
  };
  _count: {
    id: number;
  };
}

// File Types
export type FileCategory = 'CONTRACT' | 'INVOICE' | 'RECEIPT' | 'DOCUMENT' | 'OTHER';

export interface File {
  id: number;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  category: FileCategory;
  entityType?: string;
  entityId?: number;
  storageKey: string;
  tenantId: number;
  uploadedBy: number;
  uploader?: User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RequestUploadUrlDto {
  fileName: string;
  mimeType: string;
  fileSize: number;
  entity?: string;
  entityId?: number;
}

export interface UploadUrlResponse {
  fileId: number;
  uploadUrl: string;
  storageKey: string;
  expiresIn: number;
}

export interface DownloadUrlResponse {
  fileId: number;
  fileName: string;
  downloadUrl: string;
  expiresIn: number;
}

// Webhook Types
export type WebhookEventStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'RETRY';
export type WebhookEventType =
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_PENDING'
  | 'REFUND_PROCESSED'
  | 'REFUND_FAILED';

export interface WebhookEvent {
  id: number;
  tenantId: number;
  provider: string;
  eventType: WebhookEventType;
  status: WebhookEventStatus;
  payloadJson: any;
  signatureHeader?: string;
  isVerified: boolean;
  processedAt?: string;
  errorMessage?: string;
  retryCount: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookFilter {
  page?: number;
  limit?: number;
  provider?: string;
  eventType?: WebhookEventType;
  status?: WebhookEventStatus;
  dateFrom?: string;
  dateTo?: string;
  isVerified?: boolean;
}

export interface WebhookStatusStat {
  status: WebhookEventStatus;
  _count: {
    id: number;
  };
}

export interface WebhookProviderStat {
  provider: string;
  _count: {
    id: number;
  };
}

export interface WebhookStats {
  statusStats: WebhookStatusStat[];
  providerStats: WebhookProviderStat[];
  recentActivity24h: number;
}

// Audit Log Types
export interface AuditLog {
  id: number;
  user_id: number;
  user?: User;
  action: string;
  entity_type: string;
  entity_id: number;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  tenant_id: number;
  created_at: string;
}

// Report Types
export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
}

export interface LeadReportFilter extends ReportFilter {
  status?: LeadStatus;
}

export interface PnLReport {
  period: {
    from: string;
    to: string;
  };
  revenue: {
    totalEur: number;
    transactionCount: number;
  };
  costs: {
    totalTry: number;
    totalEur: number;
    transactionCount: number;
    exchangeRateUsed: number;
  };
  profit: {
    netProfitEur: number;
    profitMarginPct: number;
  };
}

export interface RevenueReport {
  period: {
    from: string;
    to: string;
  };
  summary: {
    totalBookingsValue: number;
    totalReceivedEur: number;
    totalBookingsCount: number;
  };
  byPaymentStatus: Array<{
    status: PaymentStatus;
    amountEur: number;
    count: number;
  }>;
  byBookingStatus: Array<{
    status: BookingStatus;
    valueEur: number;
    count: number;
  }>;
}

export interface LeadsReport {
  period: {
    from: string;
    to: string;
  };
  summary: {
    totalLeads: number;
    wonLeads: number;
    lostLeads: number;
    conversionRate: number;
    averageBudgetEur: number;
    leadsWithQuotations: number;
  };
  byStatus: Array<{
    status: LeadStatus;
    count: number;
    percentage: number;
  }>;
  bySource: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
}

// Common Query Params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  is_active?: boolean;
  include?: string; // 'inactive' to include soft-deleted
}

export type QueryParams = PaginationParams & FilterParams;
