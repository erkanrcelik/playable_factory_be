import { z } from 'zod';
import { DiscountType } from '../../../schemas/campaign.schema';

export const createPlatformCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.number().min(0),
  startDate: z.date(),
  endDate: z.date(),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export type CreatePlatformCampaignDto = z.infer<
  typeof createPlatformCampaignSchema
>;
