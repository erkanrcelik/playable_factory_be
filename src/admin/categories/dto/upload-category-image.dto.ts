import { z } from 'zod';

export const uploadCategoryImageSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
});

export type UploadCategoryImageDto = z.infer<typeof uploadCategoryImageSchema>;
