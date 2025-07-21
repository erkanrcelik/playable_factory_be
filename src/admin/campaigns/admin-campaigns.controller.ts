import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import { AdminCampaignsService } from './admin-campaigns.service';
import { CampaignWithDetails, CampaignStats } from './admin-campaigns.service';
import {
  CreatePlatformCampaignDto,
  UpdatePlatformCampaignDto,
  createPlatformCampaignSchema,
  updatePlatformCampaignSchema,
} from './dto';
import { CampaignErrorMessages } from './enums/campaign-error.enum';
import { CampaignType, DiscountType } from '../../schemas/campaign.schema';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@ApiTags('Admin Campaigns')
@Controller('admin/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminCampaignsController {
  constructor(private readonly adminCampaignsService: AdminCampaignsService) {}

  @Post('platform')
  @UsePipes(new ZodValidationPipe(createPlatformCampaignSchema))
  @ApiOperation({
    summary: 'Create platform campaign',
    description:
      'Create a new platform campaign with products and/or categories',
  })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string', enum: Object.values(CampaignType) },
        discountType: { type: 'string', enum: Object.values(DiscountType) },
        discountValue: { type: 'number' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              price: { type: 'number' },
              sellerName: { type: 'string' },
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
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: CampaignErrorMessages.INVALID_DATE_RANGE,
  })
  @ApiResponse({
    status: 400,
    description: CampaignErrorMessages.INVALID_DISCOUNT_VALUE,
  })
  @ApiResponse({
    status: 400,
    description: CampaignErrorMessages.INVALID_PRODUCTS,
  })
  @ApiResponse({
    status: 400,
    description: CampaignErrorMessages.INVALID_CATEGORIES,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createPlatformCampaign(
    @Body() createDto: CreatePlatformCampaignDto,
  ): Promise<CampaignWithDetails> {
    return this.adminCampaignsService.createPlatformCampaign(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all campaigns',
    description: 'Get paginated list of all campaigns with filtering options',
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
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search campaigns by name',
    example: 'summer sale',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CampaignType,
    description: 'Filter by campaign type',
    example: CampaignType.PLATFORM,
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
              _id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              type: { type: 'string', enum: Object.values(CampaignType) },
              discountType: {
                type: 'string',
                enum: Object.values(DiscountType),
              },
              discountValue: { type: 'number' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              isActive: { type: 'boolean' },
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    price: { type: 'number' },
                    sellerName: { type: 'string' },
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
                  },
                },
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllCampaigns(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean,
    @Query('type') type?: CampaignType,
  ) {
    return this.adminCampaignsService.findAllCampaigns({
      page,
      limit,
      search,
      isActive,
      type,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get campaign by ID',
    description: 'Get detailed information about a specific campaign',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string', enum: Object.values(CampaignType) },
        discountType: { type: 'string', enum: Object.values(DiscountType) },
        discountValue: { type: 'number' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              price: { type: 'number' },
              sellerName: { type: 'string' },
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
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: CampaignErrorMessages.CAMPAIGN_NOT_FOUND,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findCampaignById(
    @Param('id') id: string,
  ): Promise<CampaignWithDetails> {
    return this.adminCampaignsService.findCampaignById(id);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(updatePlatformCampaignSchema))
  @ApiOperation({
    summary: 'Update campaign',
    description: 'Update an existing campaign',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string', enum: Object.values(CampaignType) },
        discountType: { type: 'string', enum: Object.values(DiscountType) },
        discountValue: { type: 'number' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              price: { type: 'number' },
              sellerName: { type: 'string' },
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
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: CampaignErrorMessages.CAMPAIGN_NOT_FOUND,
  })
  @ApiResponse({
    status: 400,
    description: CampaignErrorMessages.INVALID_DATE_RANGE,
  })
  @ApiResponse({
    status: 400,
    description: CampaignErrorMessages.INVALID_DISCOUNT_VALUE,
  })
  @ApiResponse({
    status: 400,
    description: CampaignErrorMessages.INVALID_PRODUCTS,
  })
  @ApiResponse({
    status: 400,
    description: CampaignErrorMessages.INVALID_CATEGORIES,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateDto: UpdatePlatformCampaignDto,
  ): Promise<CampaignWithDetails> {
    return this.adminCampaignsService.updateCampaign(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete campaign',
    description: 'Delete a campaign permanently',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Campaign deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: CampaignErrorMessages.CAMPAIGN_NOT_FOUND,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteCampaign(@Param('id') id: string): Promise<{ message: string }> {
    return this.adminCampaignsService.deleteCampaign(id);
  }

  @Put(':id/toggle-status')
  @ApiOperation({
    summary: 'Toggle campaign status',
    description: 'Toggle campaign active/inactive status',
  })
  @ApiParam({
    name: 'id',
    description: 'Campaign ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string', enum: Object.values(CampaignType) },
        discountType: { type: 'string', enum: Object.values(DiscountType) },
        discountValue: { type: 'number' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              price: { type: 'number' },
              sellerName: { type: 'string' },
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
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: CampaignErrorMessages.CAMPAIGN_NOT_FOUND,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async toggleCampaignStatus(
    @Param('id') id: string,
  ): Promise<CampaignWithDetails> {
    return this.adminCampaignsService.toggleCampaignStatus(id);
  }

  @Get('stats/overview')
  @ApiOperation({
    summary: 'Get campaign statistics',
    description: 'Get overview statistics for all campaigns',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 50 },
        active: { type: 'number', example: 35 },
        inactive: { type: 'number', example: 15 },
        platform: { type: 'number', example: 30 },
        seller: { type: 'number', example: 20 },
        current: { type: 'number', example: 25 },
        upcoming: { type: 'number', example: 10 },
        expired: { type: 'number', example: 15 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCampaignStats(): Promise<CampaignStats> {
    return this.adminCampaignsService.getCampaignStats();
  }
}
