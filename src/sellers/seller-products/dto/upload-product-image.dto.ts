import { z } from 'zod';

export const uploadProductImageSchema = z.object({
  image: z
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

export type UploadProductImageDto = z.infer<typeof uploadProductImageSchema>;
