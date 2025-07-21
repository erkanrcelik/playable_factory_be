import { z } from 'zod';

export const findAllOrdersSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, 'Page number must be 1 or greater')
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be 1 or greater')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  search: z.string().optional(),
  status: z
    .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'totalAmount'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type FindAllOrdersDto = z.infer<typeof findAllOrdersSchema>;
