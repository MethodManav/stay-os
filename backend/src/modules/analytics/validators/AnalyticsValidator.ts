import { z } from 'zod';

export const queryMetricsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'startDate must be before or equal to endDate',
  path: ['startDate']
});
