import { z } from 'zod';
import { DiscountType } from '../../../schemas/campaign.schema';

export const updatePlatformCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  discountType: z.nativeEnum(DiscountType).optional(),
  discountValue: z.number().min(0).optional(),
  startDate: z.string().pipe(z.coerce.date()).optional(),
  endDate: z.string().pipe(z.coerce.date()).optional(),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  imageUrl: z.string().optional(),
});

export type UpdatePlatformCampaignDto = z.infer<
  typeof updatePlatformCampaignSchema
>;
