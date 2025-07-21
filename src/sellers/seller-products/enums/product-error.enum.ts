export enum ProductError {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_ALREADY_EXISTS = 'PRODUCT_ALREADY_EXISTS',
  INVALID_CATEGORY = 'INVALID_CATEGORY',
  INVALID_PRICE = 'INVALID_PRICE',
  INVALID_STOCK = 'INVALID_STOCK',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_IMAGE_FORMAT = 'INVALID_IMAGE_FORMAT',
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

export const ProductErrorMessages = {
  [ProductError.PRODUCT_NOT_FOUND]: 'Product not found',
  [ProductError.PRODUCT_ALREADY_EXISTS]: 'Product already exists',
  [ProductError.INVALID_CATEGORY]: 'Invalid category',
  [ProductError.INVALID_PRICE]: 'Invalid price',
  [ProductError.INVALID_STOCK]: 'Invalid stock quantity',
  [ProductError.UNAUTHORIZED_ACCESS]: 'Unauthorized access to this product',
  [ProductError.INVALID_IMAGE_FORMAT]:
    'Invalid image format. Only image files are accepted',
  [ProductError.IMAGE_TOO_LARGE]: 'Image file too large. Maximum 5MB',
  [ProductError.UPLOAD_FAILED]: 'Image upload failed',
};
