# Playable Factory Backend API

## Proje Açıklaması

Playable Factory Backend, NestJS ve MongoDB kullanılarak geliştirilmiş kapsamlı bir e-ticaret platformu API'sidir. Uygulama, satıcıların ürünlerini, kampanyalarını ve siparişlerini yönetebileceği, müşterilerin ise ürünleri görüntüleyebileceği, alışveriş yapabileceği ve yorum bırakabileceği çevrimiçi pazar yeri için tam bir backend çözümü sunar.

### Ana Özellikler

- **Çok Rollü Kimlik Doğrulama Sistemi** - JWT kimlik doğrulaması ile Müşteri, Satıcı ve Admin rolleri
- **Ürün Yönetimi** - Resim yükleme ile birlikte ürünler için tam CRUD işlemleri
- **Kampanya Yönetimi** - Satıcı ve platform seviyesinde kampanya oluşturma ve yönetimi
- **Sipariş İşleme** - Sepetten teslimata kadar tam sipariş yaşam döngüsü
- **Değerlendirme Sistemi** - Otomatik onay ile ürün değerlendirmeleri
- **Arama ve Öneriler** - Redis vektör benzerliği ile gelişmiş arama
- **Genel Satıcı API'si** - Müşterilerin satıcı bilgilerine erişimi için genel endpoint'ler
- **Admin Paneli** - Platform yönetimi için kapsamlı admin paneli
- **Dosya Yönetimi** - Resim ve dosya depolama için MinIO entegrasyonu

## Teknoloji Stack'i

### Temel Framework
- **NestJS** - Ölçeklenebilir sunucu tarafı uygulamalar oluşturmak için progresif Node.js framework'ü
- **TypeScript** - Daha iyi geliştirme deneyimi için tip güvenli JavaScript
- **Node.js** - JavaScript çalışma zamanı ortamı

### Veritabanı ve Önbellekleme
- **MongoDB** - Mongoose ODM ile NoSQL veritabanı
- **Redis** - Önbellekleme ve vektör benzerliği için bellek içi veri yapısı deposu

### Kimlik Doğrulama ve Güvenlik
- **JWT (JSON Web Tokens)** - Durumsuz kimlik doğrulama
- **bcrypt** - Şifre hashleme
- **Passport.js** - Kimlik doğrulama middleware'i

### Dosya Depolama
- **MinIO** - Dinamik bucket yapılandırması ile dosya yüklemeleri için nesne depolama servisi
- **Multer** - Dosya yükleme middleware'i
- **Ortam tabanlı bucket yönetimi** - Bucket isimleri `MINIO_BUCKET_NAME` ortam değişkeni ile yapılandırılır

### Doğrulama ve Dokümantasyon
- **Zod** - TypeScript öncelikli şema doğrulama
- **JSDoc** - Kod dokümantasyonu

### Geliştirme Araçları
- **ESLint** - Kod linting
- **Jest** - Test framework'ü
- **Swagger** - API dokümantasyonu (planlanmış)

## Kurulum Talimatları

### Ön Gereksinimler

- **Node.js** 18.0.0 veya daha yüksek versiyon
- **MongoDB** 5.0 veya daha yüksek versiyon
- **Redis** 6.0 veya daha yüksek versiyon
- **MinIO** sunucusu (dosya depolama için)

### Adım Adım Kurulum

