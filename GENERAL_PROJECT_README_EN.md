# Playable Factory E-Commerce Platform

## 📋 Project Description

Playable Factory is a comprehensive platform designed to meet modern e-commerce needs. This monorepo provides a complete ecosystem where sellers can manage their products, customers can shop, and admins can control the platform.

### 🎯 Main Features

- **Multi-Role Authentication**: Admin, Seller, and Customer roles
- **Product Management**: Image upload, category system, stock tracking
- **Order System**: Cart management, payment, delivery tracking
- **Campaign System**: Platform and seller campaigns
- **Recommendation System**: AI-based personalized recommendations
- **Admin Panel**: Platform management and moderation
- **Seller Panel**: Comprehensive dashboard for sellers
- **Customer Interface**: Modern shopping experience

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │  Frontend (FE)  │    │ Seller Panel    │
│   (Next.js)     │    │   (Next.js)     │    │   (Next.js)     │
│   Port: 8000    │    │   Port: 8001    │    │   Port: 8002    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Backend API (BE)       │
                    │      (NestJS)             │
                    │      Port: 8003           │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      MongoDB + Redis      │
                    │        + MinIO           │
                    │   Ports: 27017, 6379     │
                    └───────────────────────────┘
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: ['ADMIN', 'SELLER', 'CUSTOMER'], required),
  isActive: Boolean (default: true),
  isEmailVerified: Boolean (default: false),
  profileImage: String,
  phone: String,
  addresses: [{
    _id: ObjectId,
    type: String (enum: ['HOME', 'WORK', 'OTHER']),
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  imageUrl: String,
  parentId: ObjectId (ref: 'Category'),
  isActive: Boolean (default: true),
  order: Number,
  productCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  price: Number (required),
  discountedPrice: Number,
  categoryId: ObjectId (ref: 'Category', required),
  sellerId: ObjectId (ref: 'User', required),
  images: [String],
  stock: Number (default: 0),
  isActive: Boolean (default: true),
  isFeatured: Boolean (default: false),
  tags: [String],
  specifications: [{
    key: String,
    value: String
  }],
  viewCount: Number (default: 0),
  averageRating: Number (default: 0),
  reviewCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Campaigns Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  type: String (enum: ['PLATFORM', 'SELLER'], required),
  discountType: String (enum: ['PERCENTAGE', 'FIXED'], required),
  discountValue: Number (required),
  startDate: Date (required),
  endDate: Date (required),
  isActive: Boolean (default: true),
  sellerId: ObjectId (ref: 'User'), // null for platform campaigns
  applicableProducts: [ObjectId], // Product IDs
  applicableCategories: [ObjectId], // Category IDs
  minOrderAmount: Number,
  maxDiscountAmount: Number,
  usageLimit: Number,
  usedCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: 'User', required),
  items: [{
    productId: ObjectId (ref: 'Product', required),
    quantity: Number (required),
    price: Number (required),
    discountedPrice: Number,
    sellerId: ObjectId (ref: 'User', required)
  }],
  status: String (enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], default: 'PENDING'),
  subtotal: Number (required),
  totalDiscount: Number (default: 0),
  shippingCost: Number (default: 0),
  total: Number (required),
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  appliedCampaigns: [{
    campaignId: ObjectId (ref: 'Campaign'),
    discountAmount: Number
  }],
  paymentMethod: String,
  paymentStatus: String (enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING'),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Reviews Collection
```javascript
{
  _id: ObjectId,
  productId: ObjectId (ref: 'Product', required),
  customerId: ObjectId (ref: 'User', required),
  orderId: ObjectId (ref: 'Order', required),
  rating: Number (min: 1, max: 5, required),
  title: String,
  comment: String,
  images: [String],
  isApproved: Boolean (default: true),
  helpfulCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  items: [{
    productId: ObjectId (ref: 'Product', required),
    quantity: Number (required),
    addedAt: Date
  }],
  appliedCampaigns: [{
    campaignId: ObjectId (ref: 'Campaign'),
    discountAmount: Number
  }],
  updatedAt: Date
}
```

### Wishlist Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  productId: ObjectId (ref: 'Product', required),
  addedAt: Date
}
```

### BlacklistedTokens Collection
```javascript
{
  _id: ObjectId,
  token: String (required),
  expiresAt: Date (required),
  createdAt: Date
}
```

## 🚀 Installation Instructions

### Prerequisites

- **Node.js** 18.17.0 or higher
- **npm** 9.0.0 or higher
- **MongoDB** 5.0 or higher
- **Redis** 6.0 or higher
- **MinIO** (for file storage)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd monorepo
```

### 2. Backend API Setup

```bash
cd playable_factory_be
npm install
```

