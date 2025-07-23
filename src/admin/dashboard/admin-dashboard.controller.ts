import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';

/**
 * Admin Dashboard Controller
 *
 * Provides comprehensive dashboard endpoints for admin users including:
 * - System-wide statistics and KPIs
 * - Recent activities and notifications
 * - Chart data for data visualization
 * - System health monitoring
 * - Performance analytics
 *
 * All endpoints require admin authentication and permissions.
 */
@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  /**
   * Get comprehensive dashboard statistics
   *
   * Returns all major system metrics including user counts, order statistics,
   * revenue data, campaign metrics, and system health indicators.
   *
   * @returns Complete dashboard statistics
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Retrieve comprehensive system statistics for admin dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total number of users',
              example: 1250,
            },
            customers: {
              type: 'number',
              description: 'Number of customers',
              example: 980,
            },
            sellers: {
              type: 'number',
              description: 'Number of sellers',
              example: 245,
            },
            admins: {
              type: 'number',
              description: 'Number of admins',
              example: 25,
            },
            newThisMonth: {
              type: 'number',
              description: 'New users this month',
              example: 85,
            },
            activeToday: {
              type: 'number',
              description: 'Active users today',
              example: 156,
            },
          },
        },
        products: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total number of products',
              example: 5670,
            },
            active: {
              type: 'number',
              description: 'Active products',
              example: 5234,
            },
            inactive: {
              type: 'number',
              description: 'Inactive products',
              example: 436,
            },
            newThisMonth: {
              type: 'number',
              description: 'New products this month',
              example: 234,
            },
            topCategories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  categoryId: { type: 'string' },
                  categoryName: { type: 'string' },
                  productCount: { type: 'number' },
                },
              },
            },
          },
        },
        orders: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total orders',
              example: 2340,
            },
            pending: {
              type: 'number',
              description: 'Pending orders',
              example: 45,
            },
            processing: {
              type: 'number',
              description: 'Processing orders',
              example: 78,
            },
            shipped: {
              type: 'number',
              description: 'Shipped orders',
              example: 156,
            },
            delivered: {
              type: 'number',
              description: 'Delivered orders',
              example: 2018,
            },
            cancelled: {
              type: 'number',
              description: 'Cancelled orders',
              example: 43,
            },
            todayOrders: {
              type: 'number',
              description: 'Orders today',
              example: 23,
            },
            thisMonthOrders: {
              type: 'number',
              description: 'Orders this month',
              example: 456,
            },
            totalRevenue: {
              type: 'number',
              description: 'Total revenue',
              example: 567890.5,
            },
            thisMonthRevenue: {
              type: 'number',
              description: 'This month revenue',
              example: 45678.9,
            },
          },
        },
        campaigns: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total campaigns',
              example: 45,
            },
            active: {
              type: 'number',
              description: 'Active campaigns',
              example: 12,
            },
            platform: {
              type: 'number',
              description: 'Platform campaigns',
              example: 8,
            },
            seller: {
              type: 'number',
              description: 'Seller campaigns',
              example: 37,
            },
            expiringSoon: {
              type: 'number',
              description: 'Campaigns expiring soon',
              example: 3,
            },
          },
        },
        categories: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total categories',
              example: 45,
            },
            active: {
              type: 'number',
              description: 'Active categories',
              example: 42,
            },
          },
        },
        reviews: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total reviews',
              example: 1256,
            },
            pending: {
              type: 'number',
              description: 'Pending reviews',
              example: 23,
            },
            approved: {
              type: 'number',
              description: 'Approved reviews',
              example: 1233,
            },
            averageRating: {
              type: 'number',
              description: 'Average rating',
              example: 4.2,
            },
          },
        },
        systemHealth: {
          type: 'object',
          properties: {
            pendingSellerApprovals: {
              type: 'number',
              description: 'Pending seller approvals',
              example: 5,
            },
            lowStockProducts: {
              type: 'number',
              description: 'Low stock products',
              example: 23,
            },
            expiredCampaigns: {
              type: 'number',
              description: 'Expired campaigns',
              example: 7,
            },
            unverifiedUsers: {
              type: 'number',
              description: 'Unverified users',
              example: 45,
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getDashboardStats() {
    return this.adminDashboardService.getDashboardStats();
  }

  /**
   * Get recent activities across the platform
   *
   * Returns recent user registrations, orders, product additions, and campaigns
   * to provide an overview of platform activity.
   *
   * @param limit - Number of items per activity type
   * @returns Recent activities data
   */
  @Get('activities')
  @ApiOperation({
    summary: 'Get recent activities',
    description:
      'Retrieve recent activities across the platform for admin monitoring',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per activity type (default: 10, max: 50)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        newUsers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        recentOrders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              customerName: { type: 'string' },
              totalPrice: { type: 'number' },
              status: { type: 'string' },
              itemCount: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        newProducts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              price: { type: 'number' },
              sellerName: { type: 'string' },
              category: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        newCampaigns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              discountValue: { type: 'number' },
              sellerName: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getRecentActivities(@Query('limit') limit: number = 10) {
    // Validate and limit the input
    const validatedLimit = Math.min(Math.max(1, limit || 10), 50);
    return this.adminDashboardService.getRecentActivities(validatedLimit);
  }

  /**
   * Get chart data for dashboard visualizations
   *
   * Returns structured data for various charts including daily orders,
   * monthly revenue, user registrations, and distribution analytics.
   *
   * @param days - Number of days for time-based charts
   * @returns Chart data for dashboard visualizations
   */
  @Get('charts')
  @ApiOperation({
    summary: 'Get chart data',
    description:
      'Retrieve chart data for dashboard visualizations and analytics',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days for time-based charts (default: 30, max: 365)',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Chart data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        dailyOrders: {
          type: 'array',
          description: 'Daily order and revenue data',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date', example: '2024-01-15' },
              orders: { type: 'number', example: 45 },
              revenue: { type: 'number', example: 12500.5 },
            },
          },
        },
        monthlyRevenue: {
          type: 'array',
          description: 'Monthly revenue trends',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string', example: 'Jan 2024' },
              revenue: { type: 'number', example: 145600.75 },
              orderCount: { type: 'number', example: 567 },
            },
          },
        },
        userRegistrations: {
          type: 'array',
          description: 'Daily user registration data',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date', example: '2024-01-15' },
              customers: { type: 'number', example: 12 },
              sellers: { type: 'number', example: 3 },
            },
          },
        },
        categoryDistribution: {
          type: 'array',
          description: 'Product and revenue distribution by category',
          items: {
            type: 'object',
            properties: {
              categoryName: { type: 'string', example: 'Electronics' },
              productCount: { type: 'number', example: 1234 },
              revenue: { type: 'number', example: 567890.5 },
            },
          },
        },
        orderStatusDistribution: {
          type: 'array',
          description: 'Order distribution by status',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'delivered' },
              count: { type: 'number', example: 1567 },
              percentage: { type: 'number', example: 67 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getChartData(@Query('days') days: number = 30) {
    // Validate and limit the input
    const validatedDays = Math.min(Math.max(1, days || 30), 365);
    return this.adminDashboardService.getChartData(validatedDays);
  }

  /**
   * Get system health overview
   *
   * Returns key system health indicators and alerts that require admin attention.
   * This is a quick endpoint for monitoring critical system status.
   *
   * @returns System health indicators
   */
  @Get('health')
  @ApiOperation({
    summary: 'Get system health overview',
    description:
      'Retrieve system health indicators and alerts requiring admin attention',
  })
  @ApiResponse({
    status: 200,
    description: 'System health data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['healthy', 'warning', 'critical'],
          example: 'healthy',
        },
        alerts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'low_stock' },
              severity: { type: 'string', enum: ['low', 'medium', 'high'] },
              message: {
                type: 'string',
                example: '23 products have low stock levels',
              },
              count: { type: 'number', example: 23 },
              actionRequired: { type: 'boolean', example: true },
            },
          },
        },
        systemHealth: {
          type: 'object',
          properties: {
            pendingSellerApprovals: { type: 'number', example: 5 },
            lowStockProducts: { type: 'number', example: 23 },
            expiredCampaigns: { type: 'number', example: 7 },
            unverifiedUsers: { type: 'number', example: 45 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSystemHealth() {
    const stats = await this.adminDashboardService.getDashboardStats();
    const { systemHealth } = stats;

    // Generate alerts based on system health metrics
    const alerts: Array<{
      type: string;
      severity: string;
      message: string;
      count: number;
      actionRequired: boolean;
    }> = [];
    let overallStatus = 'healthy';

    if (systemHealth.pendingSellerApprovals > 10) {
      alerts.push({
        type: 'pending_approvals',
        severity: 'high',
        message: `${systemHealth.pendingSellerApprovals} seller approvals are pending`,
        count: systemHealth.pendingSellerApprovals,
        actionRequired: true,
      });
      overallStatus = 'warning';
    }

    if (systemHealth.lowStockProducts > 50) {
      alerts.push({
        type: 'low_stock',
        severity: 'medium',
        message: `${systemHealth.lowStockProducts} products have low stock levels`,
        count: systemHealth.lowStockProducts,
        actionRequired: true,
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }

    if (systemHealth.expiredCampaigns > 0) {
      alerts.push({
        type: 'expired_campaigns',
        severity: 'low',
        message: `${systemHealth.expiredCampaigns} campaigns have expired and need cleanup`,
        count: systemHealth.expiredCampaigns,
        actionRequired: false,
      });
    }

    if (systemHealth.unverifiedUsers > 100) {
      alerts.push({
        type: 'unverified_users',
        severity: 'low',
        message: `${systemHealth.unverifiedUsers} users have not verified their email`,
        count: systemHealth.unverifiedUsers,
        actionRequired: false,
      });
    }

    return {
      status: overallStatus,
      alerts,
      systemHealth,
    };
  }
}