1. **Repository'yi klonlayın**
   ```bash
   git clone <repository-url>
   cd playable_factory_be
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Ortam Yapılandırması**

   Örnek ortam dosyasını kopyalayın:
   ```bash
   cp .env.example .env
   ```

   `.env` dosyasını yapılandırmanızla güncelleyin:
   ```env
   # Uygulama
   NODE_ENV=development
   PORT=3000

   # Veritabanı
   MONGODB_URI=mongodb://localhost:27017/playable_factory

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d

   # MinIO Yapılandırması
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=your-access-key
   MINIO_SECRET_KEY=your-secret-key
   MINIO_BUCKET_NAME=ekotest
   MINIO_USE_SSL=false

   # E-posta (isteğe bağlı)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Veritabanı Kurulumu**

   MongoDB'yi başlatın:
   ```bash
   # macOS ile Homebrew
   brew services start mongodb-community

   # Veya Docker kullanarak
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Redis Kurulumu**
   ```bash
   # macOS ile Homebrew
   brew services start redis

   # Veya Docker kullanarak
   docker run -d -p 6379:6379 --name redis redis:latest
   ```

6. **MinIO Kurulumu**
   ```bash
   # Docker kullanarak
   docker run -d -p 9000:9000 -p 9001:9001 --name minio \
     -e "MINIO_ROOT_USER=your-access-key" \
     -e "MINIO_ROOT_PASSWORD=your-secret-key" \
     minio/minio server /data --console-address ":9001"

   # Bucket oluşturma (isteğe bağlı - otomatik oluşturulacak)
   # MinIO konsoluna http://localhost:9001 adresinden erişin
   # your-access-key / your-secret-key ile giriş yapın
   # 'ekotest' adında bucket oluşturun (veya .env'de MINIO_BUCKET_NAME'i güncelleyin)
   ```

## Uygulamayı Çalıştırma

### Geliştirme Modu
```bash
# Uygulamayı geliştirme modunda başlatın
npm run start:dev
```

### Üretim Modu
```bash
# Uygulamayı derleyin
npm run build

# Uygulamayı üretim modunda başlatın
npm run start:prod
```

### Test
```bash
# Unit testleri çalıştırın
npm run test

# E2E testleri çalıştırın
npm run test:e2e

# Test coverage çalıştırın
npm run test:cov
```

### Linting
```bash
# ESLint çalıştırın
npm run lint

