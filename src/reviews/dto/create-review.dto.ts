import { z } from 'zod';

/**
 * Create Review Request Schema
 *
 * Validates the structure and constraints for creating a new product review.
 * Ensures data integrity and provides clear validation messages.
 *
 * @description Validation rules:
 * - productId: Required MongoDB ObjectId string
 * - rating: Integer between 1-5 (inclusive)
 * - comment: String between 10-1000 characters
 *
 * @example
 * ```typescript
 * const validReview = {
 *   productId: "64abc123def456789",
 *   rating: 5,
 *   comment: "Excellent product! Highly recommended for everyone."
 * };
 *
 * const result = createReviewSchema.parse(validReview);
 * ```
 */
export const createReviewSchema = z.object({
  /** MongoDB ObjectId of the product being reviewed */
  productId: z.string().min(1, 'Product ID is required'),

  /** Rating score from 1 (worst) to 5 (best) */
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),

  /** Review comment with meaningful content */
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment cannot exceed 1000 characters'),
});

/**
 * TypeScript type inferred from the Zod schema
 *
 * @example
 * ```typescript
 * function createReview(reviewData: CreateReviewDto) {
 *   // reviewData is type-safe with proper validation
 * }
 * ```
 */
export type CreateReviewDto = z.infer<typeof createReviewSchema>;
