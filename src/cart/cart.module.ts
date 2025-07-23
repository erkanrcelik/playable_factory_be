import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Campaign, CampaignSchema } from '../schemas/campaign.schema';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { OrdersModule } from '../orders/orders.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: require('cache-manager-redis-store'), // eslint-disable-line @typescript-eslint/no-require-imports
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        ttl: 60 * 60 * 24 * 7, // 7 days
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Campaign.name, schema: CampaignSchema },
    ]),
    OrdersModule,
    RecommendationsModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
