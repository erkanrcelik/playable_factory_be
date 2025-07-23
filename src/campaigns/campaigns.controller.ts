import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { findCampaignsSchema } from './dto/find-campaigns.dto';
import { CampaignType, DiscountType } from '../schemas/campaign.schema';

/**
 * Public Campaigns Controller
 *
 * Provides public access to campaign information for customers including:
 * - All active campaigns (platform + seller)
 * - Campaign filtering and search
 * - Campaign details
 * - Category and product specific campaigns
 * - Trending campaigns
 *
 * No authentication required for these endpoints.
 */
@ApiTags('Public Campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  /**
   * Get all active campaigns with filtering
   *
   * Returns both platform and seller campaigns that are currently active.
   * Supports comprehensive filtering by type, category, product, discount range, etc.
   *
   * @param query - Query parameters for filtering and pagination
   * @returns Paginated list of active campaigns
   */
  @Get()
  @ApiOperation({
    summary: 'Get all active campaigns',
    description:
      'Retrieve all active platform and seller campaigns with filtering and pagination support',
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
    description: 'Items per page (default: 20, max: 50)',
    example: 20,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CampaignType,
    description: 'Filter by campaign type',
    example: CampaignType.PLATFORM,
  })
  @ApiQuery({
    name: 'discountType',
    required: false,
    enum: DiscountType,
    description: 'Filter by discount type',
    example: DiscountType.PERCENTAGE,
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter campaigns applicable to specific category',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    type: String,
    description: 'Filter campaigns applicable to specific product',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'minDiscount',
    required: false,
    type: Number,
    description: 'Minimum discount value',
    example: 10,
  })
  @ApiQuery({
    name: 'maxDiscount',
    required: false,
    type: Number,
    description: 'Maximum discount value',
    example: 50,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in campaign name and description',
    example: 'summer sale',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'discountValue', 'endDate', 'name'],
    description: 'Sort field (default: createdAt)',
    example: 'discountValue',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (default: desc)',
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaigns retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Campaign ID' },
              name: { type: 'string', description: 'Campaign name' },
              type: { type: 'string', enum: Object.values(CampaignType) },
              discountType: {
                type: 'string',
                enum: Object.values(DiscountType),
              },
              discountValue: {
                type: 'number',
                description: 'Discount amount or percentage',
              },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              description: {
                type: 'string',
                description: 'Campaign description',
              },
              imageUrl: {
                type: 'string',
                description: 'Campaign banner image URL',
              },
              minOrderAmount: {
                type: 'number',
                description: 'Minimum order amount for campaign',
              },
              isActive: {
                type: 'boolean',
                description: 'Campaign active status',
              },
              applicableItems: {
                type: 'object',
                properties: {
                  allProducts: {
                    type: 'boolean',
                    description: 'Applies to all products',
                  },
                  categories: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
                  products: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
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
              remainingDays: {
                type: 'number',
                description: 'Days until campaign ends',
              },
              isExpired: {
                type: 'boolean',
                description: 'Whether campaign has expired',
              },
            },
          },
        },
        total: { type: 'number', description: 'Total number of campaigns' },
        page: { type: 'number', description: 'Current page number' },
        limit: { type: 'number', description: 'Items per page' },
        totalPages: { type: 'number', description: 'Total number of pages' },
      },
    },
  })
  async findAllCampaigns(
    @Query(new ZodValidationPipe(findCampaignsSchema)) query: any,
  ) {
    return this.campaignsService.findAllCampaigns(query);
  }

  /**
   * Get trending campaigns
   *
   * Returns the most attractive campaigns based on discount value and recency.
   * Perfect for homepage promotions and featured campaigns.
   *
   * @param limit - Maximum number of campaigns to return
   * @returns List of trending campaigns
   */
  @Get('trending')
  @ApiOperation({
    summary: 'Get trending campaigns',
    description:
      'Retrieve trending campaigns with highest discounts and most recent updates',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of campaigns to return (default: 6)',
    example: 6,
  })
  @ApiResponse({
    status: 200,
    description: 'Trending campaigns retrieved successfully',
    schema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/CampaignSummary',
      },
    },
  })
  async getTrendingCampaigns(@Query('limit') limit: number = 6) {
    return this.campaignsService.getTrendingCampaigns(limit);
  }

  /**
   * Get campaign details by ID
   *
   * Returns comprehensive information about a specific campaign including
   * applicable products, categories, and seller information.
   *
   * @param campaignId - Campaign ID
   * @returns Detailed campaign information
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get campaign details',
    description: 'Retrieve detailed information about a specific campaign',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign details retrieved successfully',
    schema: {
      $ref: '#/components/schemas/CampaignSummary',
    },
  })
  @ApiResponse({ status: 404, description: 'Campaign not found or expired' })
  async findCampaignById(@Param('id') campaignId: string) {
    return this.campaignsService.findCampaignById(campaignId);
  }

  /**
   * Get campaigns by category
   *
   * Returns all campaigns that apply to products in a specific category.
   * Includes both direct category campaigns and "all products" campaigns.
   *
   * @param categoryId - Category ID
   * @param limit - Maximum number of campaigns to return
   * @returns List of campaigns applicable to the category
   */
  @Get('category/:categoryId')
  @ApiOperation({
    summary: 'Get campaigns by category',
    description: 'Retrieve campaigns applicable to a specific product category',
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
    description: 'Maximum number of campaigns to return (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Category campaigns retrieved successfully',
    schema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/CampaignSummary',
      },
    },
  })
  async findCampaignsByCategory(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.campaignsService.findCampaignsByCategory(categoryId, limit);
  }

  /**
   * Get campaigns by product
   *
   * Returns all campaigns that apply to a specific product.
   * Includes direct product campaigns, category campaigns, and "all products" campaigns.
   *
   * @param productId - Product ID
   * @param limit - Maximum number of campaigns to return
   * @returns List of campaigns applicable to the product
   */
  @Get('product/:productId')
  @ApiOperation({
    summary: 'Get campaigns by product',
    description: 'Retrieve campaigns applicable to a specific product',
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
    description: 'Maximum number of campaigns to return (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Product campaigns retrieved successfully',
    schema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/CampaignSummary',
      },
    },
  })
  async findCampaignsByProduct(
    @Param('productId') productId: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.campaignsService.findCampaignsByProduct(productId, limit);
  }

  /**
   * Get campaigns by seller
   *
   * Returns all active campaigns created by a specific seller.
   * Used for seller profile pages to show their ongoing promotions.
   *
   * @param sellerId - Seller ID
   * @param limit - Maximum number of campaigns to return
   * @returns List of active campaigns created by the seller
   */
  @Get('seller/:sellerId')
  @ApiOperation({
    summary: 'Get campaigns by seller',
    description: 'Retrieve active campaigns created by a specific seller',
  })
  @ApiParam({
    name: 'sellerId',
    description: 'Seller ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of campaigns to return (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Seller campaigns retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', description: 'Campaign ID' },
          name: { type: 'string', description: 'Campaign name' },
          type: { type: 'string', enum: Object.values(CampaignType) },
          discountType: { type: 'string', enum: Object.values(DiscountType) },
          discountValue: {
            type: 'number',
            description: 'Discount amount or percentage',
          },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          description: { type: 'string', description: 'Campaign description' },
          imageUrl: {
            type: 'string',
            description: 'Campaign banner image URL',
          },
          minOrderAmount: {
            type: 'number',
            description: 'Minimum order amount',
          },
          isActive: { type: 'boolean', description: 'Campaign active status' },
          applicableItems: {
            type: 'object',
            properties: {
              allProducts: {
                type: 'boolean',
                description: 'Applies to all products',
              },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
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
          remainingDays: {
            type: 'number',
            description: 'Days until campaign ends',
          },
          isExpired: {
            type: 'boolean',
            description: 'Whether campaign has expired',
          },
        },
      },
    },
  })
  async findCampaignsBySeller(
    @Param('sellerId') sellerId: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.campaignsService.findCampaignsBySeller(sellerId, limit);
  }

  /**
   * Check campaign applicability
   *
   * Checks if a specific campaign applies to a specific product.
   * Useful for cart calculations and product detail pages.
   *
   * @param campaignId - Campaign ID
   * @param productId - Product ID
   * @returns Whether the campaign applies to the product
   */
  @Get(':campaignId/applicable/:productId')
  @ApiOperation({
    summary: 'Check campaign applicability',
    description: 'Check if a campaign is applicable to a specific product',
  })
  @ApiParam({
    name: 'campaignId',
    description: 'Campaign ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign applicability checked successfully',
    schema: {
      type: 'object',
      properties: {
        applicable: {
          type: 'boolean',
          description: 'Whether campaign applies to product',
        },
        campaignId: { type: 'string', description: 'Campaign ID' },
        productId: { type: 'string', description: 'Product ID' },
      },
    },
  })
  async checkCampaignApplicability(
    @Param('campaignId') campaignId: string,
    @Param('productId') productId: string,
  ) {
    const applicable = await this.campaignsService.isCampaignApplicable(
      campaignId,
      productId,
    );

    return {
      applicable,
      campaignId,
      productId,
    };
  }
}
