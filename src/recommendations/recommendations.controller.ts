import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  /**
   * Kullanıcı etkinliğini kaydet
   */
  @Post('track-activity')
  @UseGuards(JwtAuthGuard)
  async trackActivity(
    @Request() req,
    @Query('productId') productId: string,
    @Query('activityType') activityType: 'view' | 'purchase' | 'cart_add',
  ) {
    await this.recommendationsService.trackUserActivity(
      req.user.id,
      productId,
      activityType,
    );
    return { message: 'Activity tracked successfully' };
  }

  /**
   * Kişiselleştirilmiş ürün tavsiyeleri
   */
  @Get('personalized')
  @UseGuards(JwtAuthGuard)
  async getPersonalizedRecommendations(
    @Request() req,
    @Query('limit') limit: number = 10,
  ) {
    return this.recommendationsService.getPersonalizedRecommendations(
      req.user.id,
      limit,
    );
  }

  /**
   * "Birlikte sıkça alınanlar" önerileri
   */
  @Get('frequently-bought-together/:productId')
  async getFrequentlyBoughtTogether(
    @Param('productId') productId: string,
    @Query('limit') limit: number = 5,
  ) {
    return this.recommendationsService.getFrequentlyBoughtTogether(
      productId,
      limit,
    );
  }

  /**
   * Popüler ürünler
   */
  @Get('popular')
  async getPopularProducts(@Query('limit') limit: number = 10) {
    return this.recommendationsService.getPopularProducts(limit);
  }

  /**
   * Kategori bazlı öneriler
   */
  @Get('category/:categoryId')
  async getCategoryRecommendations(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.recommendationsService.getCategoryRecommendations(
      categoryId,
      limit,
    );
  }

  /**
   * Göz atma geçmişine göre öneriler
   */
  @Get('browsing-history')
  @UseGuards(JwtAuthGuard)
  async getBrowsingHistoryRecommendations(
    @Request() req,
    @Query('limit') limit: number = 10,
  ) {
    return this.recommendationsService.getBrowsingHistoryRecommendations(
      req.user.id,
      limit,
    );
  }
}
