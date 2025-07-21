import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExcludeController,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Address, User, UserRole, UserDocument } from '../schemas/user.schema';

@ApiExcludeController()
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiBearerAuth()
  async getProfile(@CurrentUser() user: UserDocument) {
    const userId = String(user._id);
    return this.usersService.findById(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiBearerAuth()
  async updateProfile(
    @CurrentUser() user: UserDocument,
    @Body() updateUserDto: User,
  ) {
    const userId = String(user._id);
    return this.usersService.update(userId, updateUserDto);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add user address' })
  @ApiResponse({ status: 201, description: 'Address added successfully' })
  @ApiBearerAuth()
  async addAddress(
    @CurrentUser() user: UserDocument,
    @Body() addressDto: Address,
  ) {
    const userId = String(user._id);
    return this.usersService.addAddress(userId, addressDto);
  }

  @Delete('addresses/:index')
  @ApiOperation({ summary: 'Remove user address' })
  @ApiResponse({ status: 200, description: 'Address removed successfully' })
  @ApiBearerAuth()
  async removeAddress(
    @CurrentUser() user: UserDocument,
    @Param('index') index: string,
  ) {
    const userId = String(user._id);
    return this.usersService.removeAddress(userId, parseInt(index));
  }

  @Put('addresses/:index')
  @ApiOperation({ summary: 'Update user address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiBearerAuth()
  async updateAddress(
    @CurrentUser() user: UserDocument,
    @Param('index') index: string,
    @Body() addressDto: Address,
  ) {
    const userId = String(user._id);
    return this.usersService.updateAddress(userId, parseInt(index), addressDto);
  }

  @Get('sellers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all sellers (Admin only)' })
  @ApiResponse({ status: 200, description: 'Sellers retrieved successfully' })
  @ApiBearerAuth()
  async getAllSellers() {
    return this.usersService.findByRole(UserRole.SELLER);
  }

  @Post('sellers/:id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve seller (Admin only)' })
  @ApiResponse({ status: 200, description: 'Seller approved successfully' })
  @ApiBearerAuth()
  async approveSeller(@Param('id') id: string) {
    return this.usersService.approveSeller(id);
  }
}
