import { z } from 'zod';

export const checkoutSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(1, 'Phone number is required'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(1, 'Phone number is required'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  paymentMethod: z.object({
    type: z.enum(['credit_card', 'debit_card', 'paypal']),
    cardNumber: z.string().optional(),
    cardHolderName: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
  }),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type CheckoutDto = z.infer<typeof checkoutSchema>;
