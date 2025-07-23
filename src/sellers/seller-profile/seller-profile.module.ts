import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SellerProfile,
  SellerProfileSchema,
} from '../../schemas/seller-profile.schema';
import { SellerProfileController } from './seller-profile.controller';
import { SellerProfileService } from './seller-profile.service';
import { MinioService } from '../../minio/minio.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SellerProfile.name, schema: SellerProfileSchema },
    ]),
  ],
  controllers: [SellerProfileController],
  providers: [SellerProfileService, MinioService],
  exports: [SellerProfileService],
})
export class SellerProfileModule {}