#### Backend Environment Variables (.env)

```env
# Application
NODE_ENV=development
PORT=8003

# Database
MONGODB_URI=mongodb://localhost:27017/playable_factory

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production
JWT_REFRESH_EXPIRES_IN=30d

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=playable-factory
MINIO_USE_SSL=false

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS
CORS_ORIGIN=http://localhost:8000,http://localhost:8001,http://localhost:8002
```

### 3. Admin Panel Setup

```bash
cd ../playable_factory_admin
npm install
```

#### Admin Panel Environment Variables (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8003/api
NEXT_PUBLIC_API_TIMEOUT=10000

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-key
NEXT_PUBLIC_REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Application
NEXT_PUBLIC_APP_NAME=Playable Factory Admin
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NODE_ENV=development
```

### 4. Frontend (Customer) Setup

```bash
cd ../playable_factory_fe
npm install
```

#### Frontend Environment Variables (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8003/api
NEXT_PUBLIC_API_TIMEOUT=10000

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-key
NEXT_PUBLIC_REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Application
NEXT_PUBLIC_APP_NAME=Playable Factory
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NODE_ENV=development
```

### 5. Seller Panel Setup

```bash
cd ../playable_factory_seller
npm install
```

#### Seller Panel Environment Variables (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8003/api
NEXT_PUBLIC_API_TIMEOUT=10000

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-key
NEXT_PUBLIC_REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Application
NEXT_PUBLIC_APP_NAME=Playable Factory Seller
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NODE_ENV=development
```

## 🗄️ Database Setup

### MongoDB Setup

#### macOS (Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### MongoDB with Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Redis Setup

#### macOS (Homebrew)
```bash
brew install redis
brew services start redis
```

#### Redis with Docker
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### MinIO Setup

#### MinIO with Docker
```bash
docker run -d -p 9000:9000 -p 9001:9001 --name minio \
  -e "MINIO_ROOT_USER=your-access-key" \
  -e "MINIO_ROOT_PASSWORD=your-secret-key" \
  minio/minio server /data --console-address ":9001"
```

## 🚀 Running the Application

### 1. Start Backend API

```bash
cd playable_factory_be
npm run start:dev
```

Backend API will run at `http://localhost:3003`.

### 2. Start Admin Panel

```bash
cd ../playable_factory_admin
npm run dev
```

Admin Panel will run at `http://localhost:3000`.

### 3. Start Frontend (Customer) Application

```bash
cd ../playable_factory_fe
npm run dev
```

Frontend application will run at `http://localhost:3001`.

### 4. Start Seller Panel

```bash
cd ../playable_factory_seller
npm run dev
```

Seller Panel will run at `http://localhost:3002`.

## 🗃️ Database Seeding

### Load Demo Data

Run the seeding script in the backend folder:

```bash
cd playable_factory_be
npm run seed
```

### Demo Users

#### Admin User
```
Email: admin@playablefactory.com
Password: admin123
Role: ADMIN
```

#### Seller User
```
Email: seller@playablefactory.com
Password: seller123
Role: SELLER
```

#### Customer User
```
Email: customer@playablefactory.com
Password: customer123
Role: CUSTOMER
```

## 📋 Features List

### 🔐 Authentication and Security

#### ✅ Core Features
- JWT-based authentication
- Refresh token support
- Multi-role system (Admin, Seller, Customer)
- Password hashing (bcrypt)
- Email verification
- Password reset
- Session management
- CORS configuration

#### ✅ Security Features
- Rate limiting
- Input validation (Zod)
- SQL injection protection
- XSS protection
- CSRF protection
- Secure file upload

### 👥 User Management

#### ✅ Admin Features
- User list viewing
- User details and profile management
- User status control (active/inactive)
- Role-based authorization
- User search and filtering
- Bulk user operations

#### ✅ Seller Features
- Seller profile management
- Seller approval processes
- Seller performance tracking
- Seller account status management
- Seller statistics

#### ✅ Customer Features
- Profile management
- Address management
- Order history
- Wishlist management
- Review history

### 🛍️ Product Management

#### ✅ Core Features
- Product CRUD operations
- Category system
- Product image upload (MinIO)
- Stock tracking
- Price management
- Discount system

#### ✅ Advanced Features
- Product variants
- Product specifications
- Product tags
- Product search and filtering
- Product reviews
- Product view count

### 📢 Campaign System

#### ✅ Platform Campaigns
- Platform-level campaign creation
- Category-based campaigns
- Product-based campaigns
- Date-based activation
- Usage limits

#### ✅ Seller Campaigns
- Seller-specific campaigns
- Seller campaign management
- Campaign performance tracking
- Campaign status control

### 🛒 Order System

