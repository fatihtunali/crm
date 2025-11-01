import { z } from 'zod';

// City night schema
export const cityNightSchema = z.object({
  city: z.string().min(1, 'City name is required'),
  nights: z.number().int().min(1, 'At least 1 night required'),
});

// Tour type
export const itineraryTourTypeSchema = z.enum(['SIC', 'PRIVATE']);

// Itinerary status
export const itineraryStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'BOOKED', 'COMPLETED', 'CANCELLED']);

// Generate itinerary schema (Public customer form)
export const generateItinerarySchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().optional(),
  destination: z.string().min(3, 'Destination must be at least 3 characters'),
  cityNights: z
    .array(cityNightSchema)
    .min(1, 'At least one city is required')
    .refine(
      (cities) => cities.reduce((sum, city) => sum + city.nights, 0) >= 1,
      {
        message: 'Total nights must be at least 1',
      }
    ),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  adults: z.number().int().min(1, 'At least 1 adult required'),
  children: z.number().int().min(0).optional(),
  hotelCategory: z.enum(['3 stars', '4 stars', '5 stars']).optional(),
  tourType: itineraryTourTypeSchema.optional(),
  specialRequests: z.string().max(1000, 'Special requests must be less than 1000 characters').optional(),
}).refine(
  (data) => {
    const startDate = new Date(data.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return startDate >= today;
  },
  {
    message: 'Start date must be today or in the future',
    path: ['startDate'],
  }
);

// Update itinerary status schema (Agent dashboard)
export const updateItineraryStatusSchema = z.object({
  status: itineraryStatusSchema,
});

// Type exports
export type CityNightInput = z.infer<typeof cityNightSchema>;
export type GenerateItineraryInput = z.infer<typeof generateItinerarySchema>;
export type UpdateItineraryStatusInput = z.infer<typeof updateItineraryStatusSchema>;
