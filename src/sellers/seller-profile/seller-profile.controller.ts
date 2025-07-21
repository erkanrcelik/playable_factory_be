import {
  Controller,
  Get,
  Put,
  Body,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SellerProfileService } from './seller-profile.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../schemas/user.schema';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { updateProfileSchema } from './dto/update-profile.dto';

@ApiTags('Seller Profile')
@Controller('seller/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
@ApiBearerAuth()
export class SellerProfileController {
  constructor(private readonly sellerProfileService: SellerProfileService) {}

  /**
   * Get seller profile
   */
  @Get()
  @ApiOperation({
    summary: 'Get seller profile',
    description: 'Retrieve the current seller profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        sellerId: { type: 'string' },
        storeName: { type: 'string' },
        description: { type: 'string' },
        logoUrl: { type: 'string' },
        phoneNumber: { type: 'string' },
        website: { type: 'string' },
        address: { type: 'object' },
        businessHours: { type: 'object' },
        socialMedia: { type: 'object' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  async getProfile(@CurrentUser('id') sellerId: string) {
    return this.sellerProfileService.getProfile(sellerId);
  }

  /**
   * Update seller profile
   */
  @Put()
  @ApiOperation({
    summary: 'Update seller profile',
    description:
      'Update seller profile information including store details, contact info, and business hours',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        storeName: { type: 'string' },
        description: { type: 'string' },
        phoneNumber: { type: 'string' },
        website: { type: 'string' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            country: { type: 'string' },
            postalCode: { type: 'string' },
          },
        },
        businessHours: { type: 'object' },
        socialMedia: { type: 'object' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        sellerId: { type: 'string' },
        storeName: { type: 'string' },
        description: { type: 'string' },
        logoUrl: { type: 'string' },
        phoneNumber: { type: 'string' },
        website: { type: 'string' },
        address: { type: 'object' },
        businessHours: { type: 'object' },
        socialMedia: { type: 'object' },
        isActive: { type: 'boolean' },
        updatedAt: { type: 'string' },
      },
    },
  })
  async updateProfile(
    @Body(new ZodValidationPipe(updateProfileSchema)) updateDto: any,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProfileService.updateProfile(sellerId, updateDto);
  }

  /**
   * Upload seller logo
   */
  @Post('logo')
  @ApiOperation({
    summary: 'Upload seller logo',
    description: 'Upload a logo image for the seller profile (Max 5MB)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  @ApiResponse({
    status: 201,
    description: 'Logo uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        logoUrl: { type: 'string' },
        logoKey: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') sellerId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Logo file is required');
    }

    return this.sellerProfileService.uploadLogo(sellerId, file);
  }

  /**
   * Delete seller logo
   */
  @Delete('logo')
  @ApiOperation({
    summary: 'Delete seller logo',
    description: 'Remove the current logo from seller profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Logo deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No logo to delete' })
  async deleteLogo(@CurrentUser('id') sellerId: string) {
    return this.sellerProfileService.deleteLogo(sellerId);
  }

  /**
   * Toggle profile active status
   */
  @Put('toggle-active')
  @ApiOperation({
    summary: 'Toggle profile active status',
    description: 'Enable or disable the seller profile visibility',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        sellerId: { type: 'string' },
        storeName: { type: 'string' },
        isActive: { type: 'boolean' },
        updatedAt: { type: 'string' },
      },
    },
  })
  async toggleActiveStatus(@CurrentUser('id') sellerId: string) {
    return this.sellerProfileService.toggleActiveStatus(sellerId);
  }

  /**
   * Get public profile (for customers)
   */
  @Get('public/:sellerId')
  @ApiOperation({
    summary: 'Get public seller profile',
    description: 'Retrieve public profile information for customers',
  })
  @ApiResponse({
    status: 200,
    description: 'Public profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        sellerId: { type: 'string' },
        storeName: { type: 'string' },
        description: { type: 'string' },
        logoUrl: { type: 'string' },
        phoneNumber: { type: 'string' },
        website: { type: 'string' },
        address: { type: 'object' },
        businessHours: { type: 'object' },
        socialMedia: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getPublicProfile(@CurrentUser('id') sellerId: string) {
    return this.sellerProfileService.getPublicProfile(sellerId);
  }
}
