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
import { Review } from '../src/schemas/review.schema';
import * as bcrypt from 'bcrypt';
import { sellers } from './data/sellers';
import { customers } from './data/customers';
import { productsByCategory } from './data/products';

interface ProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryName: string;
  specifications: Record<string, string>;
  tags: string[];
  variants: Array<{
    color?: string;
    size?: string;
    stock: number;
    price: number;
  }>;
  isFeatured: boolean;
}


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

async function createSeller(
  userModel: Model<User>,
  sellerProfileModel: Model<SellerProfile>,
  sellerData: any,
  minioService: MinioService,
  logoUrl: string
): Promise<string> {
  try {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(sellerData.password, saltRounds);

    // Create user
    const user = new userModel({
      email: sellerData.email,
      password: hashedPassword,
      firstName: sellerData.firstName,
      lastName: sellerData.lastName,
      role: UserRole.SELLER,
      isEmailVerified: true,
      isApproved: true
    });

    const savedUser = await user.save();

    // Logo upload
    let logoUrlMinio = '';
    if (logoUrl) {
      const logoBuffer = await downloadImage(logoUrl);
      if (logoBuffer) {
        const logoFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-seller-logo.jpg`;
        logoUrlMinio = await uploadImageToMinio(minioService, logoBuffer, logoFileName);
      }
    }

    // Create seller profile
    const sellerProfile = new sellerProfileModel({
      sellerId: savedUser._id,
      storeName: sellerData.companyName,
      description: sellerData.description,
      phoneNumber: sellerData.phone,
      address: sellerData.address,
      website: sellerData.website,
      isActive: true,
      logoUrl: logoUrlMinio
    });

    await sellerProfile.save();

    return savedUser._id.toString();
  } catch (error) {
    console.error(` Error creating seller:`, error);
    throw error;
  }
}

async function createProduct(
  productModel: Model<Product>,
  categoryModel: Model<Category>,
  minioService: MinioService,
  productData: ProductData,
  sellerId: string
): Promise<string> {
  try {
    // Find category
    const category = await categoryModel.findOne({ name: productData.categoryName });
    if (!category) {
      throw new Error(`Category not found: ${productData.categoryName}`);
    }

    // Download and upload image
    const imageBuffer = await downloadImage(productData.imageUrl);

    let uploadedImageUrl = '';
    if (imageBuffer) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${productData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;

      uploadedImageUrl = await uploadImageToMinio(minioService, imageBuffer, fileName);
    }

    // Create product
    const product = new productModel({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      imageUrls: [uploadedImageUrl],
      category: category._id,
      sellerId: new Types.ObjectId(sellerId),
      specifications: productData.specifications,
      tags: productData.tags,
      variants: productData.variants,
      isFeatured: productData.isFeatured,
      isActive: true
    });

    const savedProduct = await product.save();
    return savedProduct._id.toString();
  } catch (error) {
    console.error(` Error creating product ${productData.name}:`, error);
    throw error;
  }
}

async function createReviews(
  reviewModel: Model<Review>,
  productId: string,
  userIds: string[]
): Promise<void> {
  const reviewComments = [
    'Harika bir ürün, çok memnun kaldım!',
    'Kalitesi gerçekten çok iyi, tavsiye ederim.',
    'Beklentilerimi karşıladı, teşekkürler.',
    'Hızlı kargo ve güzel paketleme.',
    'Fiyat/performans açısından mükemmel.',
    'İkinci kez alıyorum, çok başarılı.',
    'Arkadaşlarıma da tavsiye ettim.',
    'Kullanımı kolay ve pratik.',
    'Dayanıklı ve kaliteli malzeme.',
    'Müşteri hizmetleri de çok ilgili.'
  ];

  const ratings = [4, 5, 4, 5, 4, 5, 4, 5, 4, 5];

  // Create 2-3 reviews for each product
  const numReviews = Math.floor(Math.random() * 2) + 2; // 2-3 reviews

  for (let i = 0; i < numReviews; i++) {
    const randomUserIndex = Math.floor(Math.random() * userIds.length);
    const randomCommentIndex = Math.floor(Math.random() * reviewComments.length);
    const randomRatingIndex = Math.floor(Math.random() * ratings.length);

    const review = new reviewModel({
      productId: productId,
      userId: userIds[randomUserIndex],
      rating: ratings[randomRatingIndex],
      comment: reviewComments[randomCommentIndex],
      isApproved: true
    });

    await review.save();
  }

}



async function createCustomer(userModel: Model<User>, customerData: any): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(customerData.password, saltRounds);
  const user = new userModel({
    email: customerData.email,
    password: hashedPassword,
    firstName: customerData.firstName,
    lastName: customerData.lastName,
    role: UserRole.CUSTOMER,
    isEmailVerified: true,
    isActive: true
  });
  const savedUser = await user.save();
  return savedUser._id.toString();
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const minioService = app.get(MinioService);

  const userModel = app.get<Model<User>>('UserModel');
  const sellerProfileModel = app.get<Model<SellerProfile>>('SellerProfileModel');
  const productModel = app.get<Model<Product>>('ProductModel');
  const categoryModel = app.get<Model<Category>>('CategoryModel');
  const reviewModel = app.get<Model<Review>>('ReviewModel');

  try {
    // Önce müşteri kullanıcılarını oluştur
    const customerIds: string[] = [];
    for (const customerData of customers) {
      const customerId = await createCustomer(userModel, customerData);
      customerIds.push(customerId);
    }

    // Satıcıları oluştur
    const sellerIds: string[] = [];
    const sellerLogos = [
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop', // TechMart
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop', // Fashion House
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop', // Home Plus
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=400&fit=crop', // Sports World
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop'  // Lifestyle Store
    ];
    for (const sellerData of sellers) {
      const logoUrl = sellerLogos[sellerIds.length];
      const sellerId = await createSeller(userModel, sellerProfileModel, sellerData, minioService, logoUrl);
      sellerIds.push(sellerId);
    }

    // Her satıcı için ürünleri oluştur
    for (let sellerIndex = 0; sellerIndex < sellerIds.length; sellerIndex++) {
      const sellerId = sellerIds[sellerIndex];
      const sellerData = sellers[sellerIndex];
      let productCount = 0;
      for (const [categoryName, products] of Object.entries(productsByCategory)) {
        const startIndex = sellerIndex * 2;
        const productsForThisSeller = (products as any[]).slice(startIndex, startIndex + 2);
        for (const productDataRaw of productsForThisSeller) {
          const productData: any = productDataRaw;
          // Eksik alanları güvenli şekilde doldur
          const safeSpecifications = typeof productData.specifications === 'object' && productData.specifications !== null ? productData.specifications : {};
          const safeTags = Array.isArray(productData.tags) ? productData.tags : [];
          const enhancedProductData = {
            ...productData,
            categoryName: categoryName,
            specifications: {
              'Marka': productData.name.split(' ')[0],
              'Model': productData.name,
              'Garanti': '2 Yıl',
              'Menşei': 'Türkiye',
              ...safeSpecifications
            },
            tags: [categoryName, 'Yeni', 'Popüler', ...safeTags],
            variants: [
              { color: 'Siyah', size: 'Standart', stock: Math.floor(productData.stock * 0.6), price: productData.price },
              { color: 'Beyaz', size: 'Standart', stock: Math.floor(productData.stock * 0.4), price: productData.price + 500 }
            ],
            isFeatured: Math.random() > 0.7
          };
          const productId = await createProduct(productModel, categoryModel, minioService, enhancedProductData, sellerId);
          // Her ürüne 2-3 review ekle
          await createReviews(reviewModel, productId, customerIds);
          productCount++;
        }
      }
    }
  } catch (error) {
    console.error(' Error during creation process:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
