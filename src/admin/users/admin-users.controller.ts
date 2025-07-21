import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import { UserError, UserErrorMessages } from './enums/user-error.enum';

/**
 * Admin Users Controller
 *
 * Handles customer management operations for admin users.
 * Provides comprehensive customer listing, details, and management functionality.
 *
 * @description This controller provides admin-only customer management services including:
 * - List all customers with pagination and search
 * - View customer details and order history
 * - Delete customers (only if they have no orders)
 * - Toggle customer active status
 * - Get customer statistics
 *
 * @security All endpoints require ADMIN role authentication
 * @security Rate limiting is applied to prevent abuse
 */
@ApiTags('Admin - Customer Management')
@Controller('admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  /**
   * Get all customers with pagination and search
   *
   * Retrieves a paginated list of all customers with optional search and filtering.
   * Only returns customer role users, excluding sensitive information like passwords.
   *
   * @param page - Page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @param search - Search term for email, first name, or last name
   * @param isActive - Filter by active status (true/false)
   * @returns Paginated list of customers
   *
   * @example
   * ```bash
   * GET /api/admin/customers?page=1&limit=10&search=john&isActive=true
   * ```
   */
  @Get()
  @ApiOperation({
    summary: 'Get all customers with pagination and search',
    description:
      'Retrieves a paginated list of all customers. Supports search by email, first name, or last name. Only returns customer role users.',
    tags: ['Admin - Customer Management'],
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
    description: 'Number of items per page (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for email, first name, or last name',
    example: 'john',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Customer ID' },
              email: { type: 'string', description: 'Customer email' },
              firstName: { type: 'string', description: 'Customer first name' },
              lastName: { type: 'string', description: 'Customer last name' },
              role: { type: 'string', description: 'User role (customer)' },
              isActive: {
                type: 'boolean',
                description: 'Account active status',
              },
              isEmailVerified: {
                type: 'boolean',
                description: 'Email verification status',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Account creation date',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Last update date',
              },
            },
          },
        },
        total: { type: 'number', description: 'Total number of customers' },
        page: { type: 'number', description: 'Current page number' },
        limit: { type: 'number', description: 'Items per page' },
        totalPages: { type: 'number', description: 'Total number of pages' },
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
  async findAllCustomers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.adminUsersService.findAllCustomers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  /**
   * Get customer details by ID
   *
   * Retrieves detailed information about a specific customer.
   * Excludes sensitive information like passwords and tokens.
   *
   * @param id - Customer ID
   * @returns Customer details
   *
   * @example
   * ```bash
   * GET /api/admin/customers/507f1f77bcf86cd799439011
   * ```
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get customer details by ID',
    description:
      'Retrieves detailed information about a specific customer. Excludes sensitive information like passwords.',
    tags: ['Admin - Customer Management'],
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', description: 'Customer ID' },
        email: { type: 'string', description: 'Customer email' },
        firstName: { type: 'string', description: 'Customer first name' },
        lastName: { type: 'string', description: 'Customer last name' },
        phoneNumber: { type: 'string', description: 'Customer phone number' },
        role: { type: 'string', description: 'User role (customer)' },
        isActive: { type: 'boolean', description: 'Account active status' },
        isEmailVerified: {
          type: 'boolean',
          description: 'Email verification status',
        },
        addresses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              postalCode: { type: 'string' },
            },
          },
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Account creation date',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update date',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: UserErrorMessages[UserError.CUSTOMER_NOT_FOUND],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findCustomerById(@Param('id') id: string) {
    return this.adminUsersService.findCustomerById(id);
  }

  /**
   * Get customer orders
   *
   * Retrieves all orders for a specific customer with product details.
   * Shows order summary with items, prices, and status information.
   *
   * @param id - Customer ID
   * @returns Customer order history
   *
   * @example
   * ```bash
   * GET /api/admin/customers/507f1f77bcf86cd799439011/orders
   * ```
   */
  @Get(':id/orders')
  @ApiOperation({
    summary: 'Get customer orders',
    description:
      'Retrieves all orders for a specific customer. Shows order summary with items, prices, and status information.',
    tags: ['Admin - Customer Management'],
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer orders retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'Order ID' },
          totalAmount: { type: 'number', description: 'Total order amount' },
          status: { type: 'string', description: 'Order status' },
          paymentStatus: { type: 'string', description: 'Payment status' },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Order creation date',
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string', description: 'Product ID' },
                productName: { type: 'string', description: 'Product name' },
                price: { type: 'number', description: 'Product price' },
                quantity: { type: 'number', description: 'Quantity ordered' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: UserErrorMessages[UserError.CUSTOMER_NOT_FOUND],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getCustomerOrders(@Param('id') id: string) {
    return this.adminUsersService.getCustomerOrders(id);
  }

  /**
   * Delete customer
   *
   * Deletes a customer account. Only possible if the customer has no orders.
   * This is a safety measure to prevent data loss.
   *
   * @param id - Customer ID
   * @returns Success message
   *
   * @example
   * ```bash
   * DELETE /api/admin/customers/507f1f77bcf86cd799439011
   * ```
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete customer',
    description:
      'Deletes a customer account. Only possible if the customer has no orders. This is a safety measure to prevent data loss.',
    tags: ['Admin - Customer Management'],
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Success message' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: UserErrorMessages[UserError.CUSTOMER_HAS_ORDERS],
  })
  @ApiResponse({
    status: 404,
    description: UserErrorMessages[UserError.CUSTOMER_NOT_FOUND],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async deleteCustomer(@Param('id') id: string) {
    return this.adminUsersService.deleteCustomer(id);
  }

  /**
   * Toggle customer active status
   *
   * Activates or deactivates a customer account.
   * Deactivated customers cannot login to the system.
   *
   * @param id - Customer ID
   * @returns Updated customer information
   *
   * @example
   * ```bash
   * PUT /api/admin/customers/507f1f77bcf86cd799439011/toggle-status
   * ```
   */
  @Put(':id/toggle-status')
  @ApiOperation({
    summary: 'Toggle customer active status',
    description:
      'Activates or deactivates a customer account. Deactivated customers cannot login to the system.',
    tags: ['Admin - Customer Management'],
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', description: 'Customer ID' },
        email: { type: 'string', description: 'Customer email' },
        firstName: { type: 'string', description: 'Customer first name' },
        lastName: { type: 'string', description: 'Customer last name' },
        isActive: { type: 'boolean', description: 'Updated active status' },
        role: { type: 'string', description: 'User role (customer)' },
        isEmailVerified: {
          type: 'boolean',
          description: 'Email verification status',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Account creation date',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update date',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: UserErrorMessages[UserError.CUSTOMER_NOT_FOUND],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async toggleCustomerStatus(@Param('id') id: string) {
    return this.adminUsersService.toggleCustomerStatus(id);
  }

  /**
   * Get customer statistics
   *
   * Retrieves statistics about customers including total count,
   * active and inactive customer counts.
   *
   * @returns Customer statistics
   *
   * @example
   * ```bash
   * GET /api/admin/customers/stats/overview
   * ```
   */
  @Get('stats/overview')
  @ApiOperation({
    summary: 'Get customer statistics',
    description:
      'Retrieves statistics about customers including total count, active and inactive customer counts.',
    tags: ['Admin - Customer Management'],
  })
  @ApiResponse({
    status: 200,
    description: 'Customer statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of customers' },
        active: { type: 'number', description: 'Number of active customers' },
        inactive: {
          type: 'number',
          description: 'Number of inactive customers',
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
  async getCustomerStats() {
    return this.adminUsersService.getCustomerStats();
  }
}
