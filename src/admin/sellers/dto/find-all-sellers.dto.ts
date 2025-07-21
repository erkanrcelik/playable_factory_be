import { z } from 'zod';

export const findAllSellersSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  isApproved: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type FindAllSellersDto = z.infer<typeof findAllSellersSchema>;
