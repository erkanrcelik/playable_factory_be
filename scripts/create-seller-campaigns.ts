import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SellerCampaignsService } from '../src/sellers/seller-campaigns/seller-campaigns.service';
import { User, UserRole } from '../src/schemas/user.schema';
import { Product } from '../src/schemas/product.schema';
import { Campaign, DiscountType } from '../src/schemas/campaign.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MinioService } from '../src/minio/minio.service';

const sellerCampaigns = [
  {
    name: 'Elektronik Mağazası Kampanyası',
    description: 'Tüm elektronik ürünlerde %15 indirim!',
    discountPercentage: 15,
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 gün önce başladı
    endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 gün sonra bitiyor
    sellerEmail: 'techmart_master@example.com',
    imageUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&h=400&fit=crop'
  },
  {
    name: 'Moda Butik İndirimi',
    description: 'Yeni sezon kıyafetlerde %25 indirim!',
    discountPercentage: 25,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 gün önce başladı
    endDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000), // 13 gün sonra bitiyor
    sellerEmail: 'fashionhouse_master@example.com',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop'
  },
  {
    name: 'Ev & Dekor Fırsatları',
    description: 'Ev dekorasyon ürünlerinde %20 indirim!',
    discountPercentage: 20,
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 gün önce başladı
    endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 gün sonra bitiyor
    sellerEmail: 'homeplus_master@example.com',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop'
  },
  {
    name: 'Spor Ekipmanları Kampanyası',
    description: 'Tüm spor ekipmanlarında %30 indirim!',
    discountPercentage: 30,
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 gün önce başladı
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 gün sonra bitiyor
    sellerEmail: 'sportsworld_master@example.com',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop'
  },
  {
    name: 'Kitapçı Özel İndirimi',
    description: 'Tüm kitaplarda %40 indirim!',
    discountPercentage: 40,
    startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 gün önce başladı
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 gün sonra bitiyor
    sellerEmail: 'lifestyle_master@example.com',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop'
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

async function createSellerCampaigns() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const campaignsService = app.get(SellerCampaignsService);
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const productModel = app.get<Model<Product>>(getModelToken(Product.name));
  const minioService = app.get(MinioService);

  for (const campaignData of sellerCampaigns) {
    try {
      // Find seller by email
      const seller = await userModel.findOne({
        email: campaignData.sellerEmail,
        role: UserRole.SELLER
      });

      if (!seller) {
        console.log(` Seller not found: ${campaignData.sellerEmail}`);
        continue;
      }

      // Get all products of this seller
      const sellerProducts = await productModel.find({ sellerId: seller._id });

      if (sellerProducts.length === 0) {
        console.log(` No products found for seller: ${campaignData.sellerEmail}`);
        continue;
      }

      // Check if campaign already exists
      const existingCampaign = await campaignsService['campaignModel'].findOne({
        sellerId: seller._id,
        name: campaignData.name
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
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-seller-campaign-${campaignData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
          imageUrl = await uploadImageToMinio(minioService, imageBuffer, fileName);
        }
      }

      // Create seller campaign
      const campaign = await campaignsService.createCampaign(seller._id.toString(), {
        name: campaignData.name,
        description: campaignData.description,
        discountType: DiscountType.PERCENTAGE,
        discountValue: campaignData.discountPercentage,
        startDate: campaignData.startDate.toISOString(),
        endDate: campaignData.endDate.toISOString(),
        isActive: true,
        productIds: sellerProducts.map(product => product._id.toString()),
        imageUrl: imageUrl
      });

      console.log(` Created seller campaign: ${campaignData.name}`);

    } catch (error) {
      console.error(` Error creating campaign for seller "${campaignData.sellerEmail}":`, error.message);
    }
  }

  await app.close();
}

createSellerCampaigns().catch(console.error);
