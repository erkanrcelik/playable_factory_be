import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { HomepageService } from './homepage.service';

/**
 * Homepage Controller
 *
 * Provides public endpoints for e-commerce homepage data including
 * featured products, categories, special offers, and product recommendations
 */
@ApiTags('Homepage')
@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get()
  @ApiOperation({
    summary: 'Get complete homepage data',
    description: 'Retrieve all homepage sections in a single request',
  })
  @ApiResponse({
    status: 200,
    description: 'Homepage data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        featuredProducts: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            products: { type: 'array' },
          },
        },
        newArrivals: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            products: { type: 'array' },
          },
        },
        popularProducts: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            products: { type: 'array' },
          },
        },
        specialOffers: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            products: { type: 'array' },
          },
        },
        categories: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            items: { type: 'array' },
          },
        },
        recommendations: {
          type: 'object',
          properties: {
            personalized: { type: 'array' },
            mostViewed: { type: 'array' },
            browsingHistory: { type: 'array' },
          },
        },
      },
    },
  })
  async getHomepageData(@Request() req) {
    return this.homepageService.getHomepageData(req.user?.id);
  }

  @Get('with-recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get homepage data with personalized recommendations',
    description: 'Retrieve homepage data including personalized recommendations for authenticated users',
  })
  @ApiResponse({
    status: 200,
    description: 'Homepage data with recommendations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        featuredProducts: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            products: { type: 'array' },
          },
        },
        newArrivals: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            products: { type: 'array' },
          },
        },
        popularProducts: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            products: { type: 'array' },
          },
        },
        specialOffers: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            products: { type: 'array' },
          },
        },
        categories: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            items: { type: 'array' },
          },
        },
        recommendations: {
          type: 'object',
          properties: {
            personalized: { type: 'array' },
            mostViewed: { type: 'array' },
            browsingHistory: { type: 'array' },
          },
        },
      },
    },
  })
  @ApiBearerAuth()
  async getHomepageDataWithRecommendations(@Request() req) {
    return this.homepageService.getHomepageDataWithRecommendations(req.user.id);
  }

  @Get('featured-products')
  @ApiOperation({
    summary: 'Get featured products',
    description: 'Retrieve featured products for homepage',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (default: 8)',
  })
  @ApiResponse({
    status: 200,
    description: 'Featured products retrieved successfully',
  })
  async getFeaturedProducts(@Query('limit') limit?: number) {
    return this.homepageService.getFeaturedProducts(limit || 8);
  }

  @Get('new-arrivals')
  @ApiOperation({
    summary: 'Get new arrival products',
    description: 'Retrieve recently added products',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (default: 8)',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Consider products from last X days (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'New arrivals retrieved successfully',
  })
  async getNewArrivals(
    @Query('limit') limit?: number,
    @Query('days') days?: number,
  ) {
    return this.homepageService.getNewArrivals(limit || 8, days || 30);
  }

  @Get('popular-products')
  @ApiOperation({
    summary: 'Get popular products',
    description: 'Retrieve bestseller and popular products based on orders',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (default: 8)',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Consider orders from last X days (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'Popular products retrieved successfully',
  })
  async getPopularProducts(
    @Query('limit') limit?: number,
    @Query('days') days?: number,
  ) {
    return this.homepageService.getPopularProducts(limit || 8, days || 30);
  }

  @Get('special-offers')
  @ApiOperation({
    summary: 'Get special offers',
    description: 'Retrieve products with active discounts and campaigns',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (default: 8)',
  })
  @ApiResponse({
    status: 200,
    description: 'Special offers retrieved successfully',
  })
  async getSpecialOffers(@Query('limit') limit?: number) {
    return this.homepageService.getSpecialOffers(limit || 8);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get categories',
    description: 'Retrieve active product categories for homepage navigation',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of categories to return (default: 12)',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async getCategories(@Query('limit') limit?: number) {
    return this.homepageService.getCategories(limit || 12);
  }

  @Get('categories/:categoryId/products')
  @ApiOperation({
    summary: 'Get products by category',
    description: 'Retrieve products from a specific category',
  })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (default: 6)',
  })
  @ApiResponse({
    status: 200,
    description: 'Category products retrieved successfully',
  })
  async getProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit?: number,
  ) {
    return this.homepageService.getProductsByCategory(categoryId, limit || 6);
  }

  @Get('sellers/:sellerId/products')
  @ApiOperation({
    summary: 'Get seller products',
    description:
      'Retrieve products from a specific seller for seller profile page',
  })
  @ApiParam({ name: 'sellerId', description: 'Seller ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products to return (default: 12)',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller products retrieved successfully',
  })
  async getSellerProducts(
    @Param('sellerId') sellerId: string,
    @Query('limit') limit?: number,
  ) {
    return this.homepageService.getSellerProducts(sellerId, limit || 12);
  }

  @Get('products/:productId/related')
  @ApiOperation({
    summary: 'Get related products',
    description:
      'Retrieve products related to a specific product for product detail page',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of related products to return (default: 6)',
  })
  @ApiResponse({
    status: 200,
    description: 'Related products retrieved successfully',
  })
  async getRelatedProducts(
    @Param('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.homepageService.getRelatedProducts(productId, limit || 6);
  }
}
