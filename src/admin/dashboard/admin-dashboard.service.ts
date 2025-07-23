import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../../schemas/user.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';
import {
  Campaign,
  CampaignDocument,
  CampaignType,
} from '../../schemas/campaign.schema';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { Review, ReviewDocument } from '../../schemas/review.schema';

export interface DashboardStats {
  users: {
    total: number;
    customers: number;
    sellers: number;
    admins: number;
    newThisMonth: number;
    activeToday: number;
  };
  products: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
    topCategories: Array<{
      categoryId: string;
      categoryName: string;
      productCount: number;
    }>;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    todayOrders: number;
    thisMonthOrders: number;
    totalRevenue: number;
    thisMonthRevenue: number;
  };
  campaigns: {
    total: number;
    active: number;
    platform: number;
    seller: number;
    expiringSoon: number;
  };
  categories: {
    total: number;
    active: number;
  };
  reviews: {
    total: number;
    pending: number;
    approved: number;
    averageRating: number;
  };
  systemHealth: {
    pendingSellerApprovals: number;
    lowStockProducts: number;
    expiredCampaigns: number;
    unverifiedUsers: number;
  };
}

export interface RecentActivity {
  newUsers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: Date;
  }>;
  recentOrders: Array<{
    _id: string;
    customerName: string;
    totalPrice: number;
    status: string;
    itemCount: number;
    createdAt: Date;
  }>;
  newProducts: Array<{
    _id: string;
    name: string;
    price: number;
    sellerName: string;
    category: string;
    createdAt: Date;
  }>;
  newCampaigns: Array<{
    _id: string;
    name: string;
    type: string;
    discountValue: number;
    sellerName?: string;
    createdAt: Date;
  }>;
}

