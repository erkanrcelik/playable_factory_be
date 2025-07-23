# Playable Factory E-Ticaret Platformu

## 📋 Proje Açıklaması

Playable Factory, modern e-ticaret ihtiyaçlarını karşılamak üzere tasarlanmış kapsamlı bir platformdur. Bu monorepo, satıcıların ürünlerini yönetebileceği, müşterilerin alışveriş yapabileceği ve adminlerin platformu kontrol edebileceği tam bir ekosistem sunar.

### 🎯 Ana Özellikler

- **Çok Rollü Kimlik Doğrulama**: Admin, Satıcı ve Müşteri rolleri
- **Ürün Yönetimi**: Resim yükleme, kategori sistemi, stok takibi
- **Sipariş Sistemi**: Sepet yönetimi, ödeme, teslimat takibi
- **Kampanya Sistemi**: Platform ve satıcı kampanyaları
- **Öneri Sistemi**: AI tabanlı kişiselleştirilmiş öneriler
- **Admin Paneli**: Platform yönetimi ve moderasyon
- **Satıcı Paneli**: Satıcılar için kapsamlı dashboard
- **Müşteri Arayüzü**: Modern alışveriş deneyimi

## 🏗️ Sistem Mimarisi

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

## 🗄️ Veritabanı Şeması

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

## 🚀 Kurulum Talimatları

### Ön Gereksinimler

- **Node.js** 18.17.0 veya üzeri
- **npm** 9.0.0 veya üzeri
- **MongoDB** 5.0 veya üzeri
- **Redis** 6.0 veya üzeri
- **MinIO** (dosya depolama için)

### 1. Repository'yi Klonlayın

```bash
git clone <repository-url>
cd monırepo
```

### 2. Backend API Kurulumu

```bash
cd playable_factory_be
npm install
```

#### Backend Environment Variables (.env)

```env
# Uygulama
NODE_ENV=development
PORT=8003

# Veritabanı
MONGODB_URI=mongodb://localhost:27017/playable_factory

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production
JWT_REFRESH_EXPIRES_IN=30d

# MinIO Yapılandırması
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=playable-factory
MINIO_USE_SSL=false

# E-posta (isteğe bağlı)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS
CORS_ORIGIN=http://localhost:8000,http://localhost:8001,http://localhost:8002
```

### 3. Admin Panel Kurulumu

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

### 4. Frontend (Müşteri) Kurulumu

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

### 5. Satıcı Paneli Kurulumu

```bash
cd ../playable_factory_seller
npm install
```

#### Satıcı Paneli Environment Variables (.env.local)

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

## 🗄️ Veritabanı Kurulumu

### MongoDB Kurulumu

#### macOS (Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Docker ile MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Redis Kurulumu

#### macOS (Homebrew)
```bash
brew install redis
brew services start redis
```

#### Docker ile Redis
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### MinIO Kurulumu

#### Docker ile MinIO
```bash
docker run -d -p 9000:9000 -p 9001:9001 --name minio \
  -e "MINIO_ROOT_USER=your-access-key" \
  -e "MINIO_ROOT_PASSWORD=your-secret-key" \
  minio/minio server /data --console-address ":9001"
```

## 🚀 Uygulamayı Çalıştırma

### 1. Backend API'yi Başlatın

```bash
cd playable_factory_be
npm run start:dev
```

Backend API `http://localhost:3003` adresinde çalışacak.

### 2. Admin Panel'i Başlatın

```bash
cd ../playable_factory_admin
npm run dev
```

Admin Panel `http://localhost:3000` adresinde çalışacak.

### 3. Frontend (Müşteri) Uygulamasını Başlatın

```bash
cd ../playable_factory_fe
npm run dev
```

Frontend uygulaması `http://localhost:3001` adresinde çalışacak.

### 4. Satıcı Paneli'ni Başlatın

```bash
cd ../playable_factory_seller
npm run dev
```

Satıcı Paneli `http://localhost:3002` adresinde çalışacak.

## 🗃️ Veritabanı Seeding

### Demo Verilerini Yükleyin

Backend klasöründe seeding script'ini çalıştırın:

```bash
cd playable_factory_be
npm run seed
```

### Demo Kullanıcıları

#### Admin Kullanıcısı
```
Email: admin@playablefactory.com
Password: admin123
Role: ADMIN
```

