import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name cannot exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  discountType: z.enum(['percentage', 'amount']),
  discountValue: z.number().min(1, 'Discount value must be at least 1'),
  productIds: z
    .array(z.string())
    .min(1, 'At least one product must be selected'),
  isActive: z.boolean().default(true),
  maxUsage: z.number().int().min(1, 'Max usage must be at least 1').optional(),
  minOrderAmount: z
    .number()
    .min(0, 'Minimum order amount cannot be negative')
    .optional(),
});

export type CreateCampaignDto = z.infer<typeof createCampaignSchema>;
