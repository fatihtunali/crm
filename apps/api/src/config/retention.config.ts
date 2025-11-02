/**
 * Data Retention Policy Configuration
 * Defines how long different types of data should be retained
 * Complies with GDPR Article 5(1)(e) - storage limitation principle
 */

export const RetentionConfig = {
  // Client data retention (in days)
  clients: {
    // Mark inactive after this period of no activity
    inactiveAfterDays: 365 * 3, // 3 years
    // Delete/anonymize after this period (legal requirement for personal data)
    deleteAfterDays: 365 * 7, // 7 years
  },

  // Booking data retention
  bookings: {
    // Archive completed bookings after this period
    archiveAfterDays: 365 * 2, // 2 years
    // Keep booking records for tax/legal purposes
    deleteAfterDays: 365 * 10, // 10 years
  },

  // Audit logs retention
  auditLogs: {
    // Keep audit logs for security and compliance
    deleteAfterDays: 365 * 7, // 7 years
  },

  // Lead data retention
  leads: {
    // Delete old leads that never converted
    deleteAfterDays: 365 * 2, // 2 years
  },

  // Idempotency keys (payment deduplication)
  idempotencyKeys: {
    // Keep for 30 days (longer than token expiry)
    deleteAfterDays: 30,
  },

  // Files and attachments
  files: {
    // Delete orphaned files
    deleteAfterDays: 365 * 5, // 5 years
  },
};

/**
 * Cron schedule for data retention jobs
 */
export const RetentionSchedule = {
  // Run daily at 2 AM
  archiveOldData: '0 2 * * *',

  // Run weekly on Sunday at 3 AM
  deleteOldData: '0 3 * * 0',

  // Run monthly on the 1st at 4 AM
  cleanupOrphanedData: '0 4 1 * *',
};
