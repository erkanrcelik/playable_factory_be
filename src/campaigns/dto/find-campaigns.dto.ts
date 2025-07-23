import { z } from 'zod';
import { CampaignType, DiscountType } from '../../schemas/campaign.schema';

/**
 * Find campaigns schema for public campaign filtering
 */
export const findCampaignsSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, 'Page number must be 1 or greater')
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be 1 or greater')
    .max(50, 'Limit cannot exceed 50')
    .default(20),
  type: z.nativeEnum(CampaignType).optional(),
  discountType: z.nativeEnum(DiscountType).optional(),
  categoryId: z.string().optional(),
  productId: z.string().optional(),
  minDiscount: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'discountValue', 'endDate', 'name'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  activeOnly: z.coerce.boolean().default(true),
});

/**
 * Find Campaigns DTO type inference
 */
export type FindCampaignsDto = z.infer<typeof findCampaignsSchema>;
