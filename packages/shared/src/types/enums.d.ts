export declare enum UserRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    AGENT = "AGENT",
    OPERATIONS = "OPERATIONS",
    ACCOUNTING = "ACCOUNTING",
    GUIDE = "GUIDE",
    VENDOR = "VENDOR"
}
export declare enum LeadStatus {
    NEW = "NEW",
    CONTACTED = "CONTACTED",
    QUOTED = "QUOTED",
    WON = "WON",
    LOST = "LOST"
}
export declare enum QuotationStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}
export declare enum BookingStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}
export declare enum VendorType {
    HOTEL = "HOTEL",
    TRANSPORT = "TRANSPORT",
    GUIDE = "GUIDE",
    ACTIVITY = "ACTIVITY"
}
export declare enum ItemType {
    HOTEL = "HOTEL",
    TRANSFER = "TRANSFER",
    GUIDE = "GUIDE",
    ACTIVITY = "ACTIVITY",
    FEE = "FEE",
    DISCOUNT = "DISCOUNT"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum Currency {
    EUR = "EUR",
    TRY = "TRY",
    USD = "USD"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    CREDIT_CARD = "CREDIT_CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    ONLINE = "ONLINE",
    OTHER = "OTHER"
}
