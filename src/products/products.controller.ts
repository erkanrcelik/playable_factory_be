import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExcludeController,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, UserDocument } from '../schemas/user.schema';
import { Product } from '../schemas/product.schema';

@ApiExcludeController()
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(@Query() query: Record<string, unknown>) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({
    status: 200,
    description: 'Featured products retrieved successfully',
  })
  async getFeaturedProducts() {
    return this.productsService.getFeaturedProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new product (Seller/Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiBearerAuth()
  async create(
    @Body() createProductDto: Product,
    @CurrentUser() user: UserDocument,
  ) {
    const userId = String(user._id);
    return this.productsService.create(createProductDto, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update product (Seller/Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Product,
    @CurrentUser() user: UserDocument,
  ) {
    const userId = String(user._id);
    return this.productsService.update(id, updateProductDto, userId, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete product (Seller/Admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    const userId = String(user._id);
    return this.productsService.remove(id, userId, user.role);
  }

  @Get('seller/my-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiOperation({ summary: 'Get seller products (Seller only)' })
  @ApiResponse({
    status: 200,
    description: 'Seller products retrieved successfully',
  })
  @ApiBearerAuth()
  async getMyProducts(@CurrentUser() user: UserDocument) {
    const userId = String(user._id);
    return this.productsService.findBySeller(userId);
  }

  @Put(':id/toggle-featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle product featured status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product featured status toggled successfully',
  })
  @ApiBearerAuth()
  async toggleFeatured(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    const userId = String(user._id);
    return this.productsService.toggleFeatured(id, userId, user.role);
  }
}
