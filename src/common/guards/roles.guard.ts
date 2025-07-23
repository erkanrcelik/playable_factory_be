import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../schemas/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Guard
 *
 * Validates user roles and permissions for protected endpoints
 *
 * @description This guard provides:
 * - Role-based access control (RBAC)
 * - Returns 401 for both missing auth and role mismatches
 * - Integration with JWT authentication
 *
 * @security Ensures users have appropriate roles for endpoint access
 * @throws {UnauthorizedException} When user is not authenticated or has wrong role (401)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the current user has the required role(s) to access the endpoint
   *
   * @param context - The execution context containing request information
   * @returns true if user has required role, throws exception otherwise
   *
   * @throws {UnauthorizedException} When no user is authenticated or wrong role
   *
   * @example
   * ```typescript
   * @UseGuards(JwtAuthGuard, RolesGuard)
   * @Roles(UserRole.ADMIN)
   * async adminOnlyEndpoint() {
   *   // This endpoint requires ADMIN role
   * }
   * ```
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user is authenticated, throw 401 Unauthorized
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    // If user doesn't have required role, also throw 401 Unauthorized
    // This ensures frontend treats role mismatch as authentication issue
    const hasRequiredRole = requiredRoles.some((role) => user.role === role);
    if (!hasRequiredRole) {
      throw new UnauthorizedException(
        'Invalid authentication for this resource. Please login with appropriate credentials.',
      );
    }

    return true;
  }
}
