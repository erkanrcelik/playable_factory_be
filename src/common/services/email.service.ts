import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('app.email.host'),
      port: this.configService.get<number>('app.email.port'),
      secure: this.configService.get<boolean>('app.email.secure'),
      auth: {
        user: this.configService.get<string>('app.email.user'),
        pass: this.configService.get<string>('app.email.password'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('app.email.from'),
        to,
        subject,
        html,
      });
    } catch (error) {
      // In development, we might want to log but not throw
      if (this.configService.get<string>('app.nodeEnv') === 'production') {
        throw error;
      }
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>('app.app.url');
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

    const subject = 'Email Verification';
    const html = `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>('app.app.url');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const subject = 'Password Reset';
    const html = `
      <h1>Password Reset</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.sendEmail(to, subject, html);
  }
}
