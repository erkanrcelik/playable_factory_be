export enum UserError {
  // Customer errors
  CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  CUSTOMER_HAS_ORDERS = 'CUSTOMER_HAS_ORDERS',
  CUSTOMER_DELETED_SUCCESS = 'CUSTOMER_DELETED_SUCCESS',
}

export const UserErrorMessages: Record<UserError, string> = {
  [UserError.CUSTOMER_NOT_FOUND]: 'Customer not found',
  [UserError.CUSTOMER_HAS_ORDERS]:
    'Cannot delete customer with existing orders',
  [UserError.CUSTOMER_DELETED_SUCCESS]: 'Customer deleted successfully',
};
