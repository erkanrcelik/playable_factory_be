import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

@ApiTags('Product Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  /**
   * Track user activity for recommendations
   */
  @Post('track-activity')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Track user activity',
    description: 'Track user activity for personalized recommendations',
  })
  @ApiQuery({
    name: 'productId',
    required: true,
    type: String,
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'activityType',
    required: true,
    enum: ['view', 'purchase', 'cart_add'],
    description: 'Type of user activity',
    example: 'view',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity tracked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Activity tracked successfully' },
      },
    },
  })
  @ApiBearerAuth()
  async trackActivity(
    @Request() req,
    @Query('productId') productId: string,
    @Query('activityType') activityType: 'view' | 'purchase' | 'cart_add',
    @Body() body?: any,
  ) {
    await this.recommendationsService.trackUserActivity(
      req.user.id,
      productId,
      activityType,
    );
    return { message: 'Activity tracked successfully' };
  }

  /**
   * Get personalized product recommendations (User-specific)
   */
  @Get('personalized')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get personalized recommendations',
    description:
      'Get personalized product recommendations based on user activity and preferences',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of recommendations to return (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Personalized recommendations retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          discountedPrice: { type: 'number' },
          imageUrls: { type: 'array', items: { type: 'string' } },
          category: { type: 'object' },
          seller: { type: 'object' },
          hasDiscount: { type: 'boolean' },
          discountPercentage: { type: 'number' },
          score: { type: 'number', description: 'Recommendation score' },
        },
      },
    },
  })
  @ApiBearerAuth()
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
   * Get user's most viewed products (User-specific)
   */
  @Get('my-most-viewed')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user\'s most viewed products',
    description: 'Get products that the user has viewed most frequently',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Most viewed products retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          discountedPrice: { type: 'number' },
          imageUrls: { type: 'array', items: { type: 'string' } },
          category: { type: 'object' },
          seller: { type: 'object' },
          hasDiscount: { type: 'boolean' },
          discountPercentage: { type: 'number' },
          viewCount: { type: 'number', description: 'Number of times viewed' },
        },
      },
    },
  })
  @ApiBearerAuth()
  async getMostViewedProducts(
    @Request() req,
    @Query('limit') limit: number = 10,
  ) {
    return this.recommendationsService.getMostViewedProducts(
      req.user.id,
      limit,
    );
  }

  /**
   * Get featured products (Public - everyone can see)
   */
  @Get('featured')
  @ApiOperation({
    summary: 'Get featured products',
    description: 'Get products marked as featured by sellers',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Featured products retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          discountedPrice: { type: 'number' },
          imageUrls: { type: 'array', items: { type: 'string' } },
          category: { type: 'object' },
          seller: { type: 'object' },
          hasDiscount: { type: 'boolean' },
          discountPercentage: { type: 'number' },
          isFeatured: { type: 'boolean' },
        },
      },
    },
  })
  async getFeaturedProducts(@Query('limit') limit: number = 10) {
    return this.recommendationsService.getFeaturedProducts(limit);
  }

  /**
   * Get frequently bought together recommendations (Public)
   */
  @Get('frequently-bought-together/:productId')
  @ApiOperation({
    summary: 'Get frequently bought together',
    description:
      'Get products frequently bought together with the specified product',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of recommendations to return (default: 5)',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description:
      'Frequently bought together recommendations retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          discountedPrice: { type: 'number' },
          imageUrls: { type: 'array', items: { type: 'string' } },
          category: { type: 'object' },
          seller: { type: 'object' },
          hasDiscount: { type: 'boolean' },
          discountPercentage: { type: 'number' },
          frequency: {
            type: 'number',
            description: 'How often bought together',
          },
        },
      },
    },
  })
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
   * Get popular products (Public)
   */
  @Get('popular')
  @ApiOperation({
    summary: 'Get popular products',
    description: 'Get most popular products based on sales and views',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Popular products retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          discountedPrice: { type: 'number' },
          imageUrls: { type: 'array', items: { type: 'string' } },
          category: { type: 'object' },
          seller: { type: 'object' },
          hasDiscount: { type: 'boolean' },
          discountPercentage: { type: 'number' },
          popularity: { type: 'number', description: 'Popularity score' },
        },
      },
    },
  })
  async getPopularProducts(@Query('limit') limit: number = 10) {
    return this.recommendationsService.getPopularProducts(limit);
  }

  /**
   * Get category-based recommendations (Public)
   */
  @Get('category/:categoryId')
  @ApiOperation({
    summary: 'Get category recommendations',
    description: 'Get product recommendations based on category',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of recommendations to return (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Category recommendations retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          discountedPrice: { type: 'number' },
          imageUrls: { type: 'array', items: { type: 'string' } },
          category: { type: 'object' },
          seller: { type: 'object' },
          hasDiscount: { type: 'boolean' },
          discountPercentage: { type: 'number' },
          relevance: {
            type: 'number',
            description: 'Category relevance score',
          },
        },
      },
    },
  })
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
   * Get recommendations based on browsing history (User-specific)
   */
  @Get('browsing-history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get browsing history recommendations',
    description: 'Get product recommendations based on user browsing history',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of recommendations to return (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Browsing history recommendations retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          discountedPrice: { type: 'number' },
          imageUrls: { type: 'array', items: { type: 'string' } },
          category: { type: 'object' },
          seller: { type: 'object' },
          hasDiscount: { type: 'boolean' },
          discountPercentage: { type: 'number' },
          lastViewed: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiBearerAuth()
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