#### Satıcı Kullanıcısı
```
Email: seller@playablefactory.com
Password: seller123
Role: SELLER
```

#### Müşteri Kullanıcısı
```
Email: customer@playablefactory.com
Password: customer123
Role: CUSTOMER
```

## 📋 Özellikler Listesi

### 🔐 Kimlik Doğrulama ve Güvenlik

#### ✅ Temel Özellikler
- JWT tabanlı kimlik doğrulama
- Refresh token desteği
- Çok rollü sistem (Admin, Seller, Customer)
- Şifre hashleme (bcrypt)
- E-posta doğrulama
- Şifre sıfırlama
- Oturum yönetimi
- CORS yapılandırması

#### ✅ Güvenlik Özellikleri
- Rate limiting
- Input validation (Zod)
- SQL injection koruması
- XSS koruması
- CSRF koruması
- Güvenli dosya yükleme

### 👥 Kullanıcı Yönetimi

#### ✅ Admin Özellikleri
- Kullanıcı listesi görüntüleme
- Kullanıcı detayları ve profil yönetimi
- Kullanıcı durumu kontrolü (aktif/pasif)
- Rol tabanlı yetkilendirme
- Kullanıcı arama ve filtreleme
- Toplu kullanıcı işlemleri

#### ✅ Satıcı Özellikleri
- Satıcı profil yönetimi
- Satıcı onay süreçleri
- Satıcı performans takibi
- Satıcı hesap durumu yönetimi
- Satıcı istatistikleri

#### ✅ Müşteri Özellikleri
- Profil yönetimi
- Adres yönetimi
- Sipariş geçmişi
- İstek listesi yönetimi
- Değerlendirme geçmişi

### 🛍️ Ürün Yönetimi

#### ✅ Temel Özellikler
- Ürün CRUD işlemleri
- Kategori sistemi
- Ürün resmi yükleme (MinIO)
- Stok takibi
- Fiyat yönetimi
- İndirim sistemi

#### ✅ Gelişmiş Özellikler
- Ürün varyantları
- Ürün özellikleri
- Ürün etiketleri
- Ürün arama ve filtreleme
- Ürün değerlendirmeleri
- Ürün görüntülenme sayısı

### 📢 Kampanya Sistemi

#### ✅ Platform Kampanyaları
- Platform seviyesinde kampanya oluşturma
- Kategori bazlı kampanyalar
- Ürün bazlı kampanyalar
- Tarih bazlı aktivasyon
- Kullanım limiti

#### ✅ Satıcı Kampanyaları
- Satıcı özel kampanyaları
- Satıcı kampanya yönetimi
- Kampanya performans takibi
- Kampanya durumu kontrolü

### 🛒 Sipariş Sistemi

#### ✅ Sepet Yönetimi
- Sepete ürün ekleme/çıkarma
- Sepet güncelleme
- Sepet temizleme
- Kampanya uygulama
- Sepet hesaplamaları

#### ✅ Sipariş İşleme
- Sipariş oluşturma
- Sipariş durumu takibi
- Teslimat adresi yönetimi
- Fatura adresi yönetimi
- Sipariş notları

#### ✅ Ödeme Sistemi
- Ödeme yöntemi seçimi
- Ödeme durumu takibi
- Fatura oluşturma
- İade işlemleri

### 📊 Dashboard ve Analitikler

#### ✅ Admin Dashboard
- Sistem sağlığı metrikleri
- Kullanıcı istatistikleri
- Satış istatistikleri
- Platform performansı
- Son aktiviteler

#### ✅ Satıcı Dashboard
- Satıcı performans metrikleri
- Ürün satış istatistikleri
- Sipariş analitikleri
- Gelir raporları
- Müşteri analitikleri

#### ✅ Müşteri Dashboard
- Sipariş takibi
- Favori ürünler
- Alışveriş geçmişi
- Adres yönetimi

### 🔍 Arama ve Öneriler

#### ✅ Arama Sistemi
- Ürün arama
- Kategori bazlı arama
- Fiyat aralığı filtreleme
- Satıcı bazlı filtreleme
- Gelişmiş filtreleme

#### ✅ Öneri Sistemi
- Kişiselleştirilmiş öneriler
- Popüler ürünler
- Birlikte alınan ürünler
- Kategori önerileri
- Redis tabanlı önbellekleme

