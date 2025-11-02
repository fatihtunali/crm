/**
 * Business Rules Configuration
 *
 * Central configuration for all business logic constants and rules.
 * This file eliminates magic numbers from the codebase and makes
 * business rules easily configurable and testable.
 *
 * Usage:
 *   import { BusinessRules } from '@/config/business-rules.config';
 *   const rooms = Math.ceil(adults / BusinessRules.hotel.defaultAdultsPerRoom);
 */

export const BusinessRules = {
  /**
   * Hotel and accommodation rules
   */
  hotel: {
    // Default occupancy assumptions
    defaultAdultsPerRoom: 2,
    defaultRoomsForCalculation: 1,

    // Age brackets for pricing
    maxChildAge: 12,      // Children are 0-12 years old
    infantMaxAge: 2,      // Infants: 0-1.99 years
    child1MinAge: 2,      // Child bracket 1: 2-5.99 years
    child1MaxAge: 6,
    child2MinAge: 6,      // Child bracket 2: 6-11.99 years
    child2MaxAge: 12,

    // Room configuration
    defaultMaxOccupancy: 4,
    singleRoomMaxOccupancy: 1,
    doubleRoomMaxOccupancy: 2,
    tripleRoomMaxOccupancy: 3,
    quadRoomMaxOccupancy: 4,
  },

  /**
   * Booking and quotation rules
   */
  booking: {
    // Quotation validity
    defaultValidityDays: 7,        // Quotations valid for 7 days by default
    maxValidityDays: 90,           // Maximum 90 days validity

    // Booking constraints
    minAdvanceBookingDays: 2,      // Minimum 2 days advance booking
    maxAdvanceBookingDays: 365,    // Maximum 1 year advance booking

    // Deposit and payment
    defaultDepositPercentage: 30,  // 30% deposit
    defaultBalancePercentage: 70,  // 70% balance
    minDepositPercentage: 10,      // Minimum 10% deposit
    maxDepositPercentage: 100,     // Can require full payment

    // Tour durations
    defaultTourDurationDays: 7,    // Default 7-day tour
    minTourDurationDays: 1,        // Minimum 1 day
    maxTourDurationDays: 90,       // Maximum 90 days

    // Booking modifications
    minDaysBeforeCancellation: 7,  // Must cancel at least 7 days before
    minDaysBeforeModification: 3,  // Must modify at least 3 days before
  },

  /**
   * Payment rules
   */
  payment: {
    // Amount limits (in EUR)
    maxAmountEur: 1000000,         // 1 million EUR max
    minAmountEur: 0.01,            // 1 cent minimum
    decimalPlaces: 2,              // Two decimal places for currency

    // Amount limits (in TRY)
    maxAmountTry: 50000000,        // 50 million TRY max
    minAmountTry: 0.01,            // 1 kuruş minimum

    // Payment timeframes
    depositDueDays: 3,             // Deposit due within 3 days of booking
    balanceDueDaysBeforeTravel: 14, // Balance due 14 days before travel
    latePaymentGraceDays: 2,       // 2 days grace period

    // Idempotency
    idempotencyKeyExpirationHours: 24, // Idempotency keys expire after 24 hours
  },

  /**
   * Lead management rules
   */
  lead: {
    // Deduplication timeframe
    deduplicationWindowDays: 30,   // Check for duplicates in last 30 days

    // Lead aging
    newLeadAgeDays: 7,             // Leads newer than 7 days are "new"
    staleLeadAgeDays: 30,          // Leads older than 30 days are "stale"
    autoArchiveAfterDays: 90,      // Auto-archive after 90 days if no activity

    // Follow-up intervals
    firstFollowUpHours: 24,        // First follow-up within 24 hours
    secondFollowUpDays: 3,         // Second follow-up after 3 days
    finalFollowUpDays: 7,          // Final follow-up after 7 days

    // Budget defaults
    defaultBudgetEur: 1000,        // Default budget if not specified
    minBudgetEur: 100,             // Minimum budget
    maxBudgetEur: 100000,          // Maximum budget
  },

  /**
   * Pricing and rate rules
   */
  pricing: {
    // Markup percentages
    defaultMarkupPercentage: 20,   // Default 20% markup on cost
    minMarkupPercentage: 0,        // No markup (sell at cost)
    maxMarkupPercentage: 100,      // Maximum 100% markup

    // Discount limits
    maxDiscountPercentage: 50,     // Maximum 50% discount
    earlyBookingDiscountDays: 60,  // Early booking if 60+ days in advance
    earlyBookingDiscountPct: 10,   // 10% early booking discount

    // Group pricing
    groupSizeThreshold: 10,        // 10+ people qualifies as group
    groupDiscountPercentage: 15,   // 15% group discount

    // Child discounts
    infantDiscountPercentage: 100, // Infants free (100% discount)
    childDiscountPercentage: 50,   // Children 50% of adult price

    // Season length
    minSeasonDurationDays: 1,      // Minimum 1 day season
    maxSeasonDurationDays: 365,    // Maximum 1 year season
  },

  /**
   * Vehicle and transfer rules
   */
  vehicle: {
    // Capacity
    minPassengers: 1,
    maxPassengers: 50,             // Maximum bus capacity
    standardCarCapacity: 4,
    standardVanCapacity: 8,
    standardBusCapacity: 50,

    // Rental minimums
    minHourlyRental: 4,            // Minimum 4 hours for hourly rental
    minDailyRental: 1,             // Minimum 1 day for daily rental

    // Distance
    includedDailyKm: 200,          // Default 200km per day included
    extraKmThreshold: 50,          // Charge extra after 50km over included
  },

  /**
   * Activity rules
   */
  activity: {
    // Participant limits
    minParticipants: 1,
    maxParticipants: 100,
    defaultMinParticipants: 2,     // Default minimum 2 people
    defaultMaxParticipants: 20,    // Default maximum 20 people

    // Duration
    minDurationMinutes: 30,
    maxDurationMinutes: 1440,      // 24 hours max
    defaultDurationMinutes: 120,   // Default 2 hours

    // Age restrictions
    minAgeYears: 0,
    maxAgeYears: 100,
    defaultMinAgeYears: 6,         // Default minimum age 6 years
  },

  /**
   * Guide service rules
   */
  guide: {
    // Working hours
    standardDayHours: 8,           // Standard 8-hour day
    maxDailyHours: 12,             // Maximum 12 hours per day
    minHourlyBooking: 4,           // Minimum 4 hours booking

    // Languages
    maxLanguages: 5,               // Guide can speak up to 5 languages
    defaultLanguage: 'en',         // Default language English

    // Group size
    maxGroupSize: 30,              // Maximum 30 people per guide
  },

  /**
   * File and document rules
   */
  file: {
    // Size limits (in bytes)
    maxFileSizeMB: 10,
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB

    // Allowed types
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedSpreadsheetTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],

    // Storage limits
    maxFilesPerEntity: 20,         // Maximum 20 files per booking/client/etc.
  },

  /**
   * Pagination and query limits
   */
  query: {
    // Pagination defaults
    defaultPageSize: 50,
    minPageSize: 1,
    maxPageSize: 100,

    // Query limits
    maxSearchResults: 1000,
    defaultSearchLimit: 20,

    // Timeouts
    queryTimeoutSeconds: 30,
    reportGenerationTimeoutSeconds: 60,

    // Batch operations
    maxBulkImportRecords: 1000,    // Maximum 1000 records per bulk import
    maxBatchSize: 100,             // Process in batches of 100
  },

  /**
   * Email and communication rules
   */
  communication: {
    // Email
    maxEmailRetries: 3,
    emailRetryDelayMinutes: 5,

    // Templates
    maxTemplateVariables: 50,
    templateCacheDurationMinutes: 60,

    // Notifications
    maxNotificationsPerDay: 50,    // Maximum 50 notifications per user per day
    notificationRetentionDays: 30, // Keep notifications for 30 days
  },

  /**
   * Data retention rules
   */
  retention: {
    // Client data
    clientInactiveDays: 365 * 3,   // Mark inactive after 3 years
    clientArchiveDays: 365 * 7,    // Archive after 7 years
    clientDeleteDays: 365 * 10,    // Delete after 10 years

    // Booking data
    bookingArchiveDays: 365 * 2,   // Archive after 2 years
    bookingDeleteDays: 365 * 10,   // Keep for 10 years (legal requirement)

    // Audit logs
    auditLogRetentionDays: 365 * 7, // Keep audit logs for 7 years

    // Temporary data
    tempFileRetentionDays: 7,      // Delete temp files after 7 days
    sessionDataRetentionDays: 30,  // Keep session data for 30 days
  },

  /**
   * Exchange rate rules
   */
  exchangeRate: {
    // Validity
    maxAgeHours: 24,               // Exchange rates valid for 24 hours
    requiredCurrencies: ['EUR', 'TRY', 'USD'], // Required currency pairs

    // Fluctuation limits
    maxDailyFluctuationPct: 10,    // Alert if rate changes >10% in a day
    minRate: 0.0001,               // Minimum exchange rate
    maxRate: 1000000,              // Maximum exchange rate

    // Decimal precision
    decimalPlaces: 6,              // 6 decimal places for exchange rates
  },

  /**
   * Validation rules
   */
  validation: {
    // Text field lengths
    minNameLength: 2,
    maxNameLength: 100,
    maxDescriptionLength: 5000,
    maxNotesLength: 2000,

    // Identifiers
    minCodeLength: 3,
    maxCodeLength: 20,
    maxEmailLength: 255,
    maxPhoneLength: 20,

    // Numeric ranges
    minPercentage: 0,
    maxPercentage: 100,
    minQuantity: 1,
    maxQuantity: 1000,
  },
};

