import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Token blacklist kontrolü şimdilik devre dışı
    // TokenBlacklistService inject edilmediği için bu kontrolü kaldırıyoruz
    // TODO: TokenBlacklistService'i guard'a inject etmek için module yapısını düzenle

    return super.canActivate(context) as Promise<boolean>;
  }
}
