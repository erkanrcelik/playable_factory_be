import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AdminCategoriesService } from '../src/admin/categories/admin-categories.service';
import { MinioService } from '../src/minio/minio.service';

const categories = [
  {
    name: 'Electronics',
    description: 'Latest electronic devices, smartphones, laptops, tablets, and accessories. Find the newest technology and gadgets for your digital lifestyle.',
    imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop',
    isActive: true,
  },
  {
    name: 'Clothing',
    description: 'Fashionable clothing for men, women, and children. From casual wear to formal attire, find your perfect style.',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    isActive: true,
  },
  {
    name: 'Home and Garden',
    description: 'Everything you need for your home and garden. Furniture, decor, gardening tools, and outdoor living essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    isActive: true,
  },
  {
    name: 'Sports',
    description: 'Sports equipment, athletic wear, fitness gear, and outdoor recreation products for all your active lifestyle needs.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    isActive: true,
  },
  {
    name: 'Books',
    description: 'Books for all ages and interests. Fiction, non-fiction, educational materials, and digital content.',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
    isActive: true,
  },
  {
    name: 'Health and Beauty',
    description: 'Personal care products, cosmetics, skincare, haircare, and wellness items for your health and beauty routine.',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop',
    isActive: true,
  },
  {
    name: 'Toys',
    description: 'Toys and games for children of all ages. Educational toys, board games, puzzles, and entertainment for kids.',
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=600&fit=crop',
    isActive: true,
  },
  {
    name: 'Food',
    description: 'Fresh food, groceries, beverages, snacks, and culinary essentials. Quality ingredients for your kitchen.',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    isActive: true,
  },
];

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function createCategories() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const categoriesService = app.get(AdminCategoriesService);
  const minioService = app.get(MinioService);

  for (const categoryData of categories) {
    try {
      const existingCategory = await categoriesService['categoryModel'].findOne({
        name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') },
      });

      if (existingCategory) {
        continue;
      }

      // Create category first
      const category = await categoriesService.create({
        name: categoryData.name,
        description: categoryData.description,
        isActive: categoryData.isActive,
      });

      // Download and upload image to MinIO
      try {
        const imageBuffer = await downloadImage(categoryData.imageUrl);

        // Create a file object for MinIO upload
        const file = {
          buffer: imageBuffer,
          originalname: `${category.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          size: imageBuffer.length,
        } as Express.Multer.File;

        const imageUrl = await minioService.uploadFile(file, process.env.MINIO_BUCKET_NAME || 'ekotest');

        // Update category with MinIO image URL
        await categoriesService.update((category as any)._id.toString(), {
          image: imageUrl,
        });

      } catch (imageError) {
        console.error(` Error uploading image for ${category.name}:`, imageError.message);
      }

    } catch (error) {
      console.error(` Error creating category "${categoryData.name}":`, error.message);
    }
  }

  await app.close();
}

createCategories().catch(console.error);
