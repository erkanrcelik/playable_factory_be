import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SellerCampaignsService } from './seller-campaigns.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../schemas/user.schema';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { findAllCampaignsSchema } from './dto/find-all-campaigns.dto';
import { createCampaignSchema } from './dto/create-campaign.dto';
import { updateCampaignSchema } from './dto/update-campaign.dto';

@ApiTags('Seller Campaigns')
@Controller('seller/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
@ApiBearerAuth()
export class SellerCampaignsController {
  constructor(
    private readonly sellerCampaignsService: SellerCampaignsService,
  ) {}

  /**
   * Get all campaigns for seller
   */
  @Get()
  @ApiOperation({
    summary: 'Get all campaigns for seller',
    description:
      'Retrieve all campaigns created by the seller with filtering and pagination',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Campaign status filter',
  })
  @ApiQuery({
    name: 'discountType',
    required: false,
    description: 'Discount type filter',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order' })
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
              discountType: { type: 'string' },
              discountValue: { type: 'number' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              isActive: { type: 'boolean' },
              productIds: { type: 'array' },
              imageUrl: { type: 'string' },
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
  async findAllCampaigns(
    @Query(new ZodValidationPipe(findAllCampaignsSchema)) query: any,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerCampaignsService.findAllCampaigns(sellerId, query);
  }

  /**
   * Get campaign by ID for seller
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get campaign by ID for seller',
    description: 'Retrieve a specific campaign created by the seller',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        discountType: { type: 'string' },
        discountValue: { type: 'number' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        isActive: { type: 'boolean' },
        productIds: { type: 'array' },
        imageUrl: { type: 'string' },
        maxUsage: { type: 'number' },
        minOrderAmount: { type: 'number' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findOneCampaign(
    @Param('id') campaignId: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerCampaignsService.findOneCampaign(campaignId, sellerId);
  }

  /**
   * Create new campaign
   */
  @Post()
  @ApiOperation({
    summary: 'Create new campaign',
    description: 'Create a new campaign with seller products',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        discountType: { type: 'string', enum: ['percentage', 'amount'] },
        discountValue: { type: 'number' },
        productIds: { type: 'array', items: { type: 'string' } },
        isActive: { type: 'boolean' },
        maxUsage: { type: 'number' },
        minOrderAmount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        discountType: { type: 'string' },
        discountValue: { type: 'number' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        isActive: { type: 'boolean' },
        productIds: { type: 'array' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid campaign data' })
  async createCampaign(
    @Body(new ZodValidationPipe(createCampaignSchema)) createDto: any,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerCampaignsService.createCampaign(sellerId, createDto);
  }

  /**
   * Update campaign
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update campaign',
    description: 'Update an existing campaign created by the seller',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        discountType: { type: 'string', enum: ['percentage', 'amount'] },
        discountValue: { type: 'number' },
        productIds: { type: 'array', items: { type: 'string' } },
        isActive: { type: 'boolean' },
        maxUsage: { type: 'number' },
        minOrderAmount: { type: 'number' },
      },
    },
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
        discountType: { type: 'string' },
        discountValue: { type: 'number' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        isActive: { type: 'boolean' },
        productIds: { type: 'array' },
        imageUrl: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid campaign data' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async updateCampaign(
    @Param('id') campaignId: string,
    @Body(new ZodValidationPipe(updateCampaignSchema)) updateDto: any,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerCampaignsService.updateCampaign(
      campaignId,
      sellerId,
      updateDto,
    );
  }

  /**
   * Delete campaign
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete campaign',
    description: 'Delete a campaign (only if not active)',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Cannot delete active campaign' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async deleteCampaign(
    @Param('id') campaignId: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerCampaignsService.deleteCampaign(campaignId, sellerId);
  }

  /**
   * Upload campaign image
   */
  @Post(':id/image')
  @ApiOperation({
    summary: 'Upload campaign image',
    description: 'Upload an image for the campaign (Max 5MB)',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Campaign image file',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({
    status: 201,
    description: 'Campaign image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string' },
        imageKey: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async uploadCampaignImage(
    @Param('id') campaignId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') sellerId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.sellerCampaignsService.uploadCampaignImage(
      campaignId,
      sellerId,
      file,
    );
  }

  /**
   * Toggle campaign active status
   */
  @Put(':id/toggle-status')
  @ApiOperation({
    summary: 'Toggle campaign active status',
    description: 'Enable or disable the campaign',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        isActive: { type: 'boolean' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async toggleCampaignStatus(
    @Param('id') campaignId: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerCampaignsService.toggleCampaignStatus(
      campaignId,
      sellerId,
    );
  }

  /**
   * Get campaign statistics for seller
   */
  @Get('stats/overview')
  @ApiOperation({
    summary: 'Get campaign statistics for seller',
    description: 'Retrieve campaign statistics including counts by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalCampaigns: { type: 'number' },
        activeCampaigns: { type: 'number' },
        inactiveCampaigns: { type: 'number' },
        expiredCampaigns: { type: 'number' },
        upcomingCampaigns: { type: 'number' },
      },
    },
  })
  async getCampaignStats(@CurrentUser('id') sellerId: string) {
    return this.sellerCampaignsService.getCampaignStats(sellerId);
  }
}
