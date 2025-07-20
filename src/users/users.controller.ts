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
  ApiExcludeController,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';

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
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiBearerAuth()
  async updateProfile(@CurrentUser() user: any, @Body() updateUserDto: any) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add user address' })
  @ApiResponse({ status: 201, description: 'Address added successfully' })
  @ApiBearerAuth()
  async addAddress(@CurrentUser() user: any, @Body() addressDto: any) {
    return this.usersService.addAddress(user.id, addressDto);
  }

  @Delete('addresses/:index')
  @ApiOperation({ summary: 'Remove user address' })
  @ApiResponse({ status: 200, description: 'Address removed successfully' })
  @ApiBearerAuth()
  async removeAddress(@CurrentUser() user: any, @Param('index') index: string) {
    return this.usersService.removeAddress(user.id, parseInt(index));
  }

  @Put('addresses/:index')
  @ApiOperation({ summary: 'Update user address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiBearerAuth()
  async updateAddress(
    @CurrentUser() user: any,
    @Param('index') index: string,
    @Body() addressDto: any,
  ) {
    return this.usersService.updateAddress(
      user.id,
      parseInt(index),
      addressDto,
    );
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
