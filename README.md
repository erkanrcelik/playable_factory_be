# E-Commerce Backend (NestJS)

## Açıklama
Bu proje, admin, müşteri ve satıcı rolleri içeren tam kapsamlı bir e-ticaret platformudur. NestJS, MongoDB ve JWT kullanılarak geliştirilmiştir.

## Kullanılan Teknolojiler
- **NestJS 10+** - Backend framework
- **TypeScript** - Programlama dili
- **MongoDB + Mongoose** - Veritabanı
- **JWT Auth** - Kimlik doğrulama (Access + Refresh Token)
- **Bcrypt** - Şifre hashleme
- **Zod** - Validation
- **Swagger** - API dökümantasyonu
- **Helmet + CORS** - Güvenlik
- **Rate Limiting** - API koruması

## Kurulum

### Gereksinimler
- Node.js 18+
- MongoDB (local veya cloud)

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Environment dosyasını oluşturun:**
```bash
cp .env.example .env
```

3. **Environment değişkenlerini düzenleyin:**
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

4. **Veritabanını seed edin:**
```bash
npx ts-node src/seed.ts
```

5. **Uygulamayı başlatın:**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Dökümantasyonu
Uygulama çalıştıktan sonra Swagger dökümantasyonuna erişebilirsiniz:
- **URL:** http://localhost:3000/api-docs

## Demo Kullanıcılar
Seed script çalıştırıldıktan sonra aşağıdaki kullanıcılar oluşturulur:

### 👑 Admin
- **Email:** admin@test.com
- **Şifre:** 123456
- **Yetkiler:** Tüm sistem yönetimi

### 🏪 Seller
- **Email:** seller@test.com
- **Şifre:** 123456
- **Yetkiler:** Ürün yönetimi, sipariş görüntüleme

### 👤 Customer
- **Email:** user@test.com
- **Şifre:** 123456
- **Yetkiler:** Alışveriş, yorum yapma

## API Endpoints

### 🔐 Auth
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/refresh` - Token yenileme

### 👤 Users
- `GET /api/users/profile` - Profil görüntüleme
- `PUT /api/users/profile` - Profil güncelleme
- `POST /api/users/addresses` - Adres ekleme
- `DELETE /api/users/addresses/:index` - Adres silme
- `PUT /api/users/addresses/:index` - Adres güncelleme

### 🏷️ Categories
- `GET /api/categories` - Kategorileri listele
- `GET /api/categories/:id` - Kategori detayı
- `POST /api/categories` - Kategori oluştur (Admin)
- `PUT /api/categories/:id` - Kategori güncelle (Admin)
- `DELETE /api/categories/:id` - Kategori sil (Admin)

### 📦 Products
- `GET /api/products` - Ürünleri listele (filtreleme ile)
- `GET /api/products/featured` - Öne çıkan ürünler
- `GET /api/products/:id` - Ürün detayı
- `POST /api/products` - Ürün oluştur (Seller/Admin)
- `PUT /api/products/:id` - Ürün güncelle (Seller/Admin)
- `DELETE /api/products/:id` - Ürün sil (Seller/Admin)
- `GET /api/products/seller/my-products` - Satıcının ürünleri

## Proje Yapısı
```
src/
├── auth/                 # Kimlik doğrulama
├── users/               # Kullanıcı yönetimi
├── products/            # Ürün yönetimi
├── categories/          # Kategori yönetimi
├── cart/               # Sepet modülü
├── orders/             # Sipariş modülü
├── reviews/            # Yorum sistemi
├── recommendations/    # Tavsiye sistemi
├── campaigns/          # Kampanya modülü
├── sellers/            # Satıcı paneli
├── schemas/            # MongoDB şemaları
├── common/             # Ortak bileşenler
│   ├── guards/         # Guard'lar
│   ├── decorators/     # Decorator'lar
│   ├── pipes/          # Pipe'lar
│   └── utils/          # Yardımcı fonksiyonlar
└── config/             # Konfigürasyon
```

## Güvenlik Önlemleri
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Role-based access control (RBAC)
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS koruması
- ✅ Helmet güvenlik başlıkları
- ✅ Input validation (Zod)

## Geliştirme

### Yeni modül ekleme
```bash
# NestJS CLI ile modül oluşturma
nest generate module module-name
nest generate controller module-name
nest generate service module-name
```

### Test çalıştırma
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Lisans
Bu proje MIT lisansı altında lisanslanmıştır.

## Katkıda Bulunma
1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun
