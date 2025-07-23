import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  UpdateEmailDto,
  updateProfileSchema,
  changePasswordSchema,
  updateEmailSchema,
} from './dto/update-profile.dto';
import {
  CreateAddressDto,
  UpdateAddressDto,
  createAddressSchema,
  updateAddressSchema,
} from './dto/address.dto';

/**
 * Users Controller
 *
 * Handles customer profile management, address management, and wishlist operations
 * for authenticated customers in the e-commerce platform
 */
@ApiTags('Customer Profile')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // PROFILE MANAGEMENT

  @Get('profile')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get customer profile',
    description: 'Retrieve customer profile information',
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiBearerAuth()
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  @Roles(UserRole.CUSTOMER)
  @UsePipes(new ZodValidationPipe(updateProfileSchema))
  @ApiOperation({
    summary: 'Update customer profile',
    description: 'Update customer profile information',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiBearerAuth()
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateData: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateData);
  }

  @Put('profile/password')
  @Roles(UserRole.CUSTOMER)
  @UsePipes(new ZodValidationPipe(changePasswordSchema))
  @ApiOperation({
    summary: 'Change password',
    description: 'Change customer password',
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiBearerAuth()
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordData: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordData);
  }

  @Put('profile/email')
  @Roles(UserRole.CUSTOMER)
  @UsePipes(new ZodValidationPipe(updateEmailSchema))
  @ApiOperation({
    summary: 'Update email',
    description: 'Update customer email address',
  })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  @ApiBearerAuth()
  async updateEmail(
    @CurrentUser('id') userId: string,
    @Body() updateEmailData: UpdateEmailDto,
  ) {
    return this.usersService.updateEmail(userId, updateEmailData);
  }

  // ADDRESS MANAGEMENT

  @Get('addresses')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get customer addresses',
    description: 'Retrieve all customer addresses',
  })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  @ApiBearerAuth()
  async getAddresses(@CurrentUser('id') userId: string) {
    return this.usersService.getAddresses(userId);
  }

  @Post('addresses')
  @Roles(UserRole.CUSTOMER)
  @UsePipes(new ZodValidationPipe(createAddressSchema))
  @ApiOperation({
    summary: 'Create address',
    description: 'Create new customer address',
  })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  @ApiBearerAuth()
  async createAddress(
    @CurrentUser('id') userId: string,
    @Body() addressData: CreateAddressDto,
  ) {
    return this.usersService.createAddress(userId, addressData);
  }

  @Put('addresses/:addressId')
  @Roles(UserRole.CUSTOMER)
  @UsePipes(new ZodValidationPipe(updateAddressSchema))
  @ApiOperation({
    summary: 'Update address',
    description: 'Update customer address',
  })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiParam({ name: 'addressId', description: 'Address ID' })
  @ApiBearerAuth()
  async updateAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
    @Body() updateData: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(userId, addressId, updateData);
  }

  @Put('addresses/:addressId/default')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Set default address',
    description: 'Set address as default',
  })
  @ApiResponse({ status: 200, description: 'Default address set successfully' })
  @ApiParam({ name: 'addressId', description: 'Address ID' })
  @ApiBearerAuth()
  async setDefaultAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.setDefaultAddress(userId, addressId);
  }

  @Delete('addresses/:addressId')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Delete address',
    description: 'Delete customer address',
  })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiParam({ name: 'addressId', description: 'Address ID' })
  @ApiBearerAuth()
  async deleteAddress(
    @CurrentUser('id') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.deleteAddress(userId, addressId);
  }

  // WISHLIST MANAGEMENT

  @Get('wishlist')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get wishlist',
    description: 'Retrieve customer wishlist',
  })
  @ApiResponse({ status: 200, description: 'Wishlist retrieved successfully' })
  @ApiBearerAuth()
  async getWishlist(@CurrentUser('id') userId: string) {
    return this.usersService.getWishlist(userId);
  }

  @Post('wishlist/:productId')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Add to wishlist',
    description: 'Add product to customer wishlist',
  })
  @ApiResponse({ status: 201, description: 'Product added to wishlist' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiBearerAuth()
  async addToWishlist(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body('notes') notes?: string,
  ) {
    return this.usersService.addToWishlist(userId, productId, notes);
  }

  @Delete('wishlist/:productId')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Remove from wishlist',
    description: 'Remove product from customer wishlist',
  })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiBearerAuth()
  async removeFromWishlist(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.usersService.removeFromWishlist(userId, productId);
  }

  @Put('wishlist/:wishlistItemId/notes')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Update wishlist notes',
    description: 'Update notes for wishlist item',
  })
  @ApiResponse({ status: 200, description: 'Wishlist notes updated' })
  @ApiParam({ name: 'wishlistItemId', description: 'Wishlist item ID' })
  @ApiBearerAuth()
  async updateWishlistNotes(
    @CurrentUser('id') userId: string,
    @Param('wishlistItemId') wishlistItemId: string,
    @Body('notes') notes: string,
  ) {
    return this.usersService.updateWishlistNotes(userId, wishlistItemId, notes);
  }
}
