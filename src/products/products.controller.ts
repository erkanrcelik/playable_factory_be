import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { findAllProductsSchema } from './dto/find-all-products.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Get all products
   */
  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description:
      'Retrieve all active products with optional filtering and pagination',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'category', required: false, description: 'Category ID' })
  @ApiQuery({ name: 'seller', required: false, description: 'Seller ID' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Active status filter',
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    description: 'Featured status filter',
  })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price' })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated tags',
  })
  @ApiQuery({
    name: 'hasDiscount',
    required: false,
    description: 'Filter by discount availability',
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    description: 'Filter by stock availability',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
              category: { type: 'object' },
              imageUrls: { type: 'array', items: { type: 'string' } },
              isActive: { type: 'boolean' },
              isFeatured: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAllProducts(
    @Query(new ZodValidationPipe(findAllProductsSchema)) query: any,
  ) {
    return this.productsService.findAllProducts(query);
  }

  /**
   * Get filter options for products
   */
  @Get('filters')
  @ApiOperation({
    summary: 'Get filter options',
    description:
      'Get available filter options for products (categories, price ranges, tags, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Filter options retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              productCount: { type: 'number' },
            },
          },
        },
        priceRanges: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              max: { type: 'number' },
              label: { type: 'string' },
              productCount: { type: 'number' },
            },
          },
        },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        sellers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              storeName: { type: 'string' },
              productCount: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getFilterOptions() {
    return this.productsService.getFilterOptions();
  }

  /**
   * Get featured products
   */
  @Get('featured')
  @ApiOperation({
    summary: 'Get featured products',
    description: 'Retrieve all featured products',
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
          category: { type: 'object' },
          imageUrls: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
        },
      },
    },
  })
  async getFeaturedProducts() {
    return this.productsService.getFeaturedProducts();
  }

  /**
   * Get product by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieve a specific product by its ID',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'object' },
        imageUrls: { type: 'array', items: { type: 'string' } },
        specifications: { type: 'object' },
        tags: { type: 'array', items: { type: 'string' } },
        isActive: { type: 'boolean' },
        isFeatured: { type: 'boolean' },
        variants: { type: 'array' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOneProduct(@Param('id') id: string) {
    return this.productsService.findOneProduct(id);
  }

  @Get('by-campaign/:campaignId')
  @ApiOperation({
    summary: 'Get products by campaign',
    description: 'Retrieve all products associated with a specific campaign',
  })
  @ApiParam({
    name: 'campaignId',
    description: 'Campaign ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
              discountedPrice: { type: 'number' },
              hasDiscount: { type: 'boolean' },
              discountPercentage: { type: 'number' },
              category: { type: 'object' },
              sellerId: { type: 'object' },
              imageUrls: { type: 'array', items: { type: 'string' } },
              isActive: { type: 'boolean' },
              stock: { type: 'number' },
              tags: { type: 'array', items: { type: 'string' } },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Campaign not found or inactive' })
  async getProductsByCampaign(
    @Param('campaignId') campaignId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getProductsByCampaign(campaignId, page, limit);
  }
}
