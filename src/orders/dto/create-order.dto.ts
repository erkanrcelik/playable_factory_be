import { z } from 'zod';
import { PaymentStatus } from '../../schemas/order.schema';

/**
 * Order item schema for order creation
 */
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
  sellerId: z.string().min(1, 'Seller ID is required'),
});

/**
 * Shipping address schema for order creation
 */
export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
});

/**
 * Create order schema for validation
 */
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  shippingAddress: shippingAddressSchema,
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  paymentTransactionId: z.string().optional(),
  appliedCampaigns: z
    .array(
      z.object({
        campaignId: z.string(),
        campaignName: z.string(),
        discountAmount: z.number(),
        discountType: z.enum(['percentage', 'fixed']),
      }),
    )
    .optional(),
  subtotal: z.number().min(0, 'Subtotal must be positive').optional(),
  totalDiscount: z
    .number()
    .min(0, 'Total discount must be positive')
    .optional(),
});

/**
 * Create Order DTO type inference
 */
export type CreateOrderDto = z.infer<typeof createOrderSchema>;

/**
 * Order Item DTO type inference
 */
export type OrderItemDto = z.infer<typeof orderItemSchema>;

/**
 * Shipping Address DTO type inference
 */
export type ShippingAddressDto = z.infer<typeof shippingAddressSchema>;
