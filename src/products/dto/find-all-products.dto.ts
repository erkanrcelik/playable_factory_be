import { z } from 'zod';

export const findAllProductsSchema = z.object({
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
  category: z.string().optional(),
  seller: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  minPrice: z.coerce
    .number()
    .min(0, 'Minimum price must be 0 or greater')
    .optional(),
  maxPrice: z.coerce
    .number()
    .min(0, 'Maximum price must be 0 or greater')
    .optional(),
  tags: z.string().optional(), // Comma-separated tags
  hasDiscount: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
  campaignId: z.string().optional(), // Kampanya ID'si ile filtreleme
  sortBy: z
    .enum([
      'name',
      'price',
      'createdAt',
      'updatedAt',
      'averageRating',
      'reviewCount',
    ])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type FindAllProductsDto = z.infer<typeof findAllProductsSchema>;
