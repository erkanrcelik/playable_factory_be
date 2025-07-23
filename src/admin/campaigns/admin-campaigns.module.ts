import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminCampaignsController } from './admin-campaigns.controller';
import { AdminCampaignsService } from './admin-campaigns.service';
import { Campaign, CampaignSchema } from '../../schemas/campaign.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Category, CategorySchema } from '../../schemas/category.schema';
import { MinioService } from '../../minio/minio.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [AdminCampaignsController],
  providers: [AdminCampaignsService, MinioService],
  exports: [AdminCampaignsService],
})
export class AdminCampaignsModule {}
