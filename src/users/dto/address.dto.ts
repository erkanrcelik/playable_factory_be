import { z } from 'zod';

/**
 * Create address schema
 */
export const createAddressSchema = z.object({
  title: z.string().min(1, 'Address title is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  isDefault: z.boolean().optional(),
  type: z.string().optional().default('home'),
});

/**
 * Update address schema
 */
export const updateAddressSchema = createAddressSchema
  .partial()
  .omit({ isDefault: true });

/**
 * Set default address schema
 */
export const setDefaultAddressSchema = z.object({
  isDefault: z.boolean(),
});

export type CreateAddressDto = z.infer<typeof createAddressSchema>;
export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;
export type SetDefaultAddressDto = z.infer<typeof setDefaultAddressSchema>;
