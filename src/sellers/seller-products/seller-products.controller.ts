import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UserRole } from '../../schemas/user.schema';
import { SellerProductsService } from './seller-products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  FindAllProductsDto,
  createProductSchema,
  updateProductSchema,
  findAllProductsSchema,
} from './dto';

@ApiTags('Seller Product Management')
@Controller('seller/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
@ApiBearerAuth()
export class SellerProductsController {
  constructor(private readonly sellerProductsService: SellerProductsService) {}

  /**
   * List seller's products
   */
  @Get()
  @ApiOperation({
    summary: 'List seller products',
    description: 'List seller products with filtering and pagination',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'category', required: false, description: 'Category ID' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Active status filter',
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    description: 'Featured product filter',
  })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price' })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'Product list retrieved successfully',
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllProducts(
    @Query(new ZodValidationPipe(findAllProductsSchema))
    query: FindAllProductsDto,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.findAllProducts(sellerId, query);
  }

  /**
   * Get specific product
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get product details',
    description: 'Get seller product details',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details retrieved successfully',
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
  async findOneProduct(
    @Param('id') productId: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.findOneProduct(productId, sellerId);
  }

  /**
   * Create new product
   */
  @Post()
  @ApiOperation({
    summary: 'Create new product',
    description: 'Create new product for seller',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'iPhone 15 Pro' },
        description: { type: 'string', example: 'Apple iPhone 15 Pro 256GB' },
        price: { type: 'number', example: 999.99 },
        category: { type: 'string', example: '507f1f77bcf86cd799439011' },
        specifications: { type: 'object' },
        tags: { type: 'array', items: { type: 'string' } },
        isFeatured: { type: 'boolean' },
        variants: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async createProduct(
    @Body(new ZodValidationPipe(createProductSchema))
    createProductDto: CreateProductDto,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.createProduct(createProductDto, sellerId);
  }

  /**
   * Update product
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update product',
    description: 'Update seller product',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'iPhone 15 Pro Max' },
        description: {
          type: 'string',
          example: 'Apple iPhone 15 Pro Max 512GB',
        },
        price: { type: 'number', example: 1299.99 },
        category: { type: 'string', example: '507f1f77bcf86cd799439011' },
        specifications: { type: 'object' },
        tags: { type: 'array', items: { type: 'string' } },
        isFeatured: { type: 'boolean' },
        isActive: { type: 'boolean' },
        variants: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @Param('id') productId: string,
    @Body(new ZodValidationPipe(updateProductSchema))
    updateProductDto: UpdateProductDto,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.updateProduct(
      productId,
      updateProductDto,
      sellerId,
    );
  }

  /**
   * Delete product
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product',
    description: 'Delete seller product',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product deleted successfully' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(
    @Param('id') productId: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.deleteProduct(productId, sellerId);
  }

  /**
   * Toggle product status (active/inactive)
   */
  @Put(':id/toggle-status')
  @ApiOperation({
    summary: 'Toggle product status',
    description: 'Toggle product active/inactive status',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product status toggled successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async toggleProductStatus(
    @Param('id') productId: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.toggleProductStatus(productId, sellerId);
  }

  /**
   * Upload product image
   */
  @Post(':id/upload-image')
  @ApiOperation({
    summary: 'Upload product image',
    description: 'Upload image for product (MinIO)',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string' },
        imageKey: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or size',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async uploadProductImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') sellerId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.sellerProductsService.uploadProductImage(
      productId,
      file,
      sellerId,
    );
  }

  /**
   * Delete product image
   */
  @Delete(':id/images/:imageKey')
  @ApiOperation({
    summary: 'Delete product image',
    description: 'Delete specific image from product',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'imageKey', description: 'Image key' })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Image deleted successfully' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProductImage(
    @Param('id') productId: string,
    @Param('imageKey') imageKey: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.deleteProductImage(
      productId,
      imageKey,
      sellerId,
    );
  }

  /**
   * Get seller product statistics
   */
  @Get('stats/overview')
  @ApiOperation({
    summary: 'Get product statistics',
    description: 'Get seller product statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total product count' },
        active: { type: 'number', description: 'Active product count' },
        inactive: { type: 'number', description: 'Inactive product count' },
        featured: { type: 'number', description: 'Featured product count' },
        avgPrice: { type: 'number', description: 'Average price' },
      },
    },
  })
  async getProductStats(@CurrentUser('id') sellerId: string) {
    return this.sellerProductsService.getProductStats(sellerId);
  }
}
