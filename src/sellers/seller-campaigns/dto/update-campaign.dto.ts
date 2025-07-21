import { z } from 'zod';

export const updateCampaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name cannot exceed 100 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
  discountType: z.enum(['percentage', 'amount']).optional(),
  discountValue: z
    .number()
    .min(1, 'Discount value must be at least 1')
    .optional(),
  productIds: z
    .array(z.string())
    .min(1, 'At least one product must be selected')
    .optional(),
  isActive: z.boolean().optional(),
  maxUsage: z.number().int().min(1, 'Max usage must be at least 1').optional(),
  minOrderAmount: z
    .number()
    .min(0, 'Minimum order amount cannot be negative')
    .optional(),
});

export type UpdateCampaignDto = z.infer<typeof updateCampaignSchema>;
