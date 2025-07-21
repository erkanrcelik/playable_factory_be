export enum SellerError {
  // Seller errors
  SELLER_NOT_FOUND = 'SELLER_NOT_FOUND',
  SELLER_PROFILE_NOT_FOUND = 'SELLER_PROFILE_NOT_FOUND',
  SELLER_HAS_PRODUCTS = 'SELLER_HAS_PRODUCTS',
  SELLER_DELETED_SUCCESS = 'SELLER_DELETED_SUCCESS',
  SELLER_APPROVED_SUCCESS = 'SELLER_APPROVED_SUCCESS',
  SELLER_REJECTED_SUCCESS = 'SELLER_REJECTED_SUCCESS',
}

export const SellerErrorMessages: Record<SellerError, string> = {
  [SellerError.SELLER_NOT_FOUND]: 'Seller not found',
  [SellerError.SELLER_PROFILE_NOT_FOUND]: 'Seller profile not found',
  [SellerError.SELLER_HAS_PRODUCTS]:
    'Cannot delete seller with existing products',
  [SellerError.SELLER_DELETED_SUCCESS]: 'Seller deleted successfully',
  [SellerError.SELLER_APPROVED_SUCCESS]: 'Seller approved successfully',
  [SellerError.SELLER_REJECTED_SUCCESS]: 'Seller rejected successfully',
};