export interface ChartData {
  dailyOrders: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orderCount: number;
  }>;
  userRegistrations: Array<{
    date: string;
    customers: number;
    sellers: number;
  }>;
  categoryDistribution: Array<{
    categoryName: string;
    productCount: number;
    revenue: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Admin Dashboard Service
 *
 * Provides comprehensive dashboard analytics and statistics for admin users including:
 * - System-wide statistics and KPIs
 * - Recent activities and notifications
 * - Chart data for visualization
 * - System health monitoring
 * - Performance metrics
 */
@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  /**
   * Get comprehensive dashboard statistics
   *
   * @returns Dashboard statistics including all major metrics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    // Parallel execution for better performance
    const [
      userStats,
      productStats,
      orderStats,
      campaignStats,
      categoryStats,
      reviewStats,
      systemHealthStats,
    ] = await Promise.all([
      this.getUserStats(startOfMonth, startOfToday),
      this.getProductStats(startOfMonth),
      this.getOrderStats(startOfMonth, startOfToday),
      this.getCampaignStats(),
      this.getCategoryStats(),
      this.getReviewStats(),
      this.getSystemHealthStats(),
    ]);

    return {
      users: userStats,
      products: productStats,
      orders: orderStats,
      campaigns: campaignStats,
      categories: categoryStats,
      reviews: reviewStats,
      systemHealth: systemHealthStats,
    };
  }

  /**
   * Get recent activities for admin dashboard
   */
  async getRecentActivities(limit: number = 10) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get recent user registrations
    const recentUsers = await this.userModel
      .find({ createdAt: { $gte: startOfMonth } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent orders
    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName email')
      .lean();

    // Get recent products
    const recentProducts = await this.productModel
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('sellerId', 'firstName lastName')
      .populate('category', 'name')
      .lean();

    // Get recent campaigns
    const recentCampaigns = await this.campaignModel
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('sellerId', 'firstName lastName')
      .lean();

    const activities = [
      ...recentUsers.map((user) => ({
        type: 'user_registration' as const,
        title: 'New User Registration',
        description: `${user.firstName} ${user.lastName} registered as ${user.role}`,
        userId: (user._id as any).toString(),
        userEmail: user.email,
        createdAt: (user as any).createdAt,
      })),
      ...recentOrders.map((order) => ({
        type: 'order_placed' as const,
        title: 'New Order Placed',
        description: `Order placed by ${(order.userId as any)?.firstName} ${(order.userId as any)?.lastName}`,
        orderId: (order._id as any).toString(),
        amount: order.totalPrice,
        status: order.status,
        createdAt: (order as any).createdAt,
      })),
      ...recentProducts.map((product) => ({
        type: 'product_added' as const,
        title: 'New Product Added',
        description: `${product.name} added by ${(product.sellerId as any)?.firstName}`,
        productId: (product._id as any).toString(),
        productName: product.name,
        categoryName: (product.category as any)?.name,
        createdAt: (product as any).createdAt,
      })),
      ...recentCampaigns.map((campaign) => ({
        type: 'campaign_created' as const,
        title: 'New Campaign Created',
        description: `${campaign.name} campaign created`,
        campaignId: (campaign._id as any).toString(),
        campaignName: campaign.name,
        discountValue: campaign.discountValue,
        createdAt: (campaign as any).createdAt,
      })),
    ];

    return activities
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  }

  /**
   * Get chart data for admin dashboard
   */
  async getChartData(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily orders chart
    const dailyOrders = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      {
        $project: {
          date: '$_id.date',
          count: 1,
          revenue: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Monthly revenue chart
    const monthlyRevenue = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().getFullYear() - 1, 0, 1) },
          status: { $in: ['delivered', 'processing', 'shipped'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                },
              },
            },
          },
          revenue: 1,
          orders: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // User registrations chart
    const userRegistrations = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          customers: {
            $sum: {
              $cond: [{ $eq: ['$_id.role', 'customer'] }, '$count', 0],
            },
          },
          sellers: {
            $sum: {
              $cond: [{ $eq: ['$_id.role', 'seller'] }, '$count', 0],
            },
          },
        },
      },
      {
        $project: {
          date: '$_id',
          customers: 1,
          sellers: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return {
      dailyOrders,
      monthlyRevenue,
      userRegistrations,
    };
  }

  /**
   * Get user statistics
   *
   * @private
   */
  private async getUserStats(startOfMonth: Date, startOfToday: Date) {
    const [total, customers, sellers, admins, newThisMonth, activeToday] =
      await Promise.all([
        this.userModel.countDocuments(),
        this.userModel.countDocuments({ role: UserRole.CUSTOMER }),
        this.userModel.countDocuments({ role: UserRole.SELLER }),
        this.userModel.countDocuments({ role: UserRole.ADMIN }),
        this.userModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
        this.userModel.countDocuments({ lastLoginAt: { $gte: startOfToday } }),
      ]);

    return {
      total,
      customers,
      sellers,
      admins,
      newThisMonth,
      activeToday,
    };
  }

  /**
   * Get product statistics
   *
   * @private
   */
  private async getProductStats(startOfMonth: Date) {
    const [total, active, newThisMonth, topCategoriesData] = await Promise.all([
      this.productModel.countDocuments(),
      this.productModel.countDocuments({ isActive: true }),
      this.productModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.productModel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryInfo',
          },
        },
        { $unwind: '$categoryInfo' },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $project: {
            categoryId: '$_id',
            categoryName: '$categoryInfo.name',
            productCount: '$count',
          },
        },
      ]),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      newThisMonth,
      topCategories: topCategoriesData,
    };
  }

  /**
   * Get order statistics
   *
   * @private
   */
  private async getOrderStats(startOfMonth: Date, startOfToday: Date) {
    const [
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      todayOrders,
      thisMonthOrders,
      revenueData,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }),
      this.orderModel.countDocuments({ status: OrderStatus.PROCESSING }),
      this.orderModel.countDocuments({ status: OrderStatus.SHIPPED }),
      this.orderModel.countDocuments({ status: OrderStatus.DELIVERED }),
      this.orderModel.countDocuments({ status: OrderStatus.CANCELLED }),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfToday } }),
      this.orderModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.orderModel.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            thisMonthRevenue: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', startOfMonth] },
                  '$totalPrice',
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, thisMonthRevenue: 0 };

    return {
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      todayOrders,
      thisMonthOrders,
      totalRevenue: revenue.totalRevenue,
      thisMonthRevenue: revenue.thisMonthRevenue,
    };
  }

  /**
   * Get campaign statistics
   *
   * @private
   */
  private async getCampaignStats() {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [total, active, platform, seller, expiringSoon] = await Promise.all([
      this.campaignModel.countDocuments(),
      this.campaignModel.countDocuments({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }),
      this.campaignModel.countDocuments({ type: CampaignType.PLATFORM }),
      this.campaignModel.countDocuments({ type: CampaignType.SELLER }),
      this.campaignModel.countDocuments({
        isActive: true,
        endDate: { $gte: now, $lte: nextWeek },
      }),
    ]);

    return {
      total,
      active,
      platform,
      seller,
      expiringSoon,
    };
  }

  /**
   * Get category statistics
   *
   * @private
   */
  private async getCategoryStats() {
    const [total, active] = await Promise.all([
      this.categoryModel.countDocuments(),
      this.categoryModel.countDocuments({ isActive: true }),
    ]);

    return {
      total,
      active,
    };
  }

  /**
   * Get review statistics
   *
   * @private
   */
  private async getReviewStats() {
    const [total, pending, approved, ratingData] = await Promise.all([
      this.reviewModel.countDocuments(),
      this.reviewModel.countDocuments({ isApproved: false }),
      this.reviewModel.countDocuments({ isApproved: true }),
      this.reviewModel.aggregate([
        { $group: { _id: null, averageRating: { $avg: '$rating' } } },
      ]),
    ]);

    return {
      total,
      pending,
      approved,
      averageRating: ratingData[0]?.averageRating || 0,
    };
  }

  /**
   * Get system health statistics
   *
   * @private
   */
  private async getSystemHealthStats() {
    const [
      pendingSellerApprovals,
      lowStockProducts,
      expiredCampaigns,
      unverifiedUsers,
    ] = await Promise.all([
      this.userModel.countDocuments({
        role: UserRole.SELLER,
        isApproved: false,
      }),
      this.productModel.countDocuments({
        isActive: true,
        'variants.stock': { $lte: 5 },
      }),
      this.campaignModel.countDocuments({
        isActive: true,
        endDate: { $lt: new Date() },
      }),
      this.userModel.countDocuments({ isEmailVerified: false }),
    ]);

    return {
      pendingSellerApprovals,
      lowStockProducts,
      expiredCampaigns,
      unverifiedUsers,
    };
  }

  /**
   * Get new users
   *
   * @private
   */
  private async getNewUsers(limit: number) {
    const users = await this.userModel
      .find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return users.map((user) => ({
      _id: (user._id as any).toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: (user as any).createdAt,
    }));
  }

  /**
   * Get recent orders
   *
   * @private
   */
  private async getRecentOrders(limit: number) {
    const orders = await this.orderModel
      .find()
      .populate('userId', 'firstName lastName')
      .select('totalPrice status items createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return orders.map((order) => ({
      _id: (order._id as any).toString(),
      customerName: `${(order.userId as any).firstName} ${(order.userId as any).lastName}`,
      totalPrice: order.totalPrice,
      status: order.status,
      itemCount: order.items.length,
      createdAt: (order as any).createdAt,
    }));
  }

  /**
   * Get new products
   *
   * @private
   */
  private async getNewProducts(limit: number) {
    const products = await this.productModel
      .find()
      .populate('sellerId', 'firstName lastName')
      .populate('category', 'name')
      .select('name price createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return products.map((product) => ({
      _id: (product._id as any).toString(),
      name: product.name,
      price: product.price,
      sellerName: `${(product.sellerId as any).firstName} ${(product.sellerId as any).lastName}`,
      category: (product.category as any).name,
      createdAt: (product as any).createdAt,
    }));
  }

  /**
   * Get new campaigns
   *
   * @private
   */
  private async getNewCampaigns(limit: number) {
    const campaigns = await this.campaignModel
      .find()
      .populate('sellerId', 'firstName lastName')
      .select('name type discountValue createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return campaigns.map((campaign) => ({
      _id: (campaign._id as any).toString(),
      name: campaign.name,
      type: campaign.type,
      discountValue: campaign.discountValue,
      sellerName: campaign.sellerId
        ? `${(campaign.sellerId as any).firstName} ${(campaign.sellerId as any).lastName}`
        : undefined,
      createdAt: (campaign as any).createdAt,
    }));
  }

  /**
   * Get daily orders chart data
   *
   * @private
   */
  private async getDailyOrdersChart(startDate: Date) {
    const data = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    return data.map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      orders: item.orders,
      revenue: item.revenue,
    }));
  }

  /**
   * Get monthly revenue chart data
   *
   * @private
   */
  private async getMonthlyRevenueChart() {
    const data = await this.orderModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return data.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orderCount: item.orderCount,
    }));
  }

  /**
   * Get user registrations chart data
   *
   * @private
   */
  private async getUserRegistrationsChart(startDate: Date) {
    const data = await this.userModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Group by date and role
    const grouped = data.reduce((acc, item) => {
      const date = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      if (!acc[date]) {
        acc[date] = { date, customers: 0, sellers: 0 };
      }
      if (item._id.role === UserRole.CUSTOMER) {
        acc[date].customers = item.count;
      } else if (item._id.role === UserRole.SELLER) {
        acc[date].sellers = item.count;
      }
      return acc;
    }, {});

    return Object.values(grouped);
  }

  /**
   * Get category distribution chart data
   *
   * @private
   */
  private async getCategoryDistributionChart() {
    const data = await this.productModel.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$category',
          categoryName: { $first: '$categoryInfo.name' },
          productCount: { $sum: 1 },
        },
      },
      { $sort: { productCount: -1 } },
      { $limit: 10 },
    ]);

    // Get revenue data for categories
    const revenueData = await this.orderModel.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
    ]);

    const revenueMap = revenueData.reduce((acc, item) => {
      acc[item._id.toString()] = item.revenue;
      return acc;
    }, {});

    return data.map((item) => ({
      categoryName: item.categoryName,
      productCount: item.productCount,
      revenue: revenueMap[item._id.toString()] || 0,
    }));
  }

  /**
   * Get order status distribution chart data
   *
   * @private
   */
  private async getOrderStatusDistributionChart() {
    const data = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = data.reduce((sum, item) => sum + item.count, 0);

    return data.map((item) => ({
      status: item._id,
      count: item.count,
      percentage: Math.round((item.count / total) * 100),
    }));
  }
}
