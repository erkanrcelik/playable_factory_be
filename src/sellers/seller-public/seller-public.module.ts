import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SellerPublicController } from './seller-public.controller';
import { SellerPublicService } from './seller-public.service';
import {
  SellerProfile,
  SellerProfileSchema,
} from '../../schemas/seller-profile.schema';
import { User, UserSchema } from '../../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SellerProfile.name, schema: SellerProfileSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SellerPublicController],
  providers: [SellerPublicService],
  exports: [SellerPublicService],
})
export class SellerPublicModule {}
