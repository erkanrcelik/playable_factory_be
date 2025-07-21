import {
  Controller,
  Get,
  Param,
  Query,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SellerOrdersService } from './seller-orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../schemas/user.schema';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { findAllOrdersSchema } from './dto/find-all-orders.dto';
import { updateOrderStatusSchema } from './dto/update-order-status.dto';

@ApiTags('Seller Orders')
@Controller('seller/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
@ApiBearerAuth()
export class SellerOrdersController {
  constructor(private readonly sellerOrdersService: SellerOrdersService) {}

  /**
   * Get all orders for seller
   */
  @Get()
  @ApiOperation({
    summary: 'Get all orders for seller',
    description:
      'Retrieve all orders containing seller products with filtering and pagination',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Order status filter',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              orderNumber: { type: 'string' },
              status: { type: 'string' },
              totalAmount: { type: 'number' },
              customer: { type: 'object' },
              items: { type: 'array' },
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
  async findAllOrders(
    @Query(new ZodValidationPipe(findAllOrdersSchema)) query: any,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerOrdersService.findAllOrders(sellerId, query);
  }

  /**
   * Get order by ID for seller
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID for seller',
    description: 'Retrieve a specific order containing seller products',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        orderNumber: { type: 'string' },
        status: { type: 'string' },
        totalAmount: { type: 'number' },
        customer: { type: 'object' },
        items: { type: 'array' },
        shippingAddress: { type: 'object' },
        billingAddress: { type: 'object' },
        paymentMethod: { type: 'string' },
        trackingNumber: { type: 'string' },
        sellerNotes: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOneOrder(
    @Param('id') orderId: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerOrdersService.findOneOrder(orderId, sellerId);
  }

  /**
   * Update order status
   */
  @Put(':id/status')
  @ApiOperation({
    summary: 'Update order status',
    description:
      'Update the status of an order (pending, processing, shipped, delivered, cancelled)',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
          description: 'New order status',
        },
        trackingNumber: {
          type: 'string',
          description: 'Tracking number for shipping',
        },
        notes: {
          type: 'string',
          description: 'Additional notes for the order',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        orderNumber: { type: 'string' },
        status: { type: 'string' },
        trackingNumber: { type: 'string' },
        sellerNotes: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body(new ZodValidationPipe(updateOrderStatusSchema)) updateDto: any,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerOrdersService.updateOrderStatus(
      orderId,
      sellerId,
      updateDto,
    );
  }

  /**
   * Get order statistics for seller
   */
  @Get('stats/overview')
  @ApiOperation({
    summary: 'Get order statistics for seller',
    description:
      'Retrieve order statistics including counts by status and total revenue',
  })
  @ApiResponse({
    status: 200,
    description: 'Order statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalOrders: { type: 'number' },
        pendingOrders: { type: 'number' },
        processingOrders: { type: 'number' },
        shippedOrders: { type: 'number' },
        deliveredOrders: { type: 'number' },
        cancelledOrders: { type: 'number' },
        totalRevenue: { type: 'number' },
      },
    },
  })
  async getOrderStats(@CurrentUser('id') sellerId: string) {
    return this.sellerOrdersService.getOrderStats(sellerId);
  }
}
