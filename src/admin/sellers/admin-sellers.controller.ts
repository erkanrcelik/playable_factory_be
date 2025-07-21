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
import { AdminSellersService } from './admin-sellers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import { SellerError, SellerErrorMessages } from './enums/seller-error.enum';
import { FindAllSellersDto } from './dto';

/**
 * Admin Sellers Controller
 *
 * Handles seller management operations for admin users.
 * Provides comprehensive seller listing, approval, and management functionality.
 *
 * @description This controller provides admin-only seller management services including:
 * - List all sellers with pagination and search
 * - View seller details and profile information
 * - Approve/reject seller applications
 * - Delete sellers (only if they have no products)
 * - Toggle seller active status
 * - Get seller statistics
 *
 * @security All endpoints require ADMIN role authentication
 * @security Rate limiting is applied to prevent abuse
 */
@ApiTags('Admin - Seller Management')
@Controller('admin/sellers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminSellersController {
  constructor(private readonly adminSellersService: AdminSellersService) {}

  /**
   * Get all sellers with pagination and search
   *
   * Retrieves a paginated list of all sellers with optional search and filtering.
   * Only returns seller role users, excluding sensitive information like passwords.
   *
   * @param page - Page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @param search - Search term for email, first name, or last name
   * @param isApproved - Filter by approval status (true/false)
   * @param isActive - Filter by active status (true/false)
   * @returns Paginated list of sellers with profiles
   *
   * @example
   * ```bash
   * GET /api/admin/sellers?page=1&limit=10&search=john&isApproved=true&isActive=true
   * ```
   */
  @Get()
  @ApiOperation({
    summary: 'Get all sellers with pagination and search',
    description:
      'Retrieves a paginated list of all sellers. Supports search by email, first name, or last name. Only returns seller role users with their profiles.',
    tags: ['Admin - Seller Management'],
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
    name: 'isApproved',
    required: false,
    type: Boolean,
    description: 'Filter by approval status',
    example: true,
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
    description: 'Sellers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'Seller ID' },
              email: { type: 'string', description: 'Seller email' },
              firstName: { type: 'string', description: 'Seller first name' },
              lastName: { type: 'string', description: 'Seller last name' },
              phoneNumber: {
                type: 'string',
                description: 'Seller phone number',
              },
              role: { type: 'string', description: 'User role (seller)' },
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
              profile: {
                type: 'object',
                properties: {
                  _id: { type: 'string', description: 'Profile ID' },
                  storeName: { type: 'string', description: 'Store name' },
                  storeDescription: {
                    type: 'string',
                    description: 'Store description',
                  },
                  isApproved: {
                    type: 'boolean',
                    description: 'Approval status',
                  },
                  logo: { type: 'string', description: 'Store logo URL' },
                  banner: { type: 'string', description: 'Store banner URL' },
                  businessCategories: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Business categories',
                  },
                  contactEmail: {
                    type: 'string',
                    description: 'Contact email',
                  },
                  contactPhone: {
                    type: 'string',
                    description: 'Contact phone',
                  },
                  website: { type: 'string', description: 'Website URL' },
                  socialMedia: {
                    type: 'object',
                    properties: {
                      facebook: { type: 'string' },
                      instagram: { type: 'string' },
                      twitter: { type: 'string' },
                    },
                  },
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Profile creation date',
                  },
                  updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Profile update date',
                  },
                },
              },
            },
          },
        },
        total: { type: 'number', description: 'Total number of sellers' },
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
  async findAllSellers(@Query() query: FindAllSellersDto) {
    return this.adminSellersService.findAllSellers({
      page: query.page || 1,
      limit: query.limit || 10,
      search: query.search,
      isApproved: query.isApproved,
      isActive: query.isActive,
    });
  }

  /**
   * Get seller details by ID
   *
   * Retrieves detailed information about a specific seller including their profile.
   * Excludes sensitive information like passwords and tokens.
   *
   * @param id - Seller ID
   * @returns Seller details with profile
   *
   * @example
   * ```bash
   * GET /api/admin/sellers/507f1f77bcf86cd799439011
   * ```
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get seller details by ID',
    description:
      'Retrieves detailed information about a specific seller including their profile. Excludes sensitive information like passwords.',
    tags: ['Admin - Seller Management'],
  })
  @ApiParam({
    name: 'id',
    description: 'Seller ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', description: 'Seller ID' },
        email: { type: 'string', description: 'Seller email' },
        firstName: { type: 'string', description: 'Seller first name' },
        lastName: { type: 'string', description: 'Seller last name' },
        phoneNumber: { type: 'string', description: 'Seller phone number' },
        role: { type: 'string', description: 'User role (seller)' },
        isActive: { type: 'boolean', description: 'Account active status' },
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
        profile: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Profile ID' },
            storeName: { type: 'string', description: 'Store name' },
            storeDescription: {
              type: 'string',
              description: 'Store description',
            },
            isApproved: { type: 'boolean', description: 'Approval status' },
            logo: { type: 'string', description: 'Store logo URL' },
            banner: { type: 'string', description: 'Store banner URL' },
            businessCategories: {
              type: 'array',
              items: { type: 'string' },
              description: 'Business categories',
            },
            contactEmail: { type: 'string', description: 'Contact email' },
            contactPhone: { type: 'string', description: 'Contact phone' },
            website: { type: 'string', description: 'Website URL' },
            socialMedia: {
              type: 'object',
              properties: {
                facebook: { type: 'string' },
                instagram: { type: 'string' },
                twitter: { type: 'string' },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Profile creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Profile update date',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: SellerErrorMessages[SellerError.SELLER_NOT_FOUND],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findSellerById(@Param('id') id: string) {
    return this.adminSellersService.findSellerById(id);
  }

  /**
   * Approve seller
   *
   * Approves a seller's application, allowing them to sell products.
   *
   * @param id - Seller ID
   * @returns Updated seller information
   *
   * @example
   * ```bash
   * PUT /api/admin/sellers/507f1f77bcf86cd799439011/approve
   * ```
   */
  @Put(':id/approve')
  @ApiOperation({
    summary: 'Approve seller',
    description:
      "Approves a seller's application, allowing them to sell products on the platform.",
    tags: ['Admin - Seller Management'],
  })
  @ApiParam({
    name: 'id',
    description: 'Seller ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller approved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', description: 'Seller ID' },
        email: { type: 'string', description: 'Seller email' },
        firstName: { type: 'string', description: 'Seller first name' },
        lastName: { type: 'string', description: 'Seller last name' },
        isActive: { type: 'boolean', description: 'Account active status' },
        role: { type: 'string', description: 'User role (seller)' },
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
        profile: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Profile ID' },
            storeName: { type: 'string', description: 'Store name' },
            isApproved: {
              type: 'boolean',
              description: 'Approval status (true)',
            },
            storeDescription: {
              type: 'string',
              description: 'Store description',
            },
            logo: { type: 'string', description: 'Store logo URL' },
            banner: { type: 'string', description: 'Store banner URL' },
            businessCategories: {
              type: 'array',
              items: { type: 'string' },
              description: 'Business categories',
            },
            contactEmail: { type: 'string', description: 'Contact email' },
            contactPhone: { type: 'string', description: 'Contact phone' },
            website: { type: 'string', description: 'Website URL' },
            socialMedia: {
              type: 'object',
              properties: {
                facebook: { type: 'string' },
                instagram: { type: 'string' },
                twitter: { type: 'string' },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Profile creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Profile update date',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: SellerErrorMessages[SellerError.SELLER_NOT_FOUND],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async approveSeller(@Param('id') id: string) {
    return this.adminSellersService.approveSeller(id);
  }

  /**
   * Reject seller
   *
   * Rejects a seller's application, preventing them from selling products.
   *
   * @param id - Seller ID
   * @returns Updated seller information
   *
   * @example
   * ```bash
   * PUT /api/admin/sellers/507f1f77bcf86cd799439011/reject
   * ```
   */
  @Put(':id/reject')
  @ApiOperation({
    summary: 'Reject seller',
    description:
      "Rejects a seller's application, preventing them from selling products on the platform.",
    tags: ['Admin - Seller Management'],
  })
  @ApiParam({
    name: 'id',
    description: 'Seller ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller rejected successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', description: 'Seller ID' },
        email: { type: 'string', description: 'Seller email' },
        firstName: { type: 'string', description: 'Seller first name' },
        lastName: { type: 'string', description: 'Seller last name' },
        isActive: { type: 'boolean', description: 'Account active status' },
        role: { type: 'string', description: 'User role (seller)' },
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
        profile: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Profile ID' },
            storeName: { type: 'string', description: 'Store name' },
            isApproved: {
              type: 'boolean',
              description: 'Approval status (false)',
            },
            storeDescription: {
              type: 'string',
              description: 'Store description',
            },
            logo: { type: 'string', description: 'Store logo URL' },
            banner: { type: 'string', description: 'Store banner URL' },
            businessCategories: {
              type: 'array',
              items: { type: 'string' },
              description: 'Business categories',
            },
            contactEmail: { type: 'string', description: 'Contact email' },
            contactPhone: { type: 'string', description: 'Contact phone' },
            website: { type: 'string', description: 'Website URL' },
            socialMedia: {
              type: 'object',
              properties: {
                facebook: { type: 'string' },
                instagram: { type: 'string' },
                twitter: { type: 'string' },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Profile creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Profile update date',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: SellerErrorMessages[SellerError.SELLER_NOT_FOUND],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async rejectSeller(@Param('id') id: string) {
    return this.adminSellersService.rejectSeller(id);
  }

  /**
   * Delete seller
   *
   * Deletes a seller account. Only possible if the seller has no products.
   * This is a safety measure to prevent data loss.
   *
   * @param id - Seller ID
   * @returns Success message
   *
   * @example
   * ```bash
   * DELETE /api/admin/sellers/507f1f77bcf86cd799439011
   * ```
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete seller',
    description:
      'Deletes a seller account. Only possible if the seller has no products. This is a safety measure to prevent data loss.',
    tags: ['Admin - Seller Management'],
  })
  @ApiParam({
    name: 'id',
    description: 'Seller ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Success message' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: SellerErrorMessages[SellerError.SELLER_HAS_PRODUCTS],
  })
  @ApiResponse({
    status: 404,
    description: SellerErrorMessages[SellerError.SELLER_NOT_FOUND],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async deleteSeller(@Param('id') id: string) {
    return this.adminSellersService.deleteSeller(id);
  }

  /**
   * Toggle seller active status
   *
   * Activates or deactivates a seller account.
   * Deactivated sellers cannot login to the system.
   *
   * @param id - Seller ID
   * @returns Updated seller information
   *
   * @example
   * ```bash
   * PUT /api/admin/sellers/507f1f77bcf86cd799439011/toggle-status
   * ```
   */
  @Put(':id/toggle-status')
  @ApiOperation({
    summary: 'Toggle seller active status',
    description:
      'Activates or deactivates a seller account. Deactivated sellers cannot login to the system.',
    tags: ['Admin - Seller Management'],
  })
  @ApiParam({
    name: 'id',
    description: 'Seller ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', description: 'Seller ID' },
        email: { type: 'string', description: 'Seller email' },
        firstName: { type: 'string', description: 'Seller first name' },
        lastName: { type: 'string', description: 'Seller last name' },
        isActive: { type: 'boolean', description: 'Updated active status' },
        role: { type: 'string', description: 'User role (seller)' },
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
        profile: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Profile ID' },
            storeName: { type: 'string', description: 'Store name' },
            isApproved: { type: 'boolean', description: 'Approval status' },
            storeDescription: {
              type: 'string',
              description: 'Store description',
            },
            logo: { type: 'string', description: 'Store logo URL' },
            banner: { type: 'string', description: 'Store banner URL' },
            businessCategories: {
              type: 'array',
              items: { type: 'string' },
              description: 'Business categories',
            },
            contactEmail: { type: 'string', description: 'Contact email' },
            contactPhone: { type: 'string', description: 'Contact phone' },
            website: { type: 'string', description: 'Website URL' },
            socialMedia: {
              type: 'object',
              properties: {
                facebook: { type: 'string' },
                instagram: { type: 'string' },
                twitter: { type: 'string' },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Profile creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Profile update date',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: SellerErrorMessages[SellerError.SELLER_NOT_FOUND],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async toggleSellerStatus(@Param('id') id: string) {
    return this.adminSellersService.toggleSellerStatus(id);
  }

  /**
   * Get seller statistics
   *
   * Retrieves statistics about sellers including total count,
   * approved, pending, active and inactive seller counts.
   *
   * @returns Seller statistics
   *
   * @example
   * ```bash
   * GET /api/admin/sellers/stats/overview
   * ```
   */
  @Get('stats/overview')
  @ApiOperation({
    summary: 'Get seller statistics',
    description:
      'Retrieves statistics about sellers including total count, approved, pending, active and inactive seller counts.',
    tags: ['Admin - Seller Management'],
  })
  @ApiResponse({
    status: 200,
    description: 'Seller statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of sellers' },
        approved: { type: 'number', description: 'Number of approved sellers' },
        pending: { type: 'number', description: 'Number of pending sellers' },
        active: { type: 'number', description: 'Number of active sellers' },
        inactive: { type: 'number', description: 'Number of inactive sellers' },
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
  async getSellerStats() {
    return this.adminSellersService.getSellerStats();
  }
}
