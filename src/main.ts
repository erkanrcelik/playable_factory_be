import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

/**
 * Bootstrap function to initialize and configure the NestJS application
 *
 * @description This function sets up:
 * - Security middleware (Helmet, CORS)
 * - Global API prefix and validation
 * - Global exception handling
 * - Swagger documentation
 * - Environment-specific configurations
 *
 * @security Implements comprehensive security measures including:
 * - Content Security Policy via Helmet
 * - CORS configuration for cross-origin requests
 * - Input validation and sanitization
 * - Rate limiting protection
 * - Standardized error handling
 *
 * @throws {Error} If application fails to start
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS configuration - allow all origins
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true, // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
  });

  // Global exception filter for standardized error handling
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Security middleware - protect against common vulnerabilities
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );



  // Global API prefix for versioning and organization
  app.setGlobalPrefix('api');

  // Global validation pipe with security-focused settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO instances
      disableErrorMessages:
        configService.get<string>('app.nodeEnv') === 'production',
      validateCustomDecorators: true,
    }),
  );

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription(
      'Comprehensive NestJS E-Commerce Backend API with Admin, Seller, and Customer interfaces',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Admin', 'Administrative operations')
    .addTag('Seller', 'Seller portal operations')
    .addTag('Customer', 'Customer-facing operations')
    .addTag('Products', 'Product management')
    .addTag('Orders', 'Order processing')
    .addTag('Categories', 'Category management')
    .addTag('Campaigns', 'Marketing campaigns')
    .addTag('Reviews', 'Product reviews and ratings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error('Failed to start application:', error.message);
    console.error(error.stack);
  } else {
    console.error('Failed to start application:', String(error));
  }
  process.exit(1);
});