# Linting sorunlarını düzeltin
npm run lint:fix
```

## Demo Kullanıcıları

### Admin Kullanıcısı
```
E-posta: admin@playablefactory.com
Şifre: admin123
Rol: ADMIN
```

### Satıcı Kullanıcısı
```
E-posta: seller@playablefactory.com
Şifre: seller123
Rol: SELLER
```

### Müşteri Kullanıcısı
```
E-posta: customer@playablefactory.com
Şifre: customer123
Rol: CUSTOMER
```

## MinIO Dosya Depolama Yapılandırması

### Ortam Değişkenleri
Uygulama, farklı ortamlar arasında esneklik sağlamak için MinIO yapılandırmasında ortam değişkenleri kullanır:

```env
# MinIO Yapılandırması
MINIO_ENDPOINT=localhost          # MinIO sunucu endpoint'i
MINIO_PORT=9000                   # MinIO sunucu portu
MINIO_ACCESS_KEY=your-access-key  # MinIO erişim anahtarı
MINIO_SECRET_KEY=your-secret-key  # MinIO gizli anahtarı
MINIO_BUCKET_NAME=ekotest         # Varsayılan bucket adı (yapılandırılabilir)
MINIO_USE_SSL=false               # SSL yapılandırması
```

### Dinamik Bucket Yönetimi
- **Ortam tabanlı bucket isimleri**: Bucket isimleri `MINIO_BUCKET_NAME` ortam değişkeni ile yapılandırılır
- **Sabit kodlanmış bucket isimleri yok**: Tüm servisler sabit kodlanmış bucket isimleri yerine ortam değişkenini kullanır
- **Yedekleme desteği**: Ortam değişkeni ayarlanmamışsa 'ekotest' varsayılanına döner
- **Çoklu ortam desteği**: Geliştirme, test ve üretim için farklı bucket isimleri

### Dosya Yükleme Özellikleri
- **UUID önekli dosya isimleri**: Dosya adı çakışmalarını önler
- **Tam HTTPS URL'leri**: Depolanan URL'ler doğrudan erişim için tam HTTPS yolunu içerir
- **Otomatik bucket oluşturma**: Bucket'lar yoksa otomatik olarak oluşturulur
- **Presigned URL'ler**: Geçici URL'ler ile güvenli dosya erişimi
- **Dosya silme**: Veritabanından dosyalar silindiğinde otomatik temizlik

### Desteklenen Dosya Türleri
- **Resimler**: JPG, PNG, GIF, WebP
- **Belgeler**: PDF, DOC, DOCX
- **Maksimum dosya boyutu**: Dosya başına 10MB

### MinIO Endpoint'leri
- `POST /api/minio/upload/:bucketName` - Belirtilen bucket'a dosya yükle
- `GET /api/minio/download/:bucketName/:filename` - Bucket'tan dosya indir
- `GET /api/minio/buckets` - Tüm mevcut bucket'ları listele
- `GET /api/minio/bucket/:bucketName/exists` - Bucket'ın var olup olmadığını kontrol et

## API Dokümantasyonu

### Kimlik Doğrulama Endpoint'leri
- `POST /auth/register` - Kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi
- `POST /auth/logout` - Kullanıcı çıkışı
- `GET /auth/profile` - Kullanıcı profilini al

### Genel Endpoint'ler
- `GET /sellers` - Sayfalama ile tüm aktif satıcıları listele
- `GET /sellers/detail/:sellerId` - Detaylı satıcı bilgilerini al
- `GET /products` - Filtreleme ile tüm ürünleri listele
- `GET /campaigns` - Aktif kampanyaları listele
- `GET /categories` - Tüm kategorileri listele

### Müşteri Endpoint'leri
- `POST /cart/add` - Sepete ürün ekle
- `GET /cart` - Kullanıcı sepetini al
- `POST /orders` - Yeni sipariş oluştur
- `GET /orders` - Kullanıcı siparişlerini al
- `POST /reviews` - Ürün değerlendirmesi oluştur

### Satıcı Endpoint'leri
- `GET /seller/products` - Satıcının ürünlerini al
- `POST /seller/products` - Yeni ürün oluştur
- `PUT /seller/products/:id` - Ürün güncelle
- `GET /seller/orders` - Satıcının siparişlerini al
- `PUT /seller/orders/:id/status` - Sipariş durumunu güncelle
- `GET /seller/campaigns` - Satıcının kampanyalarını al
- `POST /seller/campaigns` - Yeni kampanya oluştur

### Admin Endpoint'leri
- `GET /admin/users` - Tüm kullanıcıları listele
- `GET /admin/sellers` - Tüm satıcıları listele
- `GET /admin/products` - Tüm ürünleri listele
- `GET /admin/orders` - Tüm siparişleri listele
- `GET /admin/campaigns` - Tüm kampanyaları listele
- `GET /admin/dashboard` - Admin paneli istatistikleri

## Veritabanı Seeding

### Temel Seeding Script'i
Veritabanını başlangıç verileriyle doldurmak için bir seeding script'i oluşturun:

```typescript
// scripts/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { CategoriesService } from '../src/categories/categories.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const categoriesService = app.get(CategoriesService);

  // Demo kullanıcıları oluştur
  await usersService.create({
    email: 'admin@playablefactory.com',
    password: 'admin123',
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User'
  });

  await usersService.create({
    email: 'seller@playablefactory.com',
    password: 'seller123',
    role: 'SELLER',
    firstName: 'Demo',
    lastName: 'Seller'
  });

  await usersService.create({
    email: 'customer@playablefactory.com',
    password: 'customer123',
    role: 'CUSTOMER',
    firstName: 'Demo',
    lastName: 'Customer'
  });

  // Demo kategorileri oluştur
  await categoriesService.create({
    name: 'Elektronik',
    description: 'Elektronik cihazlar ve gadget\'lar'
  });

  await categoriesService.create({
    name: 'Giyim',
    description: 'Moda ve giyim'
  });

  console.log('Veritabanı başarıyla dolduruldu!');
  await app.close();
}

