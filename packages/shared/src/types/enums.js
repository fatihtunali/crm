"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = exports.Currency = exports.PaymentStatus = exports.ItemType = exports.VendorType = exports.BookingStatus = exports.QuotationStatus = exports.LeadStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "OWNER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["AGENT"] = "AGENT";
    UserRole["OPERATIONS"] = "OPERATIONS";
    UserRole["ACCOUNTING"] = "ACCOUNTING";
    UserRole["GUIDE"] = "GUIDE";
    UserRole["VENDOR"] = "VENDOR";
})(UserRole || (exports.UserRole = UserRole = {}));
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "NEW";
    LeadStatus["CONTACTED"] = "CONTACTED";
    LeadStatus["QUOTED"] = "QUOTED";
    LeadStatus["WON"] = "WON";
    LeadStatus["LOST"] = "LOST";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
var QuotationStatus;
(function (QuotationStatus) {
    QuotationStatus["DRAFT"] = "DRAFT";
    QuotationStatus["SENT"] = "SENT";
    QuotationStatus["ACCEPTED"] = "ACCEPTED";
    QuotationStatus["REJECTED"] = "REJECTED";
})(QuotationStatus || (exports.QuotationStatus = QuotationStatus = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["COMPLETED"] = "COMPLETED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var VendorType;
(function (VendorType) {
    VendorType["HOTEL"] = "HOTEL";
    VendorType["TRANSPORT"] = "TRANSPORT";
    VendorType["GUIDE"] = "GUIDE";
    VendorType["ACTIVITY"] = "ACTIVITY";
})(VendorType || (exports.VendorType = VendorType = {}));
var ItemType;
(function (ItemType) {
    ItemType["HOTEL"] = "HOTEL";
    ItemType["TRANSFER"] = "TRANSFER";
    ItemType["GUIDE"] = "GUIDE";
    ItemType["ACTIVITY"] = "ACTIVITY";
    ItemType["FEE"] = "FEE";
    ItemType["DISCOUNT"] = "DISCOUNT";
})(ItemType || (exports.ItemType = ItemType = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var Currency;
(function (Currency) {
    Currency["EUR"] = "EUR";
    Currency["TRY"] = "TRY";
    Currency["USD"] = "USD";
})(Currency || (exports.Currency = Currency = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["ONLINE"] = "ONLINE";
    PaymentMethod["OTHER"] = "OTHER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
//# sourceMappingURL=enums.js.map