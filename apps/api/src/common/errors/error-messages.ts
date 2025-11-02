/**
 * Standardized Error Messages
 *
 * Central location for all error messages used throughout the application.
 * Using functions allows for dynamic message generation with context.
 *
 * Usage:
 *   throw new NotFoundException(ErrorMessages.BOOKING_NOT_FOUND(bookingId));
 *   throw new BadRequestException(ErrorMessages.PAYMENT_EXCEEDS_TOTAL(amount, total, remaining));
 */

export const ErrorMessages = {
  // Booking errors
  BOOKING_NOT_FOUND: (id: number) => `Booking with ID ${id} not found`,
  BOOKING_CODE_NOT_FOUND: (code: string) => `Booking with code ${code} not found`,
  BOOKING_ALREADY_CANCELLED: 'Booking has already been cancelled',
  BOOKING_CANNOT_MODIFY: (status: string) => `Cannot modify booking with status ${status}`,

  // Client errors
  CLIENT_NOT_FOUND: (id: number) => `Client with ID ${id} not found`,
  CLIENT_EMAIL_EXISTS: (email: string) => `Client with email ${email} already exists`,
  CLIENT_INACTIVE: (id: number) => `Client ${id} is inactive`,

  // Lead errors
  LEAD_NOT_FOUND: (id: number) => `Lead with ID ${id} not found`,
  LEAD_DUPLICATE: (leadId: number) => `Active lead already exists for this client (Lead #${leadId})`,
  LEAD_INVALID_STATUS: (from: string, to: string) => `Cannot change lead status from ${from} to ${to}`,

  // Quotation errors
  QUOTATION_NOT_FOUND: (id: number) => `Quotation with ID ${id} not found`,
  QUOTATION_ALREADY_ACCEPTED: 'Quotation has already been accepted',
  QUOTATION_ALREADY_SENT: 'Quotation has already been sent',
  QUOTATION_INVALID_STATUS: (status: string, action: string) =>
    `Cannot ${action} quotation with status ${status}`,
  QUOTATION_NO_CLIENT_EMAIL: 'Cannot send quotation: No email address found for the associated client',
  QUOTATION_BOOKING_EXISTS: (bookingCode: string) =>
    `A booking already exists for this quotation (Booking Code: ${bookingCode})`,

  // Payment errors
  PAYMENT_NOT_FOUND: (id: number) => `Payment with ID ${id} not found`,
  PAYMENT_EXCEEDS_TOTAL: (amount: number, total: number, remaining: number) =>
    `Payment amount ${amount.toFixed(2)} EUR would exceed booking total. ` +
    `Total: ${total.toFixed(2)} EUR, Remaining: ${remaining.toFixed(2)} EUR`,
  PAYMENT_INVALID_AMOUNT: (amount: number) => `Payment amount ${amount} must be greater than 0`,
  PAYMENT_ALREADY_PROCESSED: 'Payment has already been processed',

  // Vendor errors
  VENDOR_NOT_FOUND: (id: number) => `Vendor with ID ${id} not found`,
  VENDOR_INACTIVE: (id: number) => `Vendor ${id} is inactive`,

  // Service Offering errors
  SERVICE_OFFERING_NOT_FOUND: (id: number) => `Service offering with ID ${id} not found`,
  SERVICE_OFFERING_INACTIVE: 'Service offering is inactive',

  // Rate errors
  RATE_NOT_FOUND: (serviceType: string, date: string) =>
    `No active rate found for ${serviceType} on ${date}`,
  RATE_OVERLAP: (from: string, to: string) =>
    `Rate season overlaps with existing rate (${from} to ${to})`,
  RATE_INVALID_DATE_RANGE: 'Rate season end date must be after start date',

  // Date validation errors
  INVALID_DATE_RANGE: 'End date must be after start date',
  INVALID_DATE_FORMAT: (field: string) => `Invalid date format for ${field}`,
  DATE_IN_PAST: (field: string) => `${field} cannot be in the past`,

  // Exchange rate errors
  NO_EXCHANGE_RATE: (from: string, to: string, date?: string) =>
    date
      ? `No exchange rate available for ${from} → ${to} on ${date}`
      : `No exchange rate available for ${from} → ${to}`,
  EXCHANGE_RATE_INVALID: 'Exchange rate must be greater than 0',

  // Capacity validation errors
  CAPACITY_EXCEEDED: (requested: number, maximum: number, type: string) =>
    `Requested ${type} (${requested}) exceeds maximum capacity (${maximum})`,
  CAPACITY_BELOW_MINIMUM: (requested: number, minimum: number, type: string) =>
    `Requested ${type} (${requested}) is below minimum requirement (${minimum})`,

  // Tour errors
  TOUR_NOT_FOUND: (id: number) => `Tour with ID ${id} not found`,
  TOUR_CODE_EXISTS: (code: string) => `Tour with code ${code} already exists`,

  // User errors
  USER_NOT_FOUND: (id: number) => `User with ID ${id} not found`,
  USER_EMAIL_EXISTS: (email: string) => `User with email ${email} already exists`,
  USER_INACTIVE: 'User account is inactive',
  USER_INVALID_PASSWORD: 'Invalid password',

  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_TOKEN_EXPIRED: 'Authentication token has expired',
  AUTH_TOKEN_INVALID: 'Invalid authentication token',
  AUTH_UNAUTHORIZED: 'Unauthorized access',
  AUTH_INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',

  // Tenant errors
  TENANT_NOT_FOUND: (id: number) => `Tenant with ID ${id} not found`,
  TENANT_INACTIVE: 'Tenant account is inactive',

  // File upload errors
  FILE_TOO_LARGE: (size: number, maxSize: number) =>
    `File size ${size} bytes exceeds maximum allowed size of ${maxSize} bytes`,
  FILE_INVALID_TYPE: (type: string, allowed: string[]) =>
    `File type ${type} not allowed. Allowed types: ${allowed.join(', ')}`,
  FILE_NOT_FOUND: (id: number) => `File with ID ${id} not found`,

  // Validation errors
  VALIDATION_FAILED: 'Validation failed',
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Phone number must be in E.164 format (e.g., +905551234567)',
  INVALID_ENUM_VALUE: (field: string, allowed: string[]) =>
    `Invalid ${field}. Allowed values: ${allowed.join(', ')}`,

  // Generic errors
  NOT_FOUND: (entity: string, id: number) => `${entity} with ID ${id} not found`,
  ALREADY_EXISTS: (entity: string, field: string, value: string) =>
    `${entity} with ${field} '${value}' already exists`,
  INACTIVE: (entity: string) => `${entity} is inactive`,
  OPERATION_FAILED: (operation: string) => `Failed to ${operation}`,

  // Business rule errors
  DUPLICATE_RECORD: (entity: string) => `Duplicate ${entity} detected`,
  CONCURRENT_MODIFICATION: 'Resource was modified by another user. Please refresh and try again',
  DEPENDENCY_EXISTS: (entity: string, dependency: string) =>
    `Cannot delete ${entity} because it has associated ${dependency}`,

  // Query errors
  QUERY_TIMEOUT: 'Query execution exceeded time limit',
  DATABASE_ERROR: 'A database error occurred',

  // Import/Export errors
  IMPORT_FAILED: (row: number, reason: string) => `Import failed at row ${row}: ${reason}`,
  EXPORT_FAILED: 'Failed to export data',
  INVALID_CSV_FORMAT: 'Invalid CSV format',

  // Email template errors
  TEMPLATE_NOT_FOUND: (name: string) => `Email template '${name}' not found`,
  TEMPLATE_ALREADY_EXISTS: (name: string) => `Email template '${name}' already exists`,
  TEMPLATE_INVALID_VARIABLE: (variable: string) => `Invalid template variable: ${variable}`,
};

/**
 * Error message builder for consistent formatting
 */
export class ErrorMessageBuilder {
  static list(items: string[]): string {
    return items.join('; ');
  }

  static withDetails(message: string, details: Record<string, any>): string {
    const detailsStr = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    return `${message} (${detailsStr})`;
  }

  static multipleErrors(errors: string[]): string {
    return `Multiple errors occurred:\n- ${errors.join('\n- ')}`;
  }
}
