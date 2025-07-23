import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name cannot exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  price: z.number().min(0.01, 'Price must be at least 0.01'),
  stock: z
    .number()
    .int()
    .min(0, 'Stock quantity must be 0 or greater')
    .optional(),
  category: z.string().min(1, 'Category selection is required'),
  specifications: z.record(z.string(), z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        color: z.string().optional(),
        size: z.string().optional(),
        stock: z.number().int().min(0, 'Stock quantity must be 0 or greater'),
        price: z.number().min(0.01, 'Variant price must be at least 0.01'),
      }),
    )
    .optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