seed().catch(console.error);
```

Seeding script'ini çalıştırın:
```bash
npm run seed
```

## Özellikler Listesi

### Temel Özellikler
- ✅ Çok rollü kimlik doğrulama sistemi (Müşteri, Satıcı, Admin)
- ✅ Refresh token'larla JWT tabanlı kimlik doğrulama
- ✅ Rol tabanlı erişim kontrolü (RBAC)
- ✅ Kullanıcı profil yönetimi
- ✅ Kullanıcılar için adres yönetimi

### Ürün Yönetimi
- ✅ Ürünler için tam CRUD işlemleri
- ✅ MinIO ile ürün resmi yükleme
- ✅ Ürün kategorilendirme
- ✅ Ürün arama ve filtreleme
- ✅ Ürün değerlendirmeleri ve puanlama

### Satıcı Özellikleri
- ✅ Satıcı profil yönetimi
- ✅ Satıcılar için ürün yönetimi
- ✅ Satıcılar için sipariş yönetimi
- ✅ Kampanya oluşturma ve yönetimi
- ✅ İstatistiklerle satıcı paneli
- ✅ Müşteri erişimi için genel satıcı API'si

### Müşteri Özellikleri
- ✅ Ürün görüntüleme ve arama
- ✅ Alışveriş sepeti işlevselliği
- ✅ Sipariş verme ve takip
- ✅ Ürün değerlendirmeleri ve puanlama
- ✅ İstek listesi yönetimi
- ✅ Adres yönetimi

### Admin Özellikleri
- ✅ Kullanıcı yönetimi
- ✅ Satıcı onaylama ve yönetimi
- ✅ Ürün moderasyonu
- ✅ Sipariş yönetimi
- ✅ Kampanya yönetimi
- ✅ Platform istatistikleri paneli

### Gelişmiş Özellikler
- ✅ Redis tabanlı önbellekleme
- ✅ Öneriler için vektör benzerliği
- ✅ Gelişmiş arama işlevselliği
- ✅ MinIO ile dosya yükleme
- ✅ E-posta bildirimleri
- ✅ Sayfalama ve filtreleme
- ✅ Hata işleme ve loglama
- ✅ Zod ile girdi doğrulama
- ✅ Kapsamlı JSDoc dokümantasyonu

### Bonus Özellikler
- ✅ Genel satıcı API endpoint'leri
- ✅ Otomatik değerlendirme onay sistemi
- ✅ Kapsamlı hata işleme
- ✅ Uluslararasılaştırma desteği
- ✅ Performans optimizasyonu
- ✅ Güvenlik iyileştirmeleri

## Deployment Rehberi

### Üretim için Ortam Değişkenleri
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
# PM2'yi yükleyin
npm install -g pm2

# Uygulamayı başlatın
pm2 start dist/main.js --name "playable-factory-api"

# PM2 yapılandırmasını kaydedin
pm2 save

# PM2'yi sistem başlangıcında başlatmak için ayarlayın
pm2 startup
```

## Proje Yapısı

```
src/
├── admin/                 # Admin özel modüller
├── auth/                  # Kimlik doğrulama modülü
├── campaigns/             # Kampanya yönetimi
├── cart/                  # Alışveriş sepeti işlevselliği
├── categories/            # Ürün kategorileri
├── common/                # Paylaşılan yardımcı programlar ve dekoratörler
├── config/                # Yapılandırma yönetimi
├── homepage/              # Ana sayfa verileri
├── minio/                 # Dosya depolama servisi
├── orders/                # Sipariş yönetimi
├── products/              # Ürün yönetimi
├── recommendations/       # Ürün önerileri
├── reviews/               # Değerlendirme sistemi
├── schemas/               # MongoDB şemaları
├── search/                # Arama işlevselliği
├── sellers/               # Satıcı özel modüller
└── users/                 # Kullanıcı yönetimi
```

## Katkıda Bulunma

1. Repository'yi fork edin
2. Bir özellik dalı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika bir özellik ekle'`)
4. Dalı push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için LICENSE dosyasına bakın.
