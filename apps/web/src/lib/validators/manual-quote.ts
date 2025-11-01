import { z } from 'zod';

// Expense categories
export const expenseCategorySchema = z.enum([
  'hotelAccommodation',
  'meals',
  'entranceFees',
  'sicTourCost',
  'tips',
  'transportation',
  'guide',
  'guideDriverAccommodation',
  'parking',
]);

// Tour type
export const tourTypeSchema = z.enum(['SIC', 'PRIVATE']);

// Quote category
export const quoteCategorySchema = z.enum(['B2C', 'B2B', 'B2B_FIT', 'B2B_GROUPS', 'INTERNAL']);

// Manual Quote Expense Schema
export const createManualQuoteExpenseSchema = z.object({
  category: expenseCategorySchema,
  hotelCategory: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be at least 0'),
  singleSupplement: z.number().min(0).optional(),
  child0to2: z.number().min(0).optional(),
  child3to5: z.number().min(0).optional(),
  child6to11: z.number().min(0).optional(),
  vehicleCount: z.number().int().min(0).optional(),
  pricePerVehicle: z.number().min(0).optional(),
});

export const updateManualQuoteExpenseSchema = createManualQuoteExpenseSchema.partial();

// Manual Quote Day Schema
export const createManualQuoteDaySchema = z.object({
  dayNumber: z.number().int().min(1, 'Day number must be at least 1'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  expenses: z.array(createManualQuoteExpenseSchema).optional(),
});

export const updateManualQuoteDaySchema = createManualQuoteDaySchema.partial();

// Manual Quote Schema
const manualQuoteBaseSchema = z.object({
  quoteName: z.string().min(3, 'Quote name must be at least 3 characters'),
  category: quoteCategorySchema.optional(),
  seasonName: z.string().optional(),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  validTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  tourType: tourTypeSchema,
  pax: z.number().int().min(1, 'At least 1 passenger required'),
  markup: z.number().min(0).max(100, 'Markup must be between 0 and 100'),
  tax: z.number().min(0).max(100, 'Tax must be between 0 and 100'),
  transportPricingMode: z.enum(['total', 'vehicle']).optional(),
  days: z.array(createManualQuoteDaySchema).optional(),
});

export const createManualQuoteSchema = manualQuoteBaseSchema.refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

export const updateManualQuoteSchema = manualQuoteBaseSchema.partial();

// Type exports
export type CreateManualQuoteExpenseInput = z.infer<typeof createManualQuoteExpenseSchema>;
export type UpdateManualQuoteExpenseInput = z.infer<typeof updateManualQuoteExpenseSchema>;
export type CreateManualQuoteDayInput = z.infer<typeof createManualQuoteDaySchema>;
export type UpdateManualQuoteDayInput = z.infer<typeof updateManualQuoteDaySchema>;
export type CreateManualQuoteInput = z.infer<typeof createManualQuoteSchema>;
export type UpdateManualQuoteInput = z.infer<typeof updateManualQuoteSchema>;
