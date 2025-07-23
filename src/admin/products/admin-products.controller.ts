import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminProductsService } from './admin-products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

/**
 * Admin Products Controller
 *
 * Handles product management operations for admin users.
 * Provides functionality to delete out-of-stock products and manage products.
 *
 * @description This controller provides admin-only product management services including:
 * - List out-of-stock products
 * - Delete all out-of-stock products
 * - Delete specific product
 *
 * @security All endpoints require ADMIN role authentication
 */
@ApiTags('Admin - Product Management')
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  /**
   * Stock olmayan ürünleri listeler
   *
   * @returns Stock olmayan ürün listesi
   *
   * @example
   * ```bash
   * GET /api/admin/products/out-of-stock
   * ```
   */
  @Get('out-of-stock')
  @ApiOperation({
    summary: 'List out-of-stock products',
    description: 'Get all products that have no stock (stock <= 0)',
    tags: ['Admin - Product Management'],
  })
  @ApiResponse({
    status: 200,
    description: 'Out-of-stock products retrieved successfully',
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
              stock: { type: 'number' },
              category: { type: 'object' },
              sellerId: { type: 'object' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string' },
            },
          },
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getOutOfStockProducts() {
    return this.adminProductsService.getOutOfStockProducts();
  }

  /**
   * Stock olmayan tüm ürünleri siler
   *
   * @returns Silme işlemi sonucu
   *
   * @example
   * ```bash
   * DELETE /api/admin/products/out-of-stock
   * ```
   */
  @Delete('out-of-stock')
  @ApiOperation({
    summary: 'Delete all out-of-stock products',
    description:
      'Permanently delete all products that have no stock (stock <= 0)',
    tags: ['Admin - Product Management'],
  })
  @ApiResponse({
    status: 200,
    description: 'Out-of-stock products deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Success message' },
        deletedCount: {
          type: 'number',
          description: 'Number of deleted products',
        },
        errors: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of errors if any occurred during deletion',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async deleteOutOfStockProducts() {
    return this.adminProductsService.deleteOutOfStockProducts();
  }

  /**
   * Belirli bir ürünü siler
   *
   * @param id - Ürün ID'si
   * @returns Silme mesajı
   *
   * @example
   * ```bash
   * DELETE /api/admin/products/507f1f77bcf86cd799439011
   * ```
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete specific product',
    description: 'Permanently delete a specific product by ID',
    tags: ['Admin - Product Management'],
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Success message' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async deleteProduct(@Param('id') id: string) {
    return this.adminProductsService.deleteProduct(id);
  }
}
