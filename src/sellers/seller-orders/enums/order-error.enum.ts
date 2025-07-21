export enum OrderError {
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_STATUS = 'INVALID_STATUS',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  ORDER_ALREADY_COMPLETED = 'ORDER_ALREADY_COMPLETED',
  ORDER_ALREADY_CANCELLED = 'ORDER_ALREADY_CANCELLED',
}

export const OrderErrorMessages = {
  [OrderError.ORDER_NOT_FOUND]: 'Order not found',
  [OrderError.UNAUTHORIZED_ACCESS]: 'Unauthorized access to this order',
  [OrderError.INVALID_STATUS]: 'Invalid order status',
  [OrderError.INVALID_STATUS_TRANSITION]: 'Invalid status transition',
  [OrderError.ORDER_ALREADY_COMPLETED]: 'Order is already completed',
  [OrderError.ORDER_ALREADY_CANCELLED]: 'Order is already cancelled',
};
