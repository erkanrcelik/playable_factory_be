export enum ReviewError {
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  ALREADY_REVIEWED = 'ALREADY_REVIEWED',
  INVALID_RATING = 'INVALID_RATING',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  REVIEW_NOT_APPROVED = 'REVIEW_NOT_APPROVED',
}

export const ReviewErrorMessages = {
  [ReviewError.REVIEW_NOT_FOUND]: 'Review not found',
  [ReviewError.PRODUCT_NOT_FOUND]: 'Product not found',
  [ReviewError.ALREADY_REVIEWED]: 'You have already reviewed this product',
  [ReviewError.INVALID_RATING]: 'Rating must be between 1 and 5',
  [ReviewError.UNAUTHORIZED_ACCESS]: 'Unauthorized access to this review',
  [ReviewError.REVIEW_NOT_APPROVED]: 'Review is not approved yet',
};
