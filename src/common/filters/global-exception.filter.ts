import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global Exception Filter
 *
 * Provides standardized error handling across the entire application.
 * Ensures consistent error response format and proper logging.
 *
 * @description This filter handles:
 * - HTTP exceptions with proper status codes
 * - Unexpected errors with 500 status
 * - Request/response logging for debugging
 * - Security-focused error message sanitization
 *
 * @security Sanitizes error messages in production to prevent information leakage
 * @logging Logs all errors with request context for debugging
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  /**
   * Handle and format exceptions
   *
   * @param exception - The caught exception
   * @param host - The argument host containing request/response context
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    let errorCode: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseMessage = exception.getResponse();

      if (typeof responseMessage === 'string') {
        message = responseMessage;
      } else if (
        typeof responseMessage === 'object' &&
        responseMessage !== null
      ) {
        message = (responseMessage as any).message || responseMessage;
        errorCode = (responseMessage as any).errorCode;
      } else {
        message = 'An error occurred';
      }
    } else {
      // Unexpected error
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : String(exception);

      // Log the full error for debugging
      this.logger.error(
        `Unexpected error: ${String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
        `${request.method} ${request.url}`,
      );
    }

    // Log HTTP exceptions for monitoring
    if (status >= 400) {
      this.logger.warn(
        `HTTP ${status} Error: ${JSON.stringify(message)} - ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(errorCode && { errorCode }),
      ...(process.env.NODE_ENV === 'development' && {
        requestId: request.headers['x-request-id'] || 'unknown',
        userAgent: request.headers['user-agent'],
      }),
    };

    response.status(status).json(errorResponse);
  }
}
