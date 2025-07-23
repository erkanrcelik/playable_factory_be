import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { MinioService } from '../src/minio/minio.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from '../src/schemas/user.schema';
import { Product } from '../src/schemas/product.schema';
import { Category } from '../src/schemas/category.schema';
import { SellerProfile } from '../src/schemas/seller-profile.schema';
import * as bcrypt from 'bcrypt';

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
    const bucketName = process.env.MINIO_BUCKET_NAME || 'ekotest';
    const bucketExists = await minioService.bucketExists(bucketName);
    if (!bucketExists) {
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

async function createTestSeller(
  userModel: Model<User>,
  sellerProfileModel: Model<SellerProfile>,
  minioService: MinioService
): Promise<string> {
  try {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('test123', saltRounds);

    // Create user
    const user = new userModel({
      email: 'test_seller@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Seller',
      role: UserRole.SELLER,
      isEmailVerified: true,
      isApproved: true
    });

    const savedUser = await user.save();
    console.log('Test seller created with ID:', savedUser._id.toString());

    // Logo upload
    const logoUrl = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop';
    let logoUrlMinio = '';
    const logoBuffer = await downloadImage(logoUrl);
    if (logoBuffer) {
      const logoFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-test-seller-logo.jpg`;
      logoUrlMinio = await uploadImageToMinio(minioService, logoBuffer, logoFileName);
    }

    // Create seller profile
    const sellerProfile = new sellerProfileModel({
      sellerId: savedUser._id,
      storeName: 'Test Store',
      description: 'Test store for debugging',
      phoneNumber: '+905551234567',
      address: 'Test Address, Istanbul',
      website: 'https://teststore.com',
      isActive: true,
      logoUrl: logoUrlMinio
    });

    await sellerProfile.save();
    console.log('Test seller profile created');

    return savedUser._id.toString();
  } catch (error) {
    console.error(` Error creating test seller:`, error);
    throw error;
  }
}

async function createTestProduct(
  productModel: Model<Product>,
  categoryModel: Model<Category>,
  minioService: MinioService,
  sellerId: string
): Promise<string> {
  try {
    // Find first category
    const category = await categoryModel.findOne();
    if (!category) {
      throw new Error('No category found');
    }

    // Download and upload image
    const imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';
    const imageBuffer = await downloadImage(imageUrl);

    let uploadedImageUrl = '';
    if (imageBuffer) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-test-product.jpg`;
      uploadedImageUrl = await uploadImageToMinio(minioService, imageBuffer, fileName);
    }

    // Create product
    const product = new productModel({
      name: 'Test Product',
      description: 'This is a test product for debugging',
      price: 100,
      stock: 50,
      imageUrls: [uploadedImageUrl],
      category: category._id,
      sellerId: new Types.ObjectId(sellerId),
      specifications: {
        'Marka': 'Test',
        'Model': 'Test Product',
        'Garanti': '1 Yıl',
        'Menşei': 'Türkiye'
      },
      tags: ['Test', 'Debug', 'Product'],
      variants: [
        { color: 'Siyah', size: 'Standart', stock: 30, price: 100 },
        { color: 'Beyaz', size: 'Standart', stock: 20, price: 100 }
      ],
      isFeatured: false,
      isActive: true
    });

    const savedProduct = await product.save();
    console.log('Test product created with ID:', savedProduct._id.toString());
    return savedProduct._id.toString();
  } catch (error) {
    console.error(` Error creating test product:`, error);
    throw error;
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const minioService = app.get(MinioService);

  const userModel = app.get<Model<User>>('UserModel');
  const sellerProfileModel = app.get<Model<SellerProfile>>('SellerProfileModel');
  const productModel = app.get<Model<Product>>('ProductModel');
  const categoryModel = app.get<Model<Category>>('CategoryModel');

  try {
    // Create test seller
    const sellerId = await createTestSeller(userModel, sellerProfileModel, minioService);

    // Create test product
    await createTestProduct(productModel, categoryModel, minioService, sellerId);

    console.log('Test seller and product created successfully!');
    console.log('Seller ID:', sellerId);
  } catch (error) {
    console.error(' Error during creation process:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
