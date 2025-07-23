import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SellerDashboardService } from './seller-dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../schemas/user.schema';

/**
 * Seller Dashboard Controller
 *
 * Provides dashboard analytics and statistics endpoints for individual sellers
 * including sales metrics, product performance, revenue tracking, and business insights
 */
@ApiTags('Seller Dashboard')
@Controller('seller/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
@ApiBearerAuth()
export class SellerDashboardController {
  constructor(
    private readonly sellerDashboardService: SellerDashboardService,
  ) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get seller dashboard statistics',
    description:
      'Retrieve comprehensive dashboard statistics for the authenticated seller including product metrics, order statistics, revenue data, campaign performance, and alerts',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total number of products' },
            active: {
              type: 'number',
              description: 'Number of active products',
            },
            inactive: {
              type: 'number',
              description: 'Number of inactive products',
            },
            lowStock: {
              type: 'number',
              description: 'Products with low stock (≤10)',
            },
            outOfStock: {
              type: 'number',
              description: 'Products out of stock',
            },
            featured: {
              type: 'number',
              description: 'Featured products count',
            },
            avgRating: {
              type: 'number',
              description: 'Average product rating',
            },
            totalViews: { type: 'number', description: 'Total product views' },
          },
        },
        orders: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total orders' },
            today: { type: 'number', description: 'Orders today' },
            thisWeek: { type: 'number', description: 'Orders this week' },
            thisMonth: { type: 'number', description: 'Orders this month' },
            pending: { type: 'number', description: 'Pending orders' },
            processing: { type: 'number', description: 'Processing orders' },
            shipped: { type: 'number', description: 'Shipped orders' },
            delivered: { type: 'number', description: 'Delivered orders' },
            cancelled: { type: 'number', description: 'Cancelled orders' },
            avgOrderValue: {
              type: 'number',
              description: 'Average order value',
            },
          },
        },
        campaigns: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total campaigns' },
            active: { type: 'number', description: 'Active campaigns' },
            expired: { type: 'number', description: 'Expired campaigns' },
            upcoming: { type: 'number', description: 'Upcoming campaigns' },
            totalDiscountGiven: {
              type: 'number',
              description: 'Total discount amount given',
            },
            avgDiscountPercentage: {
              type: 'number',
              description: 'Average discount percentage',
            },
          },
        },
        reviews: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total reviews' },
            thisMonth: { type: 'number', description: 'Reviews this month' },
            avgRating: { type: 'number', description: 'Average rating' },
            pending: { type: 'number', description: 'Pending reviews' },
            ratingDistribution: {
              type: 'object',
              properties: {
                '5': { type: 'number' },
                '4': { type: 'number' },
                '3': { type: 'number' },
                '2': { type: 'number' },
                '1': { type: 'number' },
              },
            },
          },
        },
        revenue: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total revenue' },
            thisMonth: { type: 'number', description: 'Revenue this month' },
            thisWeek: { type: 'number', description: 'Revenue this week' },
            today: { type: 'number', description: 'Revenue today' },
            avgMonthlyRevenue: {
              type: 'number',
              description: 'Average monthly revenue',
            },
            bestSellingProduct: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                revenue: { type: 'number' },
                quantity: { type: 'number' },
              },
            },
          },
        },
        alerts: {
          type: 'object',
          properties: {
            lowStockProducts: {
              type: 'number',
              description: 'Products with low stock',
            },
            pendingOrders: {
              type: 'number',
              description: 'Orders waiting for processing',
            },
            expiringSoonCampaigns: {
              type: 'number',
              description: 'Campaigns expiring within a week',
            },
            negativeReviews: {
              type: 'number',
              description: 'Recent negative reviews',
            },
            totalAlerts: {
              type: 'number',
              description: 'Total number of alerts',
            },
          },
        },
      },
    },
  })
  async getDashboardStats(@CurrentUser('id') sellerId: string) {
    return this.sellerDashboardService.getDashboardStats(sellerId);
  }

  @Get('activities')
  @ApiOperation({
    summary: 'Get recent activities',
    description:
      'Retrieve recent business activities for the seller including new orders, reviews, and other important events',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of activities to return (default: 10, max: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activities retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['order', 'review', 'product', 'campaign'],
            description: 'Type of activity',
          },
          title: { type: 'string', description: 'Activity title' },
          description: { type: 'string', description: 'Activity description' },
          amount: { type: 'number', description: 'Amount (for orders)' },
          status: { type: 'string', description: 'Status (for orders)' },
          rating: { type: 'number', description: 'Rating (for reviews)' },
          reviewer: {
            type: 'string',
            description: 'Reviewer name (for reviews)',
          },
          productName: { type: 'string', description: 'Product name' },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Activity timestamp',
          },
          orderId: {
            type: 'string',
            description: 'Order ID (for order activities)',
          },
          reviewId: {
            type: 'string',
            description: 'Review ID (for review activities)',
          },
        },
      },
    },
  })
  async getRecentActivities(
    @CurrentUser('id') sellerId: string,
    @Query('limit') limit?: number,
  ) {
    const activityLimit = Math.min(limit || 10, 50);
    return this.sellerDashboardService.getRecentActivities(
      sellerId,
      activityLimit,
    );
  }

  @Get('charts')
  @ApiOperation({
    summary: 'Get chart data',
    description:
      'Retrieve data for dashboard charts including daily sales, product performance, and monthly comparisons',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to include in charts (default: 30, max: 365)',
  })
  @ApiResponse({
    status: 200,
    description: 'Chart data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        dailySales: {
          type: 'array',
          description: 'Daily sales data for the specified period',
          items: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                format: 'date',
                description: 'Date (YYYY-MM-DD)',
              },
              revenue: { type: 'number', description: 'Revenue for the day' },
              orderCount: {
                type: 'number',
                description: 'Number of orders for the day',
              },
            },
          },
        },
        productPerformance: {
          type: 'array',
          description: 'Top performing products by revenue',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Product name' },
              revenue: {
                type: 'number',
                description: 'Total revenue from this product',
              },
              quantity: { type: 'number', description: 'Total quantity sold' },
            },
          },
        },
        monthlyComparison: {
          type: 'object',
          description: 'Current vs previous month comparison',
          properties: {
            current: {
              type: 'object',
              properties: {
                revenue: {
                  type: 'number',
                  description: 'Current month revenue',
                },
                orders: { type: 'number', description: 'Current month orders' },
              },
            },
            previous: {
              type: 'object',
              properties: {
                revenue: {
                  type: 'number',
                  description: 'Previous month revenue',
                },
                orders: {
                  type: 'number',
                  description: 'Previous month orders',
                },
              },
            },
            growth: {
              type: 'object',
              properties: {
                revenue: {
                  type: 'number',
                  description: 'Revenue growth percentage',
                },
                orders: {
                  type: 'number',
                  description: 'Orders growth percentage',
                },
              },
            },
          },
        },
      },
    },
  })
  async getChartData(
    @CurrentUser('id') sellerId: string,
    @Query('days') days?: number,
  ) {
    const chartDays = Math.min(days || 30, 365);
    return this.sellerDashboardService.getChartData(sellerId, chartDays);
  }

  @Get('performance')
  @ApiOperation({
    summary: 'Get performance metrics',
    description:
      'Get detailed performance metrics including conversion rates, customer satisfaction, and growth trends',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        conversionMetrics: {
          type: 'object',
          description: 'Conversion and engagement metrics',
          properties: {
            productViews: {
              type: 'number',
              description: 'Total product views',
            },
            cartAdditions: {
              type: 'number',
              description: 'Times products added to cart',
            },
            purchases: { type: 'number', description: 'Completed purchases' },
            conversionRate: {
              type: 'number',
              description: 'View to purchase conversion rate',
            },
            cartConversionRate: {
              type: 'number',
              description: 'Cart to purchase conversion rate',
            },
          },
        },
        customerSatisfaction: {
          type: 'object',
          description: 'Customer satisfaction metrics',
          properties: {
            averageRating: {
              type: 'number',
              description: 'Average product rating',
            },
            repeatCustomerRate: {
              type: 'number',
              description: 'Percentage of repeat customers',
            },
            customerRetentionRate: {
              type: 'number',
              description: 'Customer retention rate',
            },
            responseTime: {
              type: 'number',
              description: 'Average order processing time (hours)',
            },
          },
        },
        growthTrends: {
          type: 'object',
          description: 'Growth trend analysis',
          properties: {
            revenueGrowth: {
              type: 'number',
              description: 'Monthly revenue growth percentage',
            },
            orderGrowth: {
              type: 'number',
              description: 'Monthly order growth percentage',
            },
            productGrowth: {
              type: 'number',
              description: 'Product catalog growth',
            },
            marketShare: {
              type: 'number',
              description: 'Market share in categories',
            },
          },
        },
      },
    },
  })
  getPerformanceMetrics() {
    // This is a placeholder for more advanced metrics
    // In a real implementation, you would calculate these from various data sources
    return {
      conversionMetrics: {
        productViews: 0, // TODO: Implement view tracking
        cartAdditions: 0, // TODO: Implement cart analytics
        purchases: 0,
        conversionRate: 0,
        cartConversionRate: 0,
      },
      customerSatisfaction: {
        averageRating: 0,
        repeatCustomerRate: 0,
        customerRetentionRate: 0,
        responseTime: 0,
      },
      growthTrends: {
        revenueGrowth: 0,
        orderGrowth: 0,
        productGrowth: 0,
        marketShare: 0,
      },
    };
  }
}
