import { z } from 'zod';

export const updateProfileSchema = z.object({
  storeName: z
    .string()
    .min(1, 'Store name is required')
    .max(100, 'Store name cannot exceed 100 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format')
    .optional(),
  website: z.string().url('Invalid website URL format').optional(),
  address: z
    .object({
      street: z
        .string()
        .min(1, 'Street is required')
        .max(200, 'Street cannot exceed 200 characters'),
      city: z
        .string()
        .min(1, 'City is required')
        .max(100, 'City cannot exceed 100 characters'),
      state: z
        .string()
        .min(1, 'State is required')
        .max(100, 'State cannot exceed 100 characters'),
      country: z
        .string()
        .min(1, 'Country is required')
        .max(100, 'Country cannot exceed 100 characters'),
      postalCode: z
        .string()
        .min(1, 'Postal code is required')
        .max(20, 'Postal code cannot exceed 20 characters'),
    })
    .optional(),
  businessHours: z
    .object({
      monday: z
        .object({
          open: z.string().optional(),
          close: z.string().optional(),
          closed: z.boolean().default(false),
        })
        .optional(),
      tuesday: z
        .object({
          open: z.string().optional(),
          close: z.string().optional(),
          closed: z.boolean().default(false),
        })
        .optional(),
      wednesday: z
        .object({
          open: z.string().optional(),
          close: z.string().optional(),
          closed: z.boolean().default(false),
        })
        .optional(),
      thursday: z
        .object({
          open: z.string().optional(),
          close: z.string().optional(),
          closed: z.boolean().default(false),
        })
        .optional(),
      friday: z
        .object({
          open: z.string().optional(),
          close: z.string().optional(),
          closed: z.boolean().default(false),
        })
        .optional(),
      saturday: z
        .object({
          open: z.string().optional(),
          close: z.string().optional(),
          closed: z.boolean().default(false),
        })
        .optional(),
      sunday: z
        .object({
          open: z.string().optional(),
          close: z.string().optional(),
          closed: z.boolean().default(false),
        })
        .optional(),
    })
    .optional(),
  socialMedia: z
    .object({
      facebook: z.string().url('Invalid Facebook URL').optional(),
      instagram: z.string().url('Invalid Instagram URL').optional(),
      twitter: z.string().url('Invalid Twitter URL').optional(),
      linkedin: z.string().url('Invalid LinkedIn URL').optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
