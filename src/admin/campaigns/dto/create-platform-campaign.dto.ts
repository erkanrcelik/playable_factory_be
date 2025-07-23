import { z } from 'zod';
import { DiscountType } from '../../../schemas/campaign.schema';

export const createPlatformCampaignSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    discountType: z.nativeEnum(DiscountType),
    discountValue: z.number().min(0),
    startDate: z.string().pipe(z.coerce.date()),
    endDate: z.string().pipe(z.coerce.date()),
    productIds: z.array(z.string()).optional(),
    categoryIds: z.array(z.string()).optional(),
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

export type CreatePlatformCampaignDto = z.infer<
  typeof createPlatformCampaignSchema
>;
