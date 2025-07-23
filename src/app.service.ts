import { Injectable } from '@nestjs/common';

/**
 * Application Core Service
 *
 * Provides core application functionality and business logic.
 * Serves as the main service layer for basic application operations.
 *
 * @description This service handles:
 * - Basic application messaging
 * - Core business logic initialization
 * - Application-wide utilities
 *
 * @example
 * ```typescript
 * @Controller()
 * export class AppController {
 *   constructor(private readonly appService: AppService) {}
 *
 *   @Get()
 *   getHello(): string {
 *     return this.appService.getHello();
 *   }
 * }
 * ```
 */
@Injectable()
export class AppService {
  /**
   * Get application welcome message
   *
   * @returns A welcome message string indicating the API is operational
   *
   * @example
   * ```typescript
   * const message = appService.getHello();
   * ```
   */
  getHello(): string {
    return 'Hello World!';
  }
}
