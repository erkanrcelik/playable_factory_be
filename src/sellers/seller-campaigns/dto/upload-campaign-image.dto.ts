import { z } from 'zod';

export const uploadCampaignImageSchema = z.object({
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

export type UploadCampaignImageDto = z.infer<typeof uploadCampaignImageSchema>;