#### ✅ Cart Management
- Add/remove items from cart
- Cart updates
- Cart clearing
- Campaign application
- Cart calculations

#### ✅ Order Processing
- Order creation
- Order status tracking
- Delivery address management
- Billing address management
- Order notes

#### ✅ Payment System
- Payment method selection
- Payment status tracking
- Invoice generation
- Return processing

### 📊 Dashboard and Analytics

#### ✅ Admin Dashboard
- System health metrics
- User statistics
- Sales statistics
- Platform performance
- Recent activities

#### ✅ Seller Dashboard
- Seller performance metrics
- Product sales statistics
- Order analytics
- Revenue reports
- Customer analytics

#### ✅ Customer Dashboard
- Order tracking
- Favorite products
- Shopping history
- Address management

### 🔍 Search and Recommendations

#### ✅ Search System
- Product search
- Category-based search
- Price range filtering
- Seller-based filtering
- Advanced filtering

#### ✅ Recommendation System
- Personalized recommendations
- Popular products
- Frequently bought together
- Category recommendations
- Redis-based caching

### 📱 User Interface

#### ✅ Admin Panel
- Modern dashboard design
- Responsive design
- Dark/light theme
- Toast notifications
- Loading indicators

#### ✅ Seller Panel
- Seller-focused dashboard
- Product management interface
- Order management
- Campaign management
- Profile management

#### ✅ Customer Interface
- Modern shopping experience
- Product detail pages
- Cart management
- Order tracking
- Review system

### 🗄️ File Management

#### ✅ MinIO Integration
- Image upload
- File storage
- Secure file access
- Presigned URLs
- Automatic file cleanup

### 📧 Notification System

#### ✅ Email Notifications
- Registration confirmation
- Password reset
- Order status updates
- Campaign notifications

### 🔧 Developer Tools

#### ✅ Code Quality
- ESLint configuration
- Prettier formatting
- TypeScript type checking
- JSDoc documentation

#### ✅ Testing Tools
- Unit tests
- E2E tests
- Test coverage
- Mock data

## 🚀 Deployment

### Production Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=3003
MONGODB_URI=mongodb://your-production-mongodb-uri
REDIS_HOST=your-redis-host
REDIS_PORT=6379
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
MINIO_ENDPOINT=your-minio-endpoint
MINIO_ACCESS_KEY=your-production-access-key
MINIO_SECRET_KEY=your-production-secret-key
MINIO_BUCKET_NAME=playable-factory-prod
MINIO_USE_SSL=true
CORS_ORIGIN=https://your-domain.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=Playable Factory
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

### Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3003

CMD ["npm", "run", "start:prod"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

### PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start Backend
pm2 start dist/main.js --name "playable-factory-api"

# Start Frontends
pm2 start npm --name "admin-panel" -- run start
pm2 start npm --name "frontend" -- run start
pm2 start npm --name "seller-panel" -- run start

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🧪 Testing

### Backend Tests
```bash
cd playable_factory_be
npm run test
npm run test:e2e
npm run test:cov
```

### Frontend Tests
```bash
cd ../playable_factory_admin
npm run test

cd ../playable_factory_fe
npm run test

cd ../playable_factory_seller
npm run test
```

### Linting
```bash
# Backend
cd playable_factory_be
npm run lint
npm run lint:fix

# Frontends
cd ../playable_factory_admin
npm run lint

cd ../playable_factory_fe
npm run lint

cd ../playable_factory_seller
npm run lint
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/profile` - User profile

### Product Endpoints
- `GET /api/products` - Product list
- `GET /api/products/:id` - Product details
- `POST /api/seller/products` - Create product
- `PUT /api/seller/products/:id` - Update product
- `DELETE /api/seller/products/:id` - Delete product

### Order Endpoints
- `GET /api/orders` - Order list
- `GET /api/orders/:id` - Order details
- `POST /api/orders` - Create order
- `PUT /api/seller/orders/:id/status` - Update order status

### Campaign Endpoints
- `GET /api/campaigns` - Campaign list
- `POST /api/seller/campaigns` - Create campaign
- `PUT /api/seller/campaigns/:id` - Update campaign
- `DELETE /api/seller/campaigns/:id` - Delete campaign

### Admin Endpoints
- `GET /api/admin/users` - User management
- `GET /api/admin/sellers` - Seller management
- `GET /api/admin/products` - Product moderation
- `GET /api/admin/orders` - Order management
- `GET /api/admin/dashboard` - Dashboard statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

- **Email**: admin@playablefactory.com
- **Website**: https://playablefactory.com
- **Documentation**: https://docs.playablefactory.com

---

**Note**: This platform is for educational and development purposes only. Please review security measures and make necessary updates before using in production environment. 