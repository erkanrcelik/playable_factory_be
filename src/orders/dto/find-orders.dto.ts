import { z } from 'zod';
import { OrderStatus } from '../../schemas/order.schema';

/**
 * Find orders schema for validation and filtering
 */
export const findOrdersSchema = z.object({
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
  status: z.nativeEnum(OrderStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'totalPrice', 'status'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

/**
 * Find Orders DTO type inference
 */
export type FindOrdersDto = z.infer<typeof findOrdersSchema>;
