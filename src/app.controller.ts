import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

/**
 * Application Root Controller
 *
 * Provides basic application endpoints including health checks and system status.
 * Used for monitoring, debugging, and basic application information.
 *
 * @description This controller provides:
 * - Welcome message endpoint
 * - Health check with database connectivity
 * - System status and uptime information
 * - Environment information
 */
@ApiTags('Application')
@Controller()
export class AppController {
  /**
   * Initialize the AppController with required services
   *
   * @param appService - Core application service
   * @param connection - MongoDB connection for health checks
   */
  constructor(
    private readonly appService: AppService,
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
  ) {}

  /**
   * Get welcome message
   *
   * @returns Simple welcome message string
   *
   * @example
   * GET /
   * Returns: "Hello World!"
   */
  @Get()
  @ApiOperation({
    summary: 'Get welcome message',
    description: 'Returns a simple welcome message to verify API is running',
  })
  @ApiResponse({
    status: 200,
    description: 'Welcome message',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Get application health status
   *
   * @returns Comprehensive health check including database connectivity, uptime, and environment info
   *
   * @throws {Error} Returns error status if any critical service is down
   *
   * @example
   * GET /health
   * Returns:
   * {
   *   "status": "ok",
   *   "timestamp": "2024-01-01T00:00:00.000Z",
   *   "database": {
   *     "status": "connected",
   *     "readyState": 1
   *   },
   *   "uptime": 3600,
   *   "environment": "development"
   * }
   */
  @Get('health')
  @HealthCheck()
  @ApiOperation({
    summary: 'Get application health status',
    description:
      'Returns comprehensive health information including database status and system health',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
        error: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'down' },
                message: { type: 'string' },
              },
            },
          },
        },
        details: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Health check failed - Service unavailable',
  })
  getHealth() {
    return this.health.check([() => this.mongoose.pingCheck('database')]);
  }
}
