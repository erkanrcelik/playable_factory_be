import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().min(1, 'Arama terimi gereklidir'),
  page: z.coerce
    .number()
    .int()
    .min(1, 'Sayfa numarası 1 veya daha büyük olmalıdır')
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit 1 veya daha büyük olmalıdır')
    .max(100, "Limit 100'ü geçemez")
    .default(10),
  type: z.enum(['products', 'categories', 'sellers', 'campaigns']).optional(),
});

export type SearchDto = z.infer<typeof searchSchema>;
