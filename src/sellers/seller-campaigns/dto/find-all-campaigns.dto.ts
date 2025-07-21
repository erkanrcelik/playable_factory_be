import { z } from 'zod';

export const findAllCampaignsSchema = z.object({
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
  status: z.enum(['active', 'inactive', 'expired', 'upcoming']).optional(),
  discountType: z.enum(['percentage', 'amount']).optional(),
  sortBy: z
    .enum(['name', 'startDate', 'endDate', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type FindAllCampaignsDto = z.infer<typeof findAllCampaignsSchema>;
