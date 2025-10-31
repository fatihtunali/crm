import { UserRole, LeadStatus, QuotationStatus, BookingStatus, VendorType, ItemType, PaymentStatus, Currency, PaymentMethod } from './enums';
export interface BaseEntity {
    id: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface TenantScoped {
    tenantId: number;
}
export interface Tenant extends BaseEntity {
    name: string;
    code: string;
    brandingLogoUrl?: string;
    defaultCurrency: Currency;
    taxId?: string;
    address?: string;
    phone?: string;
    email?: string;
    isActive: boolean;
}
export interface User extends BaseEntity, TenantScoped {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
}
export interface Client extends BaseEntity, TenantScoped {
    name: string;
    email?: string;
    phone?: string;
    nationality?: string;
    preferredLanguage: string;
    passportNumber?: string;
    dateOfBirth?: Date;
    notes?: string;
    tags?: string[];
    isActive: boolean;
}
export interface Lead extends BaseEntity, TenantScoped {
    clientId?: number;
    source?: string;
    inquiryDate: Date;
    destination?: string;
    paxAdults: number;
    paxChildren: number;
    budgetEur?: number;
    status: LeadStatus;
    notes?: string;
}
export interface Tour extends BaseEntity, TenantScoped {
    code: string;
    name: string;
    description?: string;
    baseCapacity: number;
    seasonStart?: Date;
    seasonEnd?: Date;
    defaultMarkupPct: number;
    isActive: boolean;
}
export interface Itinerary extends BaseEntity, TenantScoped {
    tourId: number;
    dayNumber: number;
    title: string;
    description?: string;
    transport?: string;
    accommodation?: string;
    meals?: string;
}
export interface Vendor extends BaseEntity, TenantScoped {
    name: string;
    type: VendorType;
    contactName?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    address?: string;
    notes?: string;
    isActive: boolean;
}
export interface VendorRate extends BaseEntity, TenantScoped {
    vendorId: number;
    seasonFrom: Date;
    seasonTo: Date;
    serviceType: string;
    costTry: number;
    notes?: string;
}
export interface ExchangeRate extends BaseEntity, TenantScoped {
    fromCurrency: Currency;
    toCurrency: Currency;
    rate: number;
    rateDate: Date;
    source: string;
}
export interface Quotation extends BaseEntity, TenantScoped {
    leadId?: number;
    tourId?: number;
    customJson?: any;
    calcCostTry: number;
    sellPriceEur: number;
    exchangeRateUsed: number;
    validUntil?: Date;
    status: QuotationStatus;
    notes?: string;
}
export interface Booking extends BaseEntity, TenantScoped {
    quotationId?: number;
    clientId: number;
    bookingCode: string;
    startDate: Date;
    endDate: Date;
    lockedExchangeRate: number;
    totalCostTry: number;
    totalSellEur: number;
    depositDueEur: number;
    balanceDueEur: number;
    status: BookingStatus;
    notes?: string;
}
export interface BookingItem extends BaseEntity, TenantScoped {
    bookingId: number;
    itemType: ItemType;
    vendorId?: number;
    qty: number;
    unitCostTry: number;
    unitPriceEur: number;
    notes?: string;
}
export interface PaymentClient extends BaseEntity, TenantScoped {
    bookingId: number;
    amountEur: number;
    method: PaymentMethod;
    paidAt: Date;
    txnRef?: string;
    status: PaymentStatus;
    notes?: string;
}
export interface PaymentVendor extends BaseEntity, TenantScoped {
    bookingId: number;
    vendorId: number;
    amountTry: number;
    dueAt: Date;
    paidAt?: Date;
    status: PaymentStatus;
    notes?: string;
}
export interface Invoice extends BaseEntity, TenantScoped {
    bookingId: number;
    number: string;
    issueDate: Date;
    currency: Currency;
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
    vatRate: number;
    pdfUrl?: string;
}
export interface AuditLog {
    id: number;
    tenantId: number;
    userId?: number;
    entity: string;
    entityId: number;
    action: string;
    diffJson?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
