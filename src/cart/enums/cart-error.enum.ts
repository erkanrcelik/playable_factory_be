export enum CartError {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INVALID_QUANTITY = 'INVALID_QUANTITY',
  CART_ITEM_NOT_FOUND = 'CART_ITEM_NOT_FOUND',
  EMPTY_CART = 'EMPTY_CART',
  PRODUCT_ALREADY_IN_CART = 'PRODUCT_ALREADY_IN_CART',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
}

export const CartErrorMessages = {
  [CartError.PRODUCT_NOT_FOUND]: 'Product not found',
  [CartError.INSUFFICIENT_STOCK]: 'Insufficient stock available',
  [CartError.INVALID_QUANTITY]: 'Invalid quantity. Must be at least 1',
  [CartError.CART_ITEM_NOT_FOUND]: 'Cart item not found',
  [CartError.EMPTY_CART]: 'Cart is empty',
  [CartError.PRODUCT_ALREADY_IN_CART]: 'Product already exists in cart',
  [CartError.UNAUTHORIZED_ACCESS]: 'Unauthorized access to cart',
};
