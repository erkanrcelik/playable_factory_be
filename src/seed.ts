import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

// Define schemas for seeding
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'seller', 'customer'],
      default: 'customer',
    },
    phoneNumber: String,
    addresses: [
      {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
      },
    ],
    preferences: {
      favoriteCategories: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      ],
    },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    imageUrls: [{ type: String }],
    specifications: { type: Object, default: {} },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    variants: [
      {
        color: String,
        size: String,
        stock: { type: Number, required: true, min: 0 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

async function seed() {
  // Connect to MongoDB
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
  );

  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    const db = mongoose.connection.db;
    if (db) {
      await db.dropDatabase();
      console.log('🗑️  Cleared existing data');
    }

    // Create models
    const UserModel = mongoose.model('User', userSchema);
    const CategoryModel = mongoose.model('Category', categorySchema);
    const ProductModel = mongoose.model('Product', productSchema);

    // Create admin user
    const adminPassword = await bcrypt.hash('123456', 12);
    const admin = await UserModel.create({
      email: 'admin@test.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });

    // Create seller user
    const sellerPassword = await bcrypt.hash('123456', 12);
    const seller = await UserModel.create({
      email: 'seller@test.com',
      password: sellerPassword,
      firstName: 'Seller',
      lastName: 'User',
      role: 'seller',
      isEmailVerified: true,
      isActive: true,
    });

    // Create customer user
    const customerPassword = await bcrypt.hash('123456', 12);
    const customer = await UserModel.create({
      email: 'user@test.com',
      password: customerPassword,
      firstName: 'Customer',
      lastName: 'User',
      role: 'customer',
      isEmailVerified: true,
      isActive: true,
    });

    console.log('👥 Created users');

    // Create categories
    const categories = await CategoryModel.create([
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
      },
      {
        name: 'Clothing',
        description: 'Fashion and apparel',
        isActive: true,
      },
      {
        name: 'Books',
        description: 'Books and literature',
        isActive: true,
      },
      {
        name: 'Home & Garden',
        description: 'Home improvement and gardening',
        isActive: true,
      },
      {
        name: 'Sports',
        description: 'Sports equipment and accessories',
        isActive: true,
      },
      {
        name: 'Beauty',
        description: 'Beauty and personal care',
        isActive: true,
      },
      {
        name: 'Toys',
        description: 'Toys and games',
        isActive: true,
      },
      {
        name: 'Automotive',
        description: 'Automotive parts and accessories',
        isActive: true,
      },
    ]);

    console.log('🏷️  Created categories');

    // Create sample products
    const electronicsCategory = categories.find(
      (c) => c.name === 'Electronics',
    );
    const clothingCategory = categories.find((c) => c.name === 'Clothing');

    if (!electronicsCategory || !clothingCategory) {
      throw new Error('Required categories not found');
    }

    await ProductModel.create([
      {
        name: 'Smartphone',
        description: 'Latest smartphone with advanced features',
        price: 999.99,
        category: electronicsCategory._id,
        sellerId: seller._id,
        imageUrls: ['https://via.placeholder.com/300x300?text=Smartphone'],
        specifications: {
          'Screen Size': '6.1 inch',
          Storage: '128GB',
          Color: 'Black',
        },
        tags: ['smartphone', 'mobile', 'electronics'],
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Laptop',
        description: 'High-performance laptop for work and gaming',
        price: 1499.99,
        category: electronicsCategory._id,
        sellerId: seller._id,
        imageUrls: ['https://via.placeholder.com/300x300?text=Laptop'],
        specifications: {
          Processor: 'Intel i7',
          RAM: '16GB',
          Storage: '512GB SSD',
        },
        tags: ['laptop', 'computer', 'electronics'],
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 29.99,
        category: clothingCategory._id,
        sellerId: seller._id,
        imageUrls: ['https://via.placeholder.com/300x300?text=T-Shirt'],
        specifications: {
          Material: 'Cotton',
          Size: 'M',
          Color: 'White',
        },
        tags: ['clothing', 't-shirt', 'fashion'],
        isActive: true,
      },
    ]);

    console.log('📦 Created sample products');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Demo Users:');
    console.log('👑 Admin: admin@test.com / 123456');
    console.log('🏪 Seller: seller@test.com / 123456');
    console.log('👤 Customer: user@test.com / 123456');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
