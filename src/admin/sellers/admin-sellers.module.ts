import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSellersController } from './admin-sellers.controller';
import { AdminSellersService } from './admin-sellers.service';
import { User, UserSchema } from '../../schemas/user.schema';
import {
  SellerProfile,
  SellerProfileSchema,
} from '../../schemas/seller-profile.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: SellerProfile.name, schema: SellerProfileSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [AdminSellersController],
  providers: [AdminSellersService],
  exports: [AdminSellersService],
})
export class AdminSellersModule {}
