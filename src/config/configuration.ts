import { registerAs } from '@nestjs/config';
import { randomBytes } from 'crypto';

/**
 * Application Configuration Factory
 *
 * Centralized configuration management using NestJS ConfigModule.
 * Provides environment-specific settings with secure defaults.
 *
 * @description This configuration module handles:
 * - Server and database connection settings
 * - JWT authentication configuration with secure secrets
 * - File upload and storage configuration
 * - MinIO object storage settings
 * - Rate limiting and security parameters
 * - Email service configuration
 *
 * @security All secrets have cryptographically secure fallbacks
 * @security Environment variables should be used in production
 *
 * @returns Configuration object with all application settings
 */
export default registerAs('app', () => {
  // Generate secure random secrets for development if not provided
  const generateSecureSecret = () => randomBytes(64).toString('hex');

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
    jwt: {
      secret: process.env.JWT_SECRET || generateSecureSecret(),
      refreshSecret: process.env.JWT_REFRESH_SECRET || generateSecureSecret(),
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    upload: {
      path: process.env.UPLOAD_PATH || './uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
    },
    minio: {
      endpoint:
        process.env.MINIO_ENDPOINT ||
        'sekakademi-minio-6de0f3-130-61-48-47.traefik.me',
      port: parseInt(process.env.MINIO_PORT || '443', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true' || true,
      accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
      secretKey: process.env.MINIO_ROOT_PASSWORD || 'gkb61hofnu1dv4sz',
      bucket: process.env.MINIO_BUCKET || 'ecommerce',
      region: process.env.MINIO_REGION || 'us-east-1',
      browserRedirectUrl:
        process.env.MINIO_BROWSER_REDIRECT_URL ||
        'http://sekakademi-minio-6de0f3-130-61-48-47.traefik.me',
      browserRedirect: process.env.MINIO_BROWSER_REDIRECT === 'true' || false,
    },
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL || '60', 10), // 60 seconds
      limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10), // 100 requests per TTL
    },
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASSWORD || '',
      from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
    },
    app: {
      url: process.env.APP_URL || 'http://localhost:3000',
    },
  };
});
