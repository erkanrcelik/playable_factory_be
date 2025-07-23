import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { User, UserSchema } from '../../schemas/user.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Campaign, CampaignSchema } from '../../schemas/campaign.schema';
import { Category, CategorySchema } from '../../schemas/category.schema';
import { Review, ReviewSchema } from '../../schemas/review.schema';

/**
 * Admin Dashboard Module
 *
 * Provides comprehensive dashboard functionality for admin users including:
 * - System-wide statistics and analytics
 * - Recent activities monitoring
 * - Chart data for visualizations
 * - System health monitoring
 * - Performance metrics
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
  exports: [AdminDashboardService],
})
export class AdminDashboardModule {}
