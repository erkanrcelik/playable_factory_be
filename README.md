# Playable Factory Backend API

## Project Description

Playable Factory Backend is a comprehensive e-commerce platform API built with NestJS and MongoDB. The application provides a complete backend solution for an online marketplace where sellers can manage their products, campaigns, and orders, while customers can browse products, make purchases, and leave reviews.

### Main Features

- **Multi-role Authentication System** - Customer, Seller, and Admin roles with JWT authentication
- **Product Management** - Complete CRUD operations for products with image upload
- **Campaign Management** - Seller and platform-level campaign creation and management
- **Order Processing** - Complete order lifecycle from cart to delivery
- **Review System** - Product reviews with automatic approval
- **Search & Recommendations** - Advanced search with Redis vector similarity
- **Public Seller API** - Public endpoints for customer access to seller information
- **Admin Dashboard** - Comprehensive admin panel for platform management
- **File Management** - MinIO integration for image and file storage

## Technology Stack

### Core Framework
- **NestJS** - Progressive Node.js framework for building scalable server-side applications
- **TypeScript** - Typed JavaScript for better development experience
- **Node.js** - JavaScript runtime environment

### Database & Caching
- **MongoDB** - NoSQL database with Mongoose ODM
- **Redis** - In-memory data structure store for caching and vector similarity

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcrypt** - Password hashing
- **Passport.js** - Authentication middleware

### File Storage
- **MinIO** - Object storage service for file uploads with dynamic bucket configuration
- **Multer** - File upload middleware
- **Environment-based bucket management** - Bucket names configured via `MINIO_BUCKET_NAME` environment variable

### Validation & Documentation
- **Zod** - TypeScript-first schema validation
- **JSDoc** - Code documentation

### Development Tools
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Swagger** - API documentation (planned)

## Installation Instructions

### Prerequisites

- **Node.js** version 18.0.0 or higher
- **MongoDB** version 5.0 or higher
- **Redis** version 6.0 or higher
- **MinIO** server (for file storage)

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd playable_factory_be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   # Application
   NODE_ENV=development
   PORT=3000

   # Database
   MONGODB_URI=mongodb://localhost:27017/playable_factory

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d

   # MinIO Configuration
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=your-access-key
   MINIO_SECRET_KEY=your-secret-key
   MINIO_BUCKET_NAME=ekotest
   MINIO_USE_SSL=false

   # Email (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Database Setup**

   Start MongoDB:
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Redis Setup**
   ```bash
   # macOS with Homebrew
   brew services start redis

   # Or using Docker
   docker run -d -p 6379:6379 --name redis redis:latest
   ```

6. **MinIO Setup**
   ```bash
   # Using Docker
   docker run -d -p 9000:9000 -p 9001:9001 --name minio \
     -e "MINIO_ROOT_USER=your-access-key" \
     -e "MINIO_ROOT_PASSWORD=your-secret-key" \
     minio/minio server /data --console-address ":9001"

   # Create bucket (optional - will be created automatically)
   # Access MinIO console at http://localhost:9001
   # Login with your-access-key / your-secret-key
   # Create bucket named 'ekotest' (or update MINIO_BUCKET_NAME in .env)
   ```

## Running the Application

### Development Mode
```bash
# Start the application in development mode
npm run start:dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start the application in production mode
npm run start:prod
```

### Testing
```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

### Linting
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

## Demo Credentials

### Admin User
```
Email: admin@playablefactory.com
Password: admin123
Role: ADMIN
```

### Seller User
```
Email: seller@playablefactory.com
Password: seller123
Role: SELLER
```

### Customer User
```
Email: customer@playablefactory.com
Password: customer123
Role: CUSTOMER
```

## MinIO File Storage Configuration

### Environment Variables
The application uses environment variables for MinIO configuration to ensure flexibility across different environments:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost          # MinIO server endpoint
MINIO_PORT=9000                   # MinIO server port
MINIO_ACCESS_KEY=your-access-key  # MinIO access key
MINIO_SECRET_KEY=your-secret-key  # MinIO secret key
MINIO_BUCKET_NAME=ekotest         # Default bucket name (configurable)
MINIO_USE_SSL=false               # SSL configuration
```

### Dynamic Bucket Management
- **Environment-based bucket names**: Bucket names are configured via `MINIO_BUCKET_NAME` environment variable
- **No hardcoded bucket names**: All services use the environment variable instead of hardcoded bucket names
- **Fallback support**: If environment variable is not set, defaults to 'ekotest'
- **Multi-environment support**: Different bucket names for development, staging, and production

### File Upload Features
- **UUID-prefixed filenames**: Prevents filename conflicts
- **Full HTTPS URLs**: Stored URLs include complete HTTPS path for direct access
- **Automatic bucket creation**: Buckets are created automatically if they don't exist
- **Presigned URLs**: Secure file access with temporary URLs
- **File deletion**: Automatic cleanup when files are deleted from database

### Supported File Types
- **Images**: JPG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX
- **Maximum file size**: 10MB per file

### MinIO Endpoints
- `POST /api/minio/upload/:bucketName` - Upload file to specified bucket
- `GET /api/minio/download/:bucketName/:filename` - Download file from bucket
- `GET /api/minio/buckets` - List all available buckets
- `GET /api/minio/bucket/:bucketName/exists` - Check if bucket exists

## API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile

### Public Endpoints
- `GET /sellers` - List all active sellers with pagination
- `GET /sellers/detail/:sellerId` - Get detailed seller information
- `GET /products` - List all products with filtering
- `GET /campaigns` - List active campaigns
- `GET /categories` - List all categories

