import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { searchSchema } from './dto/search.dto';

/**
 * Search Controller
 *
 * Provides comprehensive search functionality for customers including:
 * - Global search across products, categories, sellers, and campaigns
 * - Type-specific search (products only, categories only, etc.)
 * - Pagination and result limiting
 * - Real-time search suggestions
 *
 * No authentication required for these endpoints.
 */
@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Global search - search all types
   *
   * Searches across products, categories, sellers, and campaigns.
   * If type parameter is specified, only searches that type.
   */
  @Get()
  @ApiOperation({
    summary: 'Global search',
    description: 'Search across products, categories, sellers, and campaigns',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Search term',
    example: 'iphone',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['products', 'categories', 'sellers', 'campaigns'],
    description: 'Search type (if not specified, searches all types)',
    example: 'products',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        products: {
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
              averageRating: { type: 'number' },
              reviewCount: { type: 'number' },
              category: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
              seller: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  storeName: { type: 'string' },
                },
              },
              hasDiscount: { type: 'boolean' },
              discountPercentage: { type: 'number' },
            },
          },
        },
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              imageUrl: { type: 'string' },
              productCount: { type: 'number' },
            },
          },
        },
        sellers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              storeName: { type: 'string' },
              description: { type: 'string' },
              logoUrl: { type: 'string' },
              averageRating: { type: 'number' },
              reviewCount: { type: 'number' },
              productCount: { type: 'number' },
            },
          },
        },
        campaigns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              discountType: { type: 'string' },
              discountValue: { type: 'number' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              isActive: { type: 'boolean' },
              remainingDays: { type: 'number' },
            },
          },
        },
        totalResults: {
          type: 'object',
          properties: {
            products: { type: 'number' },
            categories: { type: 'number' },
            sellers: { type: 'number' },
            campaigns: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search parameters',
  })
  async search(@Query(new ZodValidationPipe(searchSchema)) searchDto: any) {
    return this.searchService.searchAll(searchDto);
  }

  /**
   * Product search only
   */
  @Get('products')
  @ApiOperation({
    summary: 'Product search',
    description: 'Search only in products',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Search term',
    example: 'iphone',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Product search results retrieved successfully',
  })
  async searchProducts(
    @Query(new ZodValidationPipe(searchSchema)) searchDto: any,
  ) {
    return this.searchService.searchProducts(
      searchDto.query,
      searchDto.page,
      searchDto.limit,
    );
  }

  /**
   * Category search only
   */
  @Get('categories')
  @ApiOperation({
    summary: 'Category search',
    description: 'Search only in categories',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Search term',
    example: 'electronics',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Category search results retrieved successfully',
  })
  async searchCategories(
    @Query(new ZodValidationPipe(searchSchema)) searchDto: any,
  ) {
    return this.searchService.searchCategories(
      searchDto.query,
      searchDto.page,
      searchDto.limit,
    );
  }

  /**
   * Seller search only
   */
  @Get('sellers')
  @ApiOperation({
    summary: 'Seller search',
    description: 'Search only in sellers',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Search term',
    example: 'tech store',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Seller search results retrieved successfully',
  })
  async searchSellers(
    @Query(new ZodValidationPipe(searchSchema)) searchDto: any,
  ) {
    return this.searchService.searchSellers(
      searchDto.query,
      searchDto.page,
      searchDto.limit,
    );
  }

  /**
   * Campaign search only
   */
  @Get('campaigns')
  @ApiOperation({
    summary: 'Campaign search',
    description: 'Search only in campaigns',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Search term',
    example: 'summer sale',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign search results retrieved successfully',
  })
  async searchCampaigns(
    @Query(new ZodValidationPipe(searchSchema)) searchDto: any,
  ) {
    return this.searchService.searchCampaigns(
      searchDto.query,
      searchDto.page,
      searchDto.limit,
    );
  }
}
