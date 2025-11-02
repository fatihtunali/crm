/**
 * Issue #32: Date Range Overlap Detection Utility
 *
 * Checks if two date ranges overlap
 * @param start1 Start date of first range
 * @param end1 End date of first range
 * @param start2 Start date of second range
 * @param end2 End date of second range
 * @returns true if ranges overlap, false otherwise
 */
export function checkDateRangeOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date,
): boolean {
  // Two ranges overlap if:
  // start1 <= end2 AND start2 <= end1
  return start1 <= end2 && start2 <= end1;
}

/**
 * Build Prisma where clause to detect overlapping date ranges
 * @param seasonFrom New season start date
 * @param seasonTo New season end date
 * @returns Prisma OR clause for overlap detection
 */
export function buildOverlapWhereClause(seasonFrom: Date, seasonTo: Date) {
  return {
    OR: [
      {
        // New range starts within existing range
        seasonFrom: { lte: seasonFrom },
        seasonTo: { gte: seasonFrom },
      },
      {
        // New range ends within existing range
        seasonFrom: { lte: seasonTo },
        seasonTo: { gte: seasonTo },
      },
      {
        // New range completely contains existing range
        seasonFrom: { gte: seasonFrom },
        seasonTo: { lte: seasonTo },
      },
    ],
  };
}
