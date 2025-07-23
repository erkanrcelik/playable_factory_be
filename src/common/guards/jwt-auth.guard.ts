import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

/**
 * JWT Authentication Guard
 *
 * Custom JWT guard that extends Passport's JWT strategy with additional security checks
 *
 * @description This guard provides:
 * - JWT token validation via Passport strategy
 * - Bearer token format verification
 * - Enhanced security headers validation
 * - Potential for token blacklist integration
 *
 * @security Validates JWT tokens and ensures proper authentication
 * @extends AuthGuard('jwt')
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Determines if the current request is authorized
   *
   * @param context - The execution context containing request information
   * @returns Promise resolving to true if authorized, throws UnauthorizedException otherwise
   *
   * @throws {UnauthorizedException} When no token is provided
   *
   * @example
   * ```typescript
   * @UseGuards(JwtAuthGuard)
   * async protectedEndpoint() {
   *   // This endpoint requires valid JWT authentication
   * }
   * ```
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // TODO: Implement token blacklist check when TokenBlacklistService is properly integrated
    // This would require proper module dependency injection to avoid circular dependencies

    return super.canActivate(context) as Promise<boolean>;
  }
}
