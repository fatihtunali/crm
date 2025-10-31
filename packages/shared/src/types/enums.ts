// User Roles
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  OPERATIONS = 'OPERATIONS',
  ACCOUNTING = 'ACCOUNTING',
  GUIDE = 'GUIDE',
  VENDOR = 'VENDOR',
}

// Lead Status
export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUOTED = 'QUOTED',
  WON = 'WON',
  LOST = 'LOST',
}

// Quotation Status
export enum QuotationStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

// Booking Status
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

// Vendor Type
export enum VendorType {
  HOTEL = 'HOTEL',
  TRANSPORT = 'TRANSPORT',
  GUIDE = 'GUIDE',
  ACTIVITY = 'ACTIVITY',
}

// Booking Item Type
export enum ItemType {
  HOTEL = 'HOTEL',
  TRANSFER = 'TRANSFER',
  GUIDE = 'GUIDE',
  ACTIVITY = 'ACTIVITY',
  FEE = 'FEE',
  DISCOUNT = 'DISCOUNT',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Currency
export enum Currency {
  EUR = 'EUR',
  TRY = 'TRY',
  USD = 'USD',
}

// Payment Method
export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  ONLINE = 'ONLINE',
  OTHER = 'OTHER',
}
