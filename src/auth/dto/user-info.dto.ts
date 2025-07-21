import { z } from 'zod';
import { UserRole } from '../../schemas/user.schema';

export const addressSchema = z.object({
  type: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  isDefault: z.boolean(),
});

export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
});

export const userPreferencesSchema = z.object({
  language: z.string(),
  currency: z.string(),
  notifications: notificationPreferencesSchema,
});

export const userInfoResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.nativeEnum(UserRole),
  phoneNumber: z.string().optional(),
  addresses: z.array(addressSchema),
  preferences: userPreferencesSchema,
  isEmailVerified: z.boolean(),
  isActive: z.boolean(),
  lastLogoutAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AddressDto = z.infer<typeof addressSchema>;
export type NotificationPreferencesDto = z.infer<
  typeof notificationPreferencesSchema
>;
export type UserPreferencesDto = z.infer<typeof userPreferencesSchema>;
export type UserInfoResponseDto = z.infer<typeof userInfoResponseSchema>;