### Customer Endpoints
- `POST /cart/add` - Add item to cart
- `GET /cart` - Get user cart
- `POST /orders` - Create new order
- `GET /orders` - Get user orders
- `POST /reviews` - Create product review

### Seller Endpoints
- `GET /seller/products` - Get seller's products
- `POST /seller/products` - Create new product
- `PUT /seller/products/:id` - Update product
- `GET /seller/orders` - Get seller's orders
- `PUT /seller/orders/:id/status` - Update order status
- `GET /seller/campaigns` - Get seller's campaigns
- `POST /seller/campaigns` - Create new campaign

### Admin Endpoints
- `GET /admin/users` - List all users
- `GET /admin/sellers` - List all sellers
- `GET /admin/products` - List all products
- `GET /admin/orders` - List all orders
- `GET /admin/campaigns` - List all campaigns
- `GET /admin/dashboard` - Admin dashboard statistics

## Database Seeding

### Comprehensive Seeding System
The project includes a complete seeding system with multiple scripts for different data types:

#### Available Seeding Scripts
```bash
# Create categories with MinIO image upload
npm run create-categories

# Create sellers, customers, products, and reviews with MinIO image upload
npm run create-sellers-products

# Create platform campaigns (admin campaigns for each category)
npm run create-platform-campaigns

# Create seller campaigns
npm run create-seller-campaigns

# Run all seeding scripts in sequence
npm run seed-all
```

#### Master Seeding Script
The `seed-all` command runs all scripts in the correct order:
1. **Categories** - Creates 8 main categories with MinIO images
2. **Sellers & Products** - Creates 5 sellers, 5 customers, 80 products, and 160-240 reviews
3. **Platform Campaigns** - Creates 8 platform-wide campaigns (one per category)
4. **Seller Campaigns** - Creates seller-specific campaigns

#### Data Structure Created
- **8 Categories**: Electronics, Clothing, Home and Garden, Sports, Books, Health and Beauty, Toys, Food
- **5 Sellers**: TechMart, Fashion House, Home Plus, Sports World, Lifestyle Store
- **5 Customers**: For review creation
- **80 Products**: 16 products per seller across all categories
- **160-240 Reviews**: 2-3 reviews per product
- **8 Platform Campaigns**: One campaign per category
- **All Images**: Uploaded to MinIO storage

#### Script Features
- **Error Handling**: Scripts continue even if some images fail to download
- **Duplicate Prevention**: Checks for existing data before creation
- **MinIO Integration**: All images are uploaded to MinIO storage
- **Realistic Data**: Products include specifications, variants, and tags
- **Review System**: Each product gets 2-3 realistic reviews from customers

#### Usage
```bash
# Quick setup - run all scripts
npm run seed-all

# Or run individual scripts
npm run create-categories
npm run create-sellers-products
npm run create-platform-campaigns
npm run create-seller-campaigns
```

#### Data Files
The seeding system uses organized data files in `scripts/data/`:
- `customers.ts` - Customer data for reviews
- `sellers.ts` - Seller profiles and information
- `products.ts` - Product data organized by category

## Features List

### Core Features
-  Multi-role authentication system (Customer, Seller, Admin)
-  JWT-based authentication with refresh tokens
-  Role-based access control (RBAC)
-  User profile management
-  Address management for users

### Product Management
-  Complete CRUD operations for products
-  Product image upload with MinIO
-  Product categorization
-  Product search and filtering
-  Product reviews and ratings

### Seller Features
-  Seller profile management
-  Product management for sellers
-  Order management for sellers
-  Campaign creation and management
-  Seller dashboard with statistics
-  Public seller API for customer access

### Customer Features
-  Product browsing and search
-  Shopping cart functionality
-  Order placement and tracking
-  Product reviews and ratings
-  Wishlist management
-  Address management

### Admin Features
-  User management
-  Seller approval and management
-  Product moderation
-  Order management
-  Campaign management
-  Platform statistics dashboard

### Advanced Features
-  Redis-based caching
-  Vector similarity for recommendations
-  Advanced search functionality
-  File upload with MinIO
-  Email notifications
-  Pagination and filtering
-  Error handling and logging
-  Input validation with Zod
-  Comprehensive JSDoc documentation

### Bonus Features
-  Public seller API endpoints
-  Automatic review approval system
-  Comprehensive error handling
-  Internationalization support
-  Performance optimization
-  Security enhancements

## Deployment Guide

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-mongodb-uri
REDIS_HOST=your-redis-host
REDIS_PORT=6379
JWT_SECRET=your-production-jwt-secret
MINIO_ENDPOINT=your-minio-endpoint
MINIO_ACCESS_KEY=your-production-access-key
MINIO_SECRET_KEY=your-production-secret-key
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start dist/main.js --name "playable-factory-api"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Project Structure

```
src/
├── admin/                 # Admin-specific modules
├── auth/                  # Authentication module
├── campaigns/             # Campaign management
├── cart/                  # Shopping cart functionality
├── categories/            # Product categories
├── common/                # Shared utilities and decorators
├── config/                # Configuration management
├── homepage/              # Homepage data
├── minio/                 # File storage service
├── orders/                # Order management
├── products/              # Product management
├── recommendations/       # Product recommendations
├── reviews/               # Review system
├── schemas/               # MongoDB schemas
├── search/                # Search functionality
├── sellers/               # Seller-specific modules
└── users/                 # User management
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
