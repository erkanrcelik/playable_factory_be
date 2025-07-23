import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Category, CategorySchema } from '../schemas/category.schema';
import { Campaign, CampaignSchema } from '../schemas/campaign.schema';
import { Order, OrderSchema } from '../schemas/order.schema';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    RecommendationsModule,
  ],
  controllers: [HomepageController],
  providers: [HomepageService],
  exports: [HomepageService],
})
export class HomepageModule {}
