# 🔐 Auth API Dokümantasyonu

Bu dokümantasyon, E-Ticaret backend API'sinin kimlik doğrulama (Authentication) endpoint'lerini açıklamaktadır.

## 📋 API Endpoint'leri

### 1. 🆕 Kullanıcı Kaydı
**POST** `/api/auth/register`

Kullanıcı kaydı yapar ve email doğrulama linki gönderir.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+905551234567",
  "role": "customer"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer",
    "isEmailVerified": false
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

### 2. 🔑 Kullanıcı Girişi
**POST** `/api/auth/login`

Kullanıcı girişi yapar ve JWT token'ları döner.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer",
    "isEmailVerified": true
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

### 3. 🔄 Token Yenileme
**POST** `/api/auth/refresh`

Access token'ı yeniler.

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response (200):**
```json
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "new-jwt-refresh-token"
}
```

### 4. 📧 Email Doğrulama
**GET** `/api/auth/verify-email?token=verification-token`

Email adresini doğrular.

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

### 5. 🔄 Email Doğrulama Tekrar Gönder
**POST** `/api/auth/resend-verification`

Email doğrulama linkini tekrar gönderir.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Verification email sent successfully"
}
```

### 6. 🔒 Şifre Sıfırlama İsteği
**POST** `/api/auth/forgot-password`

Şifre sıfırlama linki gönderir.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account with this email exists, a password reset link has been sent"
}
```

### 7. 🔑 Şifre Sıfırlama
**POST** `/api/auth/reset-password`

Token ile şifreyi sıfırlar.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

## 🔐 Güvenlik Özellikleri

### JWT Authentication
- **Access Token**: 15 dakika geçerli
- **Refresh Token**: 7 gün geçerli
- **Secret Key**: Environment variable'dan alınır

### Password Security
- **bcrypt** ile şifre hashleme (12 salt rounds)
- Minimum 6 karakter şifre zorunluluğu
- Güvenli şifre sıfırlama token'ları

### Rate Limiting
- Auth endpoint'leri için rate limiting
- IP bazlı tracking
- Brute force saldırılarına karşı koruma

### Email Security
- Email doğrulama token'ları (24 saat geçerli)
- Şifre sıfırlama token'ları (1 saat geçerli)
- Güvenli token generation (crypto.randomBytes)

### Input Validation
- **Zod** ile type-safe validation
- XSS koruması
- Input sanitization

## 🛡️ Güvenlik Headers

API tüm isteklerde aşağıdaki güvenlik header'larını döner:

- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: default-src 'self'`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`

## 📧 Email Konfigürasyonu

Email servisi için environment variable'lar:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@ecommerce.com
APP_URL=http://localhost:3000
```

## 🚀 Kullanım Örnekleri

### Frontend'den Kullanım

```javascript
// Kayıt
const register = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Giriş
const login = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

// Protected request
const getProfile = async (token) => {
  const response = await fetch('/api/users/profile', {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

## 🔧 Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@ecommerce.com

# App Configuration
APP_URL=http://localhost:3000
NODE_ENV=development

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

## 🧪 Test

Auth endpoint'lerini test etmek için:

```bash
# Test çalıştırma
npm run test src/auth/auth.controller.spec.ts

# E2E test
npm run test:e2e
```

## 📝 Notlar

1. **Email Doğrulama**: Kayıt sonrası otomatik email gönderilir
2. **Şifre Sıfırlama**: Güvenlik için kullanıcının varlığı gizlenir
3. **Rate Limiting**: Auth endpoint'leri için özel rate limiting
4. **Token Expiration**: Token'lar otomatik olarak expire olur
5. **Security Headers**: Tüm isteklerde güvenlik header'ları 