/**
 * Helper functions for business rules
 */
export class BusinessRulesHelper {
  /**
   * Calculate number of hotel rooms needed based on adult count
   */
  static calculateRoomsNeeded(adults: number): number {
    return Math.ceil(adults / BusinessRules.hotel.defaultAdultsPerRoom);
  }

  /**
   * Determine child age bracket
   */
  static getChildAgeBracket(age: number): 'infant' | 'child1' | 'child2' | 'adult' {
    if (age < BusinessRules.hotel.infantMaxAge) return 'infant';
    if (age < BusinessRules.hotel.child1MaxAge) return 'child1';
    if (age < BusinessRules.hotel.child2MaxAge) return 'child2';
    return 'adult';
  }

  /**
   * Calculate quotation validity date
   */
  static calculateQuotationValidUntil(fromDate: Date = new Date()): Date {
    const validUntil = new Date(fromDate);
    validUntil.setDate(validUntil.getDate() + BusinessRules.booking.defaultValidityDays);
    return validUntil;
  }

  /**
   * Calculate deposit amount
   */
  static calculateDepositAmount(total: number, percentage?: number): number {
    const pct = percentage ?? BusinessRules.booking.defaultDepositPercentage;
    return Math.round(total * pct) / 100;
  }

  /**
   * Check if booking is within valid timeframe
   */
  static isBookingDateValid(bookingDate: Date, travelDate: Date): boolean {
    const daysDiff = Math.floor((travelDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= BusinessRules.booking.minAdvanceBookingDays &&
           daysDiff <= BusinessRules.booking.maxAdvanceBookingDays;
  }

  /**
   * Check if lead is within deduplication window
   */
  static isWithinDeduplicationWindow(leadDate: Date): boolean {
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= BusinessRules.lead.deduplicationWindowDays;
  }

  /**
   * Validate amount within limits
   */
  static validateAmount(amount: number, currency: 'EUR' | 'TRY'): boolean {
    if (currency === 'EUR') {
      return amount >= BusinessRules.payment.minAmountEur &&
             amount <= BusinessRules.payment.maxAmountEur;
    } else {
      return amount >= BusinessRules.payment.minAmountTry &&
             amount <= BusinessRules.payment.maxAmountTry;
    }
  }

  /**
   * Format currency amount to proper decimal places
   */
  static formatCurrencyAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}
