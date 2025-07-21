import {
  Controller,
  Post,
  Body,
  UsePipes,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ThrottleAuthGuard } from '../common/guards/throttle-auth.guard';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

import { AuthError, AuthErrorMessages } from './enums';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * Authentication Controller
 *
 * Handles user authentication, registration, and account management operations.
 * Supports three user roles: ADMIN, SELLER, and CUSTOMER.
 *
 * @description This controller provides comprehensive authentication services including:
 * - User registration with email verification
 * - Secure login with JWT token generation
 * - Password reset functionality
 * - Email verification system
 * - Token refresh mechanism
 *
 * @security All endpoints are protected with rate limiting to prevent brute force attacks
 * @security Passwords are hashed using bcrypt with 12 salt rounds
 * @security JWT tokens are used for stateless authentication
 */
@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottleAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user account
   *
   * Creates a new user account with the specified role and sends an email verification link.
   * The user will receive a verification email to confirm their email address.
   *
   * @param registerDto - User registration data including email, password, and personal information
   * @returns User information with JWT access and refresh tokens
   *
   * @example
   * ```json
   * {
   *   "email": "user@example.com",
   *   "password": "securePassword123",
   *   "firstName": "John",
   *   "lastName": "Doe",
   *   "phoneNumber": "+1234567890",
   *   "role": "customer"
   * }
   * ```
   */
  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  @ApiOperation({
    summary: 'Register new user account',
    description:
      'Creates a new user account with email verification. Supports three roles: ADMIN, SELLER, CUSTOMER. An email verification link will be sent to the provided email address.',
    tags: ['Authentication'],
  })
  @ApiBody({
    description: 'User registration data',
    schema: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address (must be unique)',
          example: 'user@example.com',
        },
        password: {
          type: 'string',
          minLength: 6,
          description: 'User password (minimum 6 characters)',
          example: 'securePassword123',
        },
        firstName: {
          type: 'string',
          minLength: 2,
          description: 'User first name',
          example: 'John',
        },
        lastName: {
          type: 'string',
          minLength: 2,
          description: 'User last name',
          example: 'Doe',
        },
        phoneNumber: {
          type: 'string',
          description: 'User phone number (optional)',
          example: '+1234567890',
        },
        role: {
          type: 'string',
          enum: ['admin', 'seller', 'customer'],
          default: 'customer',
          description: 'User role in the system',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Email verification link sent.',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', example: 'customer' },
            isEmailVerified: { type: 'boolean', example: false },
          },
        },
        accessToken: {
          type: 'string',
          description: 'JWT access token (15 minutes)',
        },
        refreshToken: {
          type: 'string',
          description: 'JWT refresh token (7 days)',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: AuthErrorMessages[AuthError.USER_ALREADY_EXISTS],
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Login user account
   *
   * Authenticates a user with email and password, then generates JWT access and refresh tokens.
   * The user must have appropriate permissions for the specified platform.
   *
   * @param loginDto - User login credentials and platform
   * @returns User information with JWT access and refresh tokens
   *
   * @example
   * ```json
   * {
   *   "email": "user@example.com",
   *   "password": "securePassword123",
   *   "platform": "customer"
   * }
   * ```
   */
  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  @ApiOperation({
    summary: 'Login user account',
    description:
      'Authenticates user with email and password. Requires platform specification (admin, seller, customer). User must have appropriate permissions for the specified platform.',
    tags: ['Authentication'],
  })
  @ApiBody({
    description: 'User login credentials and platform',
    schema: {
      type: 'object',
      required: ['email', 'password', 'platform'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address',
          example: 'user@example.com',
        },
        password: {
          type: 'string',
          description: 'User password (minimum 6 characters)',
          example: 'securePassword123',
        },
        platform: {
          type: 'string',
          enum: ['admin', 'seller', 'customer'],
          description: 'Platform to access (admin, seller, customer)',
          example: 'customer',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' },
            email: { type: 'string', description: 'User email' },
            firstName: { type: 'string', description: 'User first name' },
            lastName: { type: 'string', description: 'User last name' },
            role: { type: 'string', description: 'User role' },
            isEmailVerified: {
              type: 'boolean',
              description: 'Email verification status',
            },
          },
        },
        accessToken: {
          type: 'string',
          description: 'JWT access token (15 minutes)',
        },
        refreshToken: {
          type: 'string',
          description: 'JWT refresh token (7 days)',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: AuthErrorMessages[AuthError.INVALID_CREDENTIALS],
  })
  @ApiResponse({
    status: 401,
    description: AuthErrorMessages[AuthError.INSUFFICIENT_PERMISSIONS],
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Refresh access token using refresh token
   *
   * Generates a new access token using a valid refresh token.
   * This endpoint should be called when the access token expires.
   *
   * @param refreshTokenDto - Refresh token data
   * @returns New JWT access and refresh tokens
   *
   * @example
   * ```json
   * {
   *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * }
   * ```
   */
  @Post('refresh')
  @UsePipes(new ZodValidationPipe(refreshTokenSchema))
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates new access and refresh tokens using a valid refresh token. Call this when access token expires.',
    tags: ['Authentication'],
  })
  @ApiBody({
    description: 'Refresh token data',
    schema: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Valid refresh token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'New JWT access token (15 minutes)',
        },
        refreshToken: {
          type: 'string',
          description: 'New JWT refresh token (7 days)',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: AuthErrorMessages[AuthError.INVALID_REFRESH_TOKEN],
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  /**
   * Request password reset
   *
   * Sends a password reset link to the provided email address.
   * The reset link is valid for 1 hour and contains a secure token.
   *
   * @param forgotPasswordDto - Email address for password reset
   * @returns Success message (does not reveal if email exists for security)
   *
   * @example
   * ```json
   * {
   *   "email": "user@example.com"
   * }
   * ```
   */
  @Post('forgot-password')
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Sends a password reset link to the provided email address. The reset link is valid for 1 hour. For security reasons, this endpoint always returns success even if the email does not exist.',
    tags: ['Authentication'],
  })
  @ApiBody({
    description: 'Email address for password reset',
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Email address to send reset link',
          example: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if account exists)',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: AuthErrorMessages[AuthError.PASSWORD_RESET_EMAIL_SENT],
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid email format' })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Reset password using reset token
   *
   * Resets the user password using a valid reset token.
   * The token is obtained from the password reset email.
   *
   * @param resetPasswordDto - Reset token and new password
   * @returns Success message
   *
   * @example
   * ```json
   * {
   *   "token": "reset-token-from-email",
   *   "password": "newSecurePassword123"
   * }
   * ```
   */
  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  @ApiOperation({
    summary: 'Reset password using token',
    description:
      'Resets user password using a valid reset token obtained from the password reset email. Token is valid for 1 hour.',
    tags: ['Authentication'],
  })
  @ApiBody({
    description: 'Reset token and new password',
    schema: {
      type: 'object',
      required: ['token', 'password'],
      properties: {
        token: {
          type: 'string',
          description: 'Reset token from email',
          example: 'reset-token-from-email',
        },
        password: {
          type: 'string',
          minLength: 6,
          description: 'New password (minimum 6 characters)',
          example: 'newSecurePassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: AuthErrorMessages[AuthError.PASSWORD_RESET_SUCCESS],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: AuthErrorMessages[AuthError.INVALID_OR_EXPIRED_RESET_TOKEN],
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * Verify email address
   *
   * Verifies the user's email address using a verification token.
   * The token is sent to the user's email during registration.
   *
   * @param token - Email verification token from URL query parameter
   * @returns Success message
   *
   * @example
   * GET /api/auth/verify-email?token=verification-token
   */
  @Get('verify-email')
  @ApiOperation({
    summary: 'Verify email address',
    description:
      'Verifies user email address using a verification token sent during registration. Token is valid for 24 hours.',
    tags: ['Authentication'],
  })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token',
    type: 'string',
    example: 'verification-token-from-email',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: AuthErrorMessages[AuthError.EMAIL_VERIFICATION_SUCCESS],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      AuthErrorMessages[AuthError.INVALID_OR_EXPIRED_VERIFICATION_TOKEN],
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail({ token });
  }

  /**
   * Resend email verification
   *
   * Sends a new email verification link to the user's email address.
   * This is useful if the original verification email was not received or expired.
   *
   * @param body - Email address for verification resend
   * @returns Success message
   *
   * @example
   * ```json
   * {
   *   "email": "user@example.com"
   * }
   * ```
   */
  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend email verification',
    description:
      "Sends a new email verification link to the user's email address. Useful if the original verification email was not received or expired.",
    tags: ['Authentication'],
  })
  @ApiBody({
    description: 'Email address for verification resend',
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Email address to resend verification',
          example: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: AuthErrorMessages[AuthError.VERIFICATION_EMAIL_SENT],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: `${AuthErrorMessages[AuthError.EMAIL_ALREADY_VERIFIED]} or ${AuthErrorMessages[AuthError.USER_NOT_FOUND]}`,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  /**
   * Logout user
   *
   * Logs out the current user by invalidating their session.
   * In a JWT-based system, this primarily involves client-side token removal,
   * but the server can also implement additional security measures.
   *
   * @param req - Request object containing user information
   * @returns Success message
   *
   * @security This endpoint requires a valid JWT token
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Logs out the current user. In a JWT-based system, this primarily involves client-side token removal, but the server can implement additional security measures like token blacklisting.',
    tags: ['Authentication'],
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: AuthErrorMessages[AuthError.LOGOUT_SUCCESS],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async logout(
    @Request()
    req: { user: { sub: string }; headers: { authorization?: string } },
    @Body() body?: { accessToken?: string; refreshToken?: string },
  ) {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    const refreshToken = body?.refreshToken;

    return this.authService.logout(req.user.sub, accessToken, refreshToken);
  }

  /**
   * Get current user information
   *
   * Retrieves the current user's information based on the JWT token.
   * This endpoint is available to all authenticated users (ADMIN, SELLER, CUSTOMER).
   *
   * @param user - Current user from JWT token
   * @returns User information without password
   *
   * @security This endpoint requires a valid JWT token
   */
  @Get('user-info')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user information',
    description:
      "Retrieves the current user's information based on the JWT token. Available to all authenticated users (ADMIN, SELLER, CUSTOMER).",
    tags: ['Authentication'],
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getUserInfo(@CurrentUser() user: any) {
    return this.authService.getUserInfo(user.id);
  }
}
