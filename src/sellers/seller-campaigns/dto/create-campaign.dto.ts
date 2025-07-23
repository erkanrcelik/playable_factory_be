import { z } from 'zod';

export const createCampaignSchema = z
  .object({
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
      .optional()
      .refine(
        (productIds) => {
          // If productIds is provided, at least 1 product must be selected
          if (productIds && productIds.length > 0) {
            return productIds.length >= 1;
          }
          // If productIds is not provided, campaign applies to all products
          return true;
        },
        {
          message:
            'If products are specified, at least one product must be selected',
        },
      ),
    isActive: z.boolean().default(true),
    maxUsage: z
      .number()
      .int()
      .min(1, 'Max usage must be at least 1')
      .optional(),
    minOrderAmount: z
      .number()
      .min(0, 'Minimum order amount cannot be negative')
      .optional(),
    imageUrl: z.string().optional(),
  })
  .refine(
    (data) => {
      const end = new Date(data.endDate);
      const start = new Date(data.startDate);
      return end > start;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  );

export type CreateCampaignDto = z.infer<typeof createCampaignSchema>;
