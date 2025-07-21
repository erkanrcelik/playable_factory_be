import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    try {
      // Test MongoDB connection
      const dbState = this.connection.readyState;
      const dbStatus: Record<number, string> = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      };

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus[dbState] || 'unknown',
          readyState: dbState,
        },
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        status: 'error',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
