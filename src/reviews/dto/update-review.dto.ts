import { z } from 'zod';

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment cannot exceed 1000 characters')
    .optional(),
});

export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;
