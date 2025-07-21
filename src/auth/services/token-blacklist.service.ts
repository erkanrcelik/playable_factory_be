import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface BlacklistedToken {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectModel('BlacklistedToken')
    private blacklistedTokenModel: Model<BlacklistedToken>,
  ) {}

  async addToBlacklist(
    token: string,
    userId: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.blacklistedTokenModel.create({
      token,
      userId,
      expiresAt,
      createdAt: new Date(),
    });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.blacklistedTokenModel.findOne({
      token,
    });
    return !!blacklistedToken;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.blacklistedTokenModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }

  async getUserBlacklistedTokens(userId: string): Promise<BlacklistedToken[]> {
    return this.blacklistedTokenModel.find({ userId }).exec();
  }
}
