import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MINIO_TOKEN } from './minio.decorator';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';
import * as Minio from 'minio';

@Global()
@Module({
  exports: [MINIO_TOKEN],
  providers: [
    {
      inject: [ConfigService],
      provide: MINIO_TOKEN,
      useFactory: (configService: ConfigService): Minio.Client => {
        return new Minio.Client({
          endPoint: configService.get('MINIO_ENDPOINT') || 'localhost',
          port: +configService.get('MINIO_PORT') || 9000,
          accessKey: configService.get('MINIO_ACCESS_KEY') || '',
          secretKey: configService.get('MINIO_SECRET_KEY') || '',
          useSSL: true,
        });
      },
    },
    MinioService,
  ],
  controllers: [MinioController],
})
export class MinioModule {}