### 📱 Kullanıcı Arayüzü

#### ✅ Admin Panel
- Modern dashboard tasarımı
- Responsive tasarım
- Karanlık/aydınlık tema
- Toast bildirimleri
- Loading göstergeleri

#### ✅ Satıcı Paneli
- Satıcı odaklı dashboard
- Ürün yönetimi arayüzü
- Sipariş yönetimi
- Kampanya yönetimi
- Profil yönetimi

#### ✅ Müşteri Arayüzü
- Modern alışveriş deneyimi
- Ürün detay sayfaları
- Sepet yönetimi
- Sipariş takibi
- Değerlendirme sistemi

### 🗄️ Dosya Yönetimi

#### ✅ MinIO Entegrasyonu
- Resim yükleme
- Dosya depolama
- Güvenli dosya erişimi
- Presigned URL'ler
- Otomatik dosya temizliği

### 📧 Bildirim Sistemi

#### ✅ E-posta Bildirimleri
- Kayıt onayı
- Şifre sıfırlama
- Sipariş durumu güncellemeleri
- Kampanya bildirimleri

### 🔧 Geliştirici Araçları

#### ✅ Kod Kalitesi
- ESLint konfigürasyonu
- Prettier formatlama
- TypeScript tip kontrolü
- JSDoc dokümantasyonu

#### ✅ Test Araçları
- Unit testler
- E2E testler
- Test coverage
- Mock veriler

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
# PM2'yi yükleyin
npm install -g pm2

# Backend'i başlatın
pm2 start dist/main.js --name "playable-factory-api"

# Frontend'leri başlatın
pm2 start npm --name "admin-panel" -- run start
pm2 start npm --name "frontend" -- run start
pm2 start npm --name "seller-panel" -- run start

# PM2 yapılandırmasını kaydedin
pm2 save
pm2 startup
```

## 🧪 Test

### Backend Testleri
```bash
cd playable_factory_be
npm run test
npm run test:e2e
npm run test:cov
```

### Frontend Testleri
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
cd "playable_factory_be kopyası"
npm run lint
npm run lint:fix

# Frontend'ler
cd ../playable_factory_admin
npm run lint

cd ../playable_factory_fe
npm run lint

cd ../playable_factory_seller
npm run lint
```

## 📚 API Dokümantasyonu

### Kimlik Doğrulama Endpoint'leri
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Kullanıcı çıkışı
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/forgot-password` - Şifre sıfırlama talebi
- `POST /api/auth/reset-password` - Şifre sıfırlama
- `GET /api/auth/profile` - Kullanıcı profili

### Ürün Endpoint'leri
- `GET /api/products` - Ürün listesi
- `GET /api/products/:id` - Ürün detayı
- `POST /api/seller/products` - Ürün oluşturma
- `PUT /api/seller/products/:id` - Ürün güncelleme
- `DELETE /api/seller/products/:id` - Ürün silme

### Sipariş Endpoint'leri
- `GET /api/orders` - Sipariş listesi
- `GET /api/orders/:id` - Sipariş detayı
- `POST /api/orders` - Sipariş oluşturma
- `PUT /api/seller/orders/:id/status` - Sipariş durumu güncelleme

### Kampanya Endpoint'leri
- `GET /api/campaigns` - Kampanya listesi
- `POST /api/seller/campaigns` - Kampanya oluşturma
- `PUT /api/seller/campaigns/:id` - Kampanya güncelleme
- `DELETE /api/seller/campaigns/:id` - Kampanya silme

### Admin Endpoint'leri
- `GET /api/admin/users` - Kullanıcı yönetimi
- `GET /api/admin/sellers` - Satıcı yönetimi
- `GET /api/admin/products` - Ürün moderasyonu
- `GET /api/admin/orders` - Sipariş yönetimi
- `GET /api/admin/dashboard` - Dashboard istatistikleri

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'e push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Email**: admin@playablefactory.com
- **Website**: https://playablefactory.com
- **Documentation**: https://docs.playablefactory.com

---

**Not**: Bu platform sadece eğitim ve geliştirme amaçlıdır. Üretim ortamında kullanmadan önce güvenlik önlemlerini gözden geçirin ve gerekli güncellemeleri yapın. 