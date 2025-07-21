import { z } from 'zod';

export const uploadLogoSchema = z.object({
  logo: z
    .any()
    .refine(
      (file) => file && file.mimetype && file.mimetype.startsWith('image/'),
      {
        message: 'Only image files are accepted',
      },
    )
    .refine((file) => file && file.size <= 5 * 1024 * 1024, {
      message: 'Image file cannot exceed 5MB',
    }),
});

export type UploadLogoDto = z.infer<typeof uploadLogoSchema>;
