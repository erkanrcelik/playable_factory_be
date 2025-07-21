import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ]),
  trackingNumber: z.string().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
