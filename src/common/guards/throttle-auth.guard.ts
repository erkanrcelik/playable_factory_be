import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class ThrottleAuthGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const result = req.ips.length ? req.ips[0] : (req.ip as string);
    await Promise.resolve(); // Add await to satisfy eslint
    return result;
  }
}
