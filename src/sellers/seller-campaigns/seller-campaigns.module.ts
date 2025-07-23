import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from '../../schemas/campaign.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { SellerCampaignsController } from './seller-campaigns.controller';
import { SellerCampaignsService } from './seller-campaigns.service';
import { MinioService } from '../../minio/minio.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [SellerCampaignsController],
  providers: [SellerCampaignsService, MinioService],
  exports: [SellerCampaignsService],
})
export class SellerCampaignsModule {}
