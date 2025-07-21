import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  Platform,
} from './dto/auth.dto';
import { AuthError, AuthErrorMessages } from './enums';
import { TokenBlacklistService } from './services/token-blacklist.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phoneNumber, role } =
      registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException(
        AuthErrorMessages[AuthError.USER_ALREADY_EXISTS],
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      role,
    });

    await user.save();

    // Generate email verification token
    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ); // 24 hours

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = emailVerificationTokenExpires;
    await user.save();

    // Send verification email
    this.sendVerificationEmail(user.email, emailVerificationToken);

    return { message: AuthErrorMessages[AuthError.REGISTRATION_SUCCESS] };
  }

  async login(loginDto: LoginDto) {
    const { email, password, platform } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException(
        AuthErrorMessages[AuthError.INVALID_CREDENTIALS],
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        AuthErrorMessages[AuthError.INVALID_CREDENTIALS],
      );
    }

    // Check platform access
    if (!this.hasPlatformAccess(user.role, platform)) {
      throw new UnauthorizedException(
        AuthErrorMessages[AuthError.INSUFFICIENT_PERMISSIONS],
      );
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(
        refreshTokenDto.refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException(
          AuthErrorMessages[AuthError.INVALID_REFRESH_TOKEN],
        );
      }

      const tokens = await this.generateTokens(user);

      return tokens;
    } catch {
      throw new UnauthorizedException(
        AuthErrorMessages[AuthError.INVALID_REFRESH_TOKEN],
      );
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto;

    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException(
        AuthErrorMessages[AuthError.INVALID_OR_EXPIRED_VERIFICATION_TOKEN],
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    return { message: AuthErrorMessages[AuthError.EMAIL_VERIFICATION_SUCCESS] };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message: AuthErrorMessages[AuthError.PASSWORD_RESET_EMAIL_SENT],
      };
    }

    // Generate password reset token
    const passwordResetToken = randomBytes(32).toString('hex');
    const passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpires = passwordResetTokenExpires;
    await user.save();

    // Send password reset email
    this.sendPasswordResetEmail(user.email, passwordResetToken);

    return {
      message:
        'If an account with this email exists, a password reset link has been sent',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const user = await this.userModel.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException(
        AuthErrorMessages[AuthError.INVALID_OR_EXPIRED_RESET_TOKEN],
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    return { message: AuthErrorMessages[AuthError.PASSWORD_RESET_SUCCESS] };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException(
        AuthErrorMessages[AuthError.USER_NOT_FOUND],
      );
    }

    if (user.isEmailVerified) {
      throw new BadRequestException(
        AuthErrorMessages[AuthError.EMAIL_ALREADY_VERIFIED],
      );
    }

    // Generate new verification token
    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ); // 24 hours

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = emailVerificationTokenExpires;
    await user.save();

    // Send verification email
    this.sendVerificationEmail(user.email, emailVerificationToken);

    return { message: AuthErrorMessages[AuthError.VERIFICATION_EMAIL_SENT] };
  }

  private async generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sendVerificationEmail(email: string, token: string) {
    // This method will need to be implemented without the EmailService dependency
    // For now, it will be a placeholder or throw an error if not implemented
    console.log(`Sending verification email to ${email} with token: ${token}`);
    // Example: await this.emailService.sendVerificationEmail(email, token);
  }

  private sendPasswordResetEmail(email: string, token: string) {
    // This method will need to be implemented without the EmailService dependency
    // For now, it will be a placeholder or throw an error if not implemented
    console.log(
      `Sending password reset email to ${email} with token: ${token}`,
    );
    // Example: await this.emailService.sendPasswordResetEmail(email, token);
  }

  async logout(userId: string, accessToken?: string, refreshToken?: string) {
    // In a JWT-based system, logout is primarily handled on the client side
    // by removing tokens from storage. However, we can implement additional
    // security measures like token blacklisting or refresh token invalidation.

    try {
      // If tokens are provided, add them to blacklist
      if (accessToken) {
        const accessTokenPayload = this.jwtService.verify<JwtPayload>(
          accessToken,
          {
            secret: process.env.JWT_SECRET,
          },
        );
        await this.tokenBlacklistService.addToBlacklist(
          accessToken,
          userId,
          new Date(accessTokenPayload.exp * 1000),
        );
      }

      if (refreshToken) {
        const refreshTokenPayload = this.jwtService.verify<JwtPayload>(
          refreshToken,
          {
            secret: process.env.JWT_REFRESH_SECRET,
          },
        );
        await this.tokenBlacklistService.addToBlacklist(
          refreshToken,
          userId,
          new Date(refreshTokenPayload.exp * 1000),
        );
      }

      // Update user's last logout timestamp (optional)
      await this.userModel
        .findByIdAndUpdate(userId, {
          lastLogoutAt: new Date(),
        })
        .exec();

      return { message: AuthErrorMessages[AuthError.LOGOUT_SUCCESS] };
    } catch {
      // If token verification fails, still return success
      // as the client should remove tokens anyway
      return { message: AuthErrorMessages[AuthError.LOGOUT_SUCCESS] };
    }
  }

  private hasPlatformAccess(userRole: UserRole, platform: Platform): boolean {
    switch (platform) {
      case Platform.ADMIN:
        return userRole === UserRole.ADMIN;
      case Platform.SELLER:
        return userRole === UserRole.SELLER || userRole === UserRole.ADMIN;
      case Platform.CUSTOMER:
        return (
          userRole === UserRole.CUSTOMER ||
          userRole === UserRole.SELLER ||
          userRole === UserRole.ADMIN
        );
      default:
        return false;
    }
  }
}
