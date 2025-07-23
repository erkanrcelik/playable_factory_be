import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AdminCampaignsService } from '../src/admin/campaigns/admin-campaigns.service';
import { Category } from '../src/schemas/category.schema';
import { User, UserRole } from '../src/schemas/user.schema';
import { Campaign, DiscountType } from '../src/schemas/campaign.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MinioService } from '../src/minio/minio.service';
import * as bcrypt from 'bcrypt';

const platformCampaigns = [
  {
    name: 'Elektronik Fırsatları',
    description: 'En yeni elektronik ürünlerde %20\'ye varan indirimler!',
    discountPercentage: 20,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
    isActive: true,
    categoryName: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&h=400&fit=crop'
  },
  {
    name: 'Moda Sezonu',
    description: 'Yeni sezon kıyafetlerde %30 indirim fırsatı!',
    discountPercentage: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 gün sonra
    isActive: true,
    categoryName: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop'
  },
  {
    name: 'Ev & Bahçe İndirimi',
    description: 'Ev ve bahçe ürünlerinde %25 indirim!',
    discountPercentage: 25,
    startDate: new Date(),
    endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 gün sonra
    isActive: true,
    categoryName: 'Home and Garden',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop'
  },
  {
    name: 'Spor & Fitness',
    description: 'Spor ekipmanlarında %15 indirim!',
    discountPercentage: 15,
    startDate: new Date(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 gün sonra
    isActive: true,
    categoryName: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop'
  },
  {
    name: 'Kitap Haftası',
    description: 'Tüm kitaplarda %40 indirim!',
    discountPercentage: 40,
    startDate: new Date(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 gün sonra
    isActive: true,
    categoryName: 'Books',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop'
  },
  {
    name: 'Güzellik & Sağlık',
    description: 'Kozmetik ve sağlık ürünlerinde %35 indirim!',
    discountPercentage: 35,
    startDate: new Date(),
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 gün sonra
    isActive: true,
    categoryName: 'Health and Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1559591935-c7c65d8c7633?w=800&h=400&fit=crop'
  },
  {
    name: 'Oyuncak Festivali',
    description: 'Çocuk oyuncaklarında %50\'ye varan indirimler!',
    discountPercentage: 50,
    startDate: new Date(),
    endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), // 22 gün sonra
    isActive: true,
    categoryName: 'Toys',
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=400&fit=crop'
  },
  {
    name: 'Gıda & İçecek',
    description: 'Taze gıda ürünlerinde %10 indirim!',
    discountPercentage: 10,
    startDate: new Date(),
    endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 gün sonra
    isActive: true,
    categoryName: 'Food',
    imageUrl: 'https://images.unsplash.com/photo-1504674900240-8947e31be3f8?w=800&h=400&fit=crop'
  }
];

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(` Image not found (404): ${url}, skipping...`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.warn(` Error downloading image from ${url}: ${error.message}, skipping...`);
    return null;
  }
}

async function uploadImageToMinio(minioService: MinioService, imageBuffer: Buffer, fileName: string): Promise<string> {
  try {
    // Use the bucket name from environment (defaults to 'ekotest')
    const bucketName = process.env.MINIO_BUCKET_NAME || 'ekotest';

    // Ensure bucket exists
    const bucketExists = await minioService.bucketExists(bucketName);
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      await minioService['minioService'].makeBucket(bucketName);
    }

    const objectName = `${fileName}`;
    await minioService['minioService'].putObject(bucketName, objectName, imageBuffer);

    const imageUrl = `https://minio.rhytma.com/${bucketName}/${objectName}`;
    return imageUrl;
  } catch (error) {
    console.error(` Error uploading image to MinIO:`, error);
    throw error;
  }
}

async function createAdminUser(userModel: Model<User>): Promise<string> {
  const existingAdmin = await userModel.findOne({ role: UserRole.ADMIN });

  if (existingAdmin) {
    return existingAdmin._id.toString();
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('Admin123!', saltRounds);

  const admin = new userModel({
    email: 'admin@platform.com',
    password: hashedPassword,
    firstName: 'Platform',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    isEmailVerified: true,
    isActive: true
  });

  const savedAdmin = await admin.save();
  return savedAdmin._id.toString();
}

async function createPlatformCampaigns() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const campaignsService = app.get(AdminCampaignsService);
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const categoryModel = app.get<Model<Category>>(getModelToken(Category.name));
  const minioService = app.get(MinioService);

  // Create admin user if not exists
  const adminId = await createAdminUser(userModel);

  for (const campaignData of platformCampaigns) {
    try {
      // Find category by name
      const category = await categoryModel.findOne({
        name: { $regex: new RegExp(`^${campaignData.categoryName}$`, 'i') }
      });

      if (!category) {
        console.log(` Category not found: ${campaignData.categoryName}`);
        continue;
      }

      // Check if campaign already exists
      const existingCampaign = await campaignsService['campaignModel'].findOne({
        name: campaignData.name,
        type: 'platform'
      });

      if (existingCampaign) {
        console.log(` Campaign already exists: ${campaignData.name}`);
        continue;
      }

      // Download and upload image if provided
      let imageUrl = '';
      if (campaignData.imageUrl) {
        const imageBuffer = await downloadImage(campaignData.imageUrl);
        if (imageBuffer) {
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-campaign-${campaignData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
          imageUrl = await uploadImageToMinio(minioService, imageBuffer, fileName);
        }
      }

      // Create platform campaign
      const campaign = await campaignsService.createPlatformCampaign({
        name: campaignData.name,
        description: campaignData.description,
        discountType: DiscountType.PERCENTAGE,
        discountValue: campaignData.discountPercentage,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
        categoryIds: [category._id.toString()],
        imageUrl: imageUrl
      });

      console.log(` Created platform campaign: ${campaignData.name}`);

    } catch (error) {
      console.error(` Error creating campaign for category "${campaignData.categoryName}":`, error.message);
    }
  }

  await app.close();
}

createPlatformCampaigns().catch(console.error);
