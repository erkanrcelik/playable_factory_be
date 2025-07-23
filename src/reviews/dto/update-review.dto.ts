import { z } from 'zod';

/**
 * Update Review Request Schema
 *
 * Validates the structure and constraints for updating an existing product review.
 * All fields are optional to allow partial updates.
 *
 * @description Validation rules:
 * - rating: Optional integer between 1-5 (inclusive)
 * - comment: Optional string between 10-1000 characters
 *
 * @example
 * ```typescript
 * const updateData = {
 *   rating: 4,
 *   comment: "Updated my review after using it more."
 * };
 *
 * const result = updateReviewSchema.parse(updateData);
 * ```
 */
export const updateReviewSchema = z.object({
  /** Optional updated rating score from 1 (worst) to 5 (best) */
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),

  /** Optional updated review comment with meaningful content */
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment cannot exceed 1000 characters')
    .optional(),
});

/**
 * TypeScript type inferred from the Zod schema
 *
 * @example
 * ```typescript
 * function updateReview(reviewId: string, updateData: UpdateReviewDto) {
 *   // updateData is type-safe with proper validation
 * }
 * ```
 */
export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;
