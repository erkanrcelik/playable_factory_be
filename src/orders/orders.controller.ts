import { Controller, Get, Param, Put, UseGuards, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';
import { OrderStatus, PaymentStatus } from '../schemas/order.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { findOrdersSchema } from './dto/find-orders.dto';

/**
 * Orders Controller
 *
 * Handles customer order management including:
 * - Order listing with filtering and pagination
 * - Order detail retrieval
 * - Order tracking information
 * - Order cancellation
 *
 * All endpoints require customer authentication and role-based access control.
 */
@ApiTags('Customer Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Get customer's orders with filtering and pagination
   *
   * Retrieves a paginated list of orders for the authenticated customer.
   * Supports filtering by status, date range, and sorting options.
   *
   * @param userId - Authenticated customer ID
   * @param query - Query parameters for filtering and pagination
   * @returns Paginated list of order summaries
   */
  @Get()
  @ApiOperation({
    summary: 'Get customer orders',
    description:
      'Retrieve paginated list of orders for the authenticated customer with filtering options',
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
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    description: 'Filter by order status',
    example: OrderStatus.PENDING,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter orders from this date (ISO format)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter orders to this date (ISO format)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'totalPrice', 'status'],
    description: 'Sort field (default: createdAt)',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (default: desc)',
    example: 'desc',
  })
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
              _id: { type: 'string', description: 'Order ID' },
              status: { type: 'string', enum: Object.values(OrderStatus) },
              totalPrice: { type: 'number', description: 'Total order amount' },
              paymentStatus: {
                type: 'string',
                enum: Object.values(PaymentStatus),
              },
              itemCount: {
                type: 'number',
                description: 'Number of items in order',
              },
              orderDate: { type: 'string', format: 'date-time' },
              estimatedDelivery: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number', description: 'Total number of orders' },
        page: { type: 'number', description: 'Current page number' },
        limit: { type: 'number', description: 'Items per page' },
        totalPages: { type: 'number', description: 'Total number of pages' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findCustomerOrders(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(findOrdersSchema)) query: any,
  ) {
    return this.ordersService.findCustomerOrders(userId, query);
  }

  /**
   * Get detailed order information
   *
   * Retrieves comprehensive details for a specific order including
   * items, shipping information, and current status.
   *
   * @param orderId - Order ID
   * @param userId - Authenticated customer ID
   * @returns Detailed order information
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get order details',
    description:
      'Retrieve detailed information for a specific order including items and shipping details',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', description: 'Order ID' },
        status: { type: 'string', enum: Object.values(OrderStatus) },
        totalPrice: { type: 'number', description: 'Total order amount' },
        paymentStatus: { type: 'string', enum: Object.values(PaymentStatus) },
        itemCount: { type: 'number', description: 'Number of items' },
        orderDate: { type: 'string', format: 'date-time' },
        estimatedDelivery: { type: 'string', format: 'date-time' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'Product ID' },
              productName: { type: 'string', description: 'Product name' },
              productImage: {
                type: 'string',
                description: 'Product image URL',
              },
              sellerId: { type: 'string', description: 'Seller ID' },
              sellerName: { type: 'string', description: 'Seller name' },
              quantity: { type: 'number', description: 'Quantity ordered' },
              price: { type: 'number', description: 'Unit price' },
              subtotal: { type: 'number', description: 'Item subtotal' },
            },
          },
        },
        shippingAddress: {
          type: 'object',
          description: 'Shipping address details',
        },
        trackingNumber: {
          type: 'string',
          description: 'Package tracking number',
        },
        notes: { type: 'string', description: 'Customer notes' },
        sellerNotes: { type: 'string', description: 'Seller notes' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findOrderById(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.findOrderById(orderId, userId);
  }

  /**
   * Get order tracking information
   *
   * Provides comprehensive tracking information including current status,
   * location, tracking history, and estimated delivery.
   *
   * @param orderId - Order ID
   * @param userId - Authenticated customer ID
   * @returns Order tracking information
   */
  @Get(':id/tracking')
  @ApiOperation({
    summary: 'Get order tracking information',
    description:
      'Retrieve tracking information including status history and current location',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Order tracking information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'Order ID' },
        status: { type: 'string', enum: Object.values(OrderStatus) },
        trackingNumber: {
          type: 'string',
          description: 'Package tracking number',
        },
        estimatedDelivery: { type: 'string', format: 'date-time' },
        currentLocation: {
          type: 'string',
          description: 'Current package location',
        },
        trackingHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: Object.values(OrderStatus) },
              timestamp: { type: 'string', format: 'date-time' },
              description: {
                type: 'string',
                description: 'Status description',
              },
              completed: {
                type: 'boolean',
                description: 'Whether this step is completed',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getOrderTracking(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.getOrderTracking(orderId, userId);
  }

  /**
   * Cancel an order
   *
   * Cancels an order if it hasn't been shipped yet.
   * Restores product stock and updates order status.
   *
   * @param orderId - Order ID
   * @param userId - Authenticated customer ID
   * @returns Updated order information
   */
  @Put(':id/cancel')
  @ApiOperation({
    summary: 'Cancel order',
    description:
      'Cancel an order if it has not been shipped. Stock will be restored automatically.',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', description: 'Order ID' },
        status: { type: 'string', enum: [OrderStatus.CANCELLED] },
        totalPrice: { type: 'number', description: 'Total order amount' },
        paymentStatus: { type: 'string', enum: Object.values(PaymentStatus) },
        itemCount: { type: 'number', description: 'Number of items' },
        orderDate: { type: 'string', format: 'date-time' },
        items: {
          type: 'array',
          description: 'Order items with restored stock',
        },
        shippingAddress: {
          type: 'object',
          description: 'Shipping address details',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Order cannot be cancelled (already shipped/delivered)',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async cancelOrder(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.cancelOrder(orderId, userId);
  }
}
