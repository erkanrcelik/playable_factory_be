import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';
import { Campaign, CampaignDocument } from '../../schemas/campaign.schema';
import { Review, ReviewDocument } from '../../schemas/review.schema';

export interface SellerDashboardStats {
  products: ProductStats;
  orders: OrderStats;
  campaigns: CampaignStats;
  reviews: ReviewStats;
  revenue: RevenueStats;
  alerts: AlertStats;
}

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  outOfStock: number;
  featured: number;
  avgRating: number;
  totalViews: number;
}

interface OrderStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  avgOrderValue: number;
}

interface CampaignStats {
  total: number;
  active: number;
  expired: number;
  upcoming: number;
  totalDiscountGiven: number;
  avgDiscountPercentage: number;
}

interface ReviewStats {
  total: number;
  thisMonth: number;
  avgRating: number;
  pending: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface RevenueStats {
  total: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
  avgMonthlyRevenue: number;
  bestSellingProduct: {
    name: string;
    revenue: number;
    quantity: number;
  } | null;
}

interface AlertStats {
  lowStockProducts: number;
  pendingOrders: number;
  expiringSoonCampaigns: number;
  negativeReviews: number;
  totalAlerts: number;
}

/**
 * Seller Dashboard Service
 *
 * Provides comprehensive analytics and statistics for individual sellers
 * including product performance, order metrics, revenue tracking, and business insights
 */
@Injectable()
export class SellerDashboardService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  /**
   * Get comprehensive dashboard statistics for seller
   *
   * @param sellerId - Seller ID
   * @returns Complete dashboard statistics
   */
  async getDashboardStats(sellerId: string): Promise<SellerDashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const sellerObjectId = new Types.ObjectId(sellerId);

    const [
      productStats,
      orderStats,
      campaignStats,
      reviewStats,
      revenueStats,
      alertStats,
    ] = await Promise.all([
      this.getProductStats(sellerObjectId),
      this.getOrderStats(
        sellerObjectId,
        startOfMonth,
        startOfWeek,
        startOfToday,
      ),
      this.getCampaignStats(sellerObjectId),
      this.getReviewStats(sellerObjectId, startOfMonth),
      this.getRevenueStats(
        sellerObjectId,
        startOfMonth,
        startOfWeek,
        startOfToday,
      ),
      this.getAlertStats(sellerObjectId),
    ]);

    return {
      products: productStats,
      orders: orderStats,
      campaigns: campaignStats,
      reviews: reviewStats,
      revenue: revenueStats,
      alerts: alertStats,
    };
  }

  /**
   * Get seller's product statistics
   */
  private async getProductStats(
    sellerId: Types.ObjectId,
  ): Promise<ProductStats> {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      lowStockProducts,
      outOfStockProducts,
      featuredProducts,
      avgRatingResult,
    ] = await Promise.all([
      this.productModel.countDocuments({ sellerId }),
      this.productModel.countDocuments({ sellerId, isActive: true }),
      this.productModel.countDocuments({ sellerId, isActive: false }),
      this.productModel.countDocuments({
        sellerId,
        isActive: true,
        stock: { $lte: 10, $gt: 0 },
      }),
      this.productModel.countDocuments({ sellerId, isActive: true, stock: 0 }),
      this.productModel.countDocuments({ sellerId, isFeatured: true }),
      this.productModel.aggregate([
        { $match: { sellerId } },
        { $group: { _id: null, avgRating: { $avg: '$averageRating' } } },
      ]),
    ]);

    return {
      total: totalProducts,
      active: activeProducts,
      inactive: inactiveProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      featured: featuredProducts,
      avgRating: avgRatingResult[0]?.avgRating || 0,
      totalViews: 0, // TODO: Implement view tracking
    };
  }

  /**
   * Get seller's order statistics
   */
  private async getOrderStats(
    sellerId: Types.ObjectId,
    startOfMonth: Date,
    startOfWeek: Date,
    startOfToday: Date,
  ): Promise<OrderStats> {
    const sellerOrdersFilter = {
      'items.sellerId': sellerId,
    };

    const [
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      statusCounts,
      avgOrderValue,
    ] = await Promise.all([
      this.orderModel.countDocuments(sellerOrdersFilter),
      this.orderModel.countDocuments({
        ...sellerOrdersFilter,
        createdAt: { $gte: startOfToday },
      }),
      this.orderModel.countDocuments({
        ...sellerOrdersFilter,
        createdAt: { $gte: startOfWeek },
      }),
      this.orderModel.countDocuments({
        ...sellerOrdersFilter,
        createdAt: { $gte: startOfMonth },
      }),
      this.orderModel.aggregate([
        { $match: sellerOrdersFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.orderModel.aggregate([
        { $match: sellerOrdersFilter },
        { $unwind: '$items' },
        { $match: { 'items.sellerId': sellerId } },
        {
          $group: {
            _id: null,
            avgValue: {
              $avg: { $multiply: ['$items.price', '$items.quantity'] },
            },
          },
        },
      ]),
    ]);

    const statusCountMap = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      total: totalOrders,
      today: todayOrders,
      thisWeek: weekOrders,
      thisMonth: monthOrders,
      pending: statusCountMap[OrderStatus.PENDING] || 0,
      processing: statusCountMap[OrderStatus.PROCESSING] || 0,
      shipped: statusCountMap[OrderStatus.SHIPPED] || 0,
      delivered: statusCountMap[OrderStatus.DELIVERED] || 0,
      cancelled: statusCountMap[OrderStatus.CANCELLED] || 0,
      avgOrderValue: avgOrderValue[0]?.avgValue || 0,
    };
  }

  /**
   * Get seller's campaign statistics
   */
  private async getCampaignStats(
    sellerId: Types.ObjectId,
  ): Promise<CampaignStats> {
    const now = new Date();

    const [
      totalCampaigns,
      activeCampaigns,
      expiredCampaigns,
      upcomingCampaigns,
      discountStats,
    ] = await Promise.all([
      this.campaignModel.countDocuments({ sellerId }),
      this.campaignModel.countDocuments({
        sellerId,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }),
      this.campaignModel.countDocuments({
        sellerId,
        endDate: { $lt: now },
      }),
      this.campaignModel.countDocuments({
        sellerId,
        startDate: { $gt: now },
      }),
      this.campaignModel.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: null,
            totalDiscount: { $sum: '$discountValue' },
            avgDiscount: { $avg: '$discountValue' },
          },
        },
      ]),
    ]);

    return {
      total: totalCampaigns,
      active: activeCampaigns,
      expired: expiredCampaigns,
      upcoming: upcomingCampaigns,
      totalDiscountGiven: discountStats[0]?.totalDiscount || 0,
      avgDiscountPercentage: discountStats[0]?.avgDiscount || 0,
    };
  }

  /**
   * Get seller's review statistics
   */
  private async getReviewStats(
    sellerId: Types.ObjectId,
    startOfMonth: Date,
  ): Promise<ReviewStats> {
    // Get products of this seller
    const sellerProducts = await this.productModel
      .find({ sellerId })
      .select('_id');
    const productIds = sellerProducts.map((p) => p._id);

    if (productIds.length === 0) {
      return {
        total: 0,
        thisMonth: 0,
        avgRating: 0,
        pending: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const [
      totalReviews,
      monthReviews,
      avgRatingResult,
      pendingReviews,
      ratingDistribution,
    ] = await Promise.all([
      this.reviewModel.countDocuments({ productId: { $in: productIds } }),
      this.reviewModel.countDocuments({
        productId: { $in: productIds },
        createdAt: { $gte: startOfMonth },
      }),
      this.reviewModel.aggregate([
        { $match: { productId: { $in: productIds } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
      this.reviewModel.countDocuments({
        productId: { $in: productIds },
        isApproved: false,
      }),
      this.reviewModel.aggregate([
        { $match: { productId: { $in: productIds } } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
      ]),
    ]);

    const distributionMap = ratingDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      total: totalReviews,
      thisMonth: monthReviews,
      avgRating: avgRatingResult[0]?.avgRating || 0,
      pending: pendingReviews,
      ratingDistribution: {
        5: distributionMap[5] || 0,
        4: distributionMap[4] || 0,
        3: distributionMap[3] || 0,
        2: distributionMap[2] || 0,
        1: distributionMap[1] || 0,
      },
    };
  }

  /**
   * Get seller's revenue statistics
   */
  private async getRevenueStats(
    sellerId: Types.ObjectId,
    startOfMonth: Date,
    startOfWeek: Date,
    startOfToday: Date,
  ): Promise<RevenueStats> {
    const sellerOrdersFilter = {
      'items.sellerId': sellerId,
      status: {
        $in: [
          OrderStatus.DELIVERED,
          OrderStatus.PROCESSING,
          OrderStatus.SHIPPED,
        ],
      },
    };

    const [
      totalRevenue,
      monthRevenue,
      weekRevenue,
      todayRevenue,
      avgMonthlyRevenue,
      bestSellingProduct,
    ] = await Promise.all([
      this.orderModel.aggregate([
        { $match: sellerOrdersFilter },
        { $unwind: '$items' },
        { $match: { 'items.sellerId': sellerId } },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            ...sellerOrdersFilter,
            createdAt: { $gte: startOfMonth },
          },
        },
        { $unwind: '$items' },
        { $match: { 'items.sellerId': sellerId } },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            ...sellerOrdersFilter,
            createdAt: { $gte: startOfWeek },
          },
        },
        { $unwind: '$items' },
        { $match: { 'items.sellerId': sellerId } },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            ...sellerOrdersFilter,
            createdAt: { $gte: startOfToday },
          },
        },
        { $unwind: '$items' },
        { $match: { 'items.sellerId': sellerId } },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
      ]),
      this.orderModel.aggregate([
        { $match: sellerOrdersFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
          },
        },
        { $count: 'months' },
      ]),
      this.orderModel.aggregate([
        { $match: sellerOrdersFilter },
        { $unwind: '$items' },
        { $match: { 'items.sellerId': sellerId } },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$product.name' },
            totalRevenue: {
              $sum: { $multiply: ['$items.price', '$items.quantity'] },
            },
            totalQuantity: { $sum: '$items.quantity' },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const totalRev = totalRevenue[0]?.total || 0;
    const monthCount = avgMonthlyRevenue[0]?.months || 1;

    return {
      total: totalRev,
      thisMonth: monthRevenue[0]?.total || 0,
      thisWeek: weekRevenue[0]?.total || 0,
      today: todayRevenue[0]?.total || 0,
      avgMonthlyRevenue: totalRev / monthCount,
      bestSellingProduct: bestSellingProduct[0]
        ? {
            name: bestSellingProduct[0].name,
            revenue: bestSellingProduct[0].totalRevenue,
            quantity: bestSellingProduct[0].totalQuantity,
          }
        : null,
    };
  }

  /**
   * Get seller's alert statistics
   */
  private async getAlertStats(sellerId: Types.ObjectId): Promise<AlertStats> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get seller products for review filtering
    const sellerProducts = await this.productModel
      .find({ sellerId })
      .select('_id');
    const productIds = sellerProducts.map((p) => p._id);

    const [
      lowStockProducts,
      pendingOrders,
      expiringSoonCampaigns,
      negativeReviews,
    ] = await Promise.all([
      this.productModel.countDocuments({
        sellerId,
        isActive: true,
        stock: { $lte: 5, $gt: 0 },
      }),
      this.orderModel.countDocuments({
        'items.sellerId': sellerId,
        status: OrderStatus.PENDING,
      }),
      this.campaignModel.countDocuments({
        sellerId,
        isActive: true,
        endDate: { $lte: nextWeek, $gte: now },
      }),
      productIds.length > 0
        ? this.reviewModel.countDocuments({
            productId: { $in: productIds },
            rating: { $lte: 2 },
            isApproved: true,
          })
        : 0,
    ]);

    const totalAlerts =
      lowStockProducts +
      pendingOrders +
      expiringSoonCampaigns +
      negativeReviews;

    return {
      lowStockProducts,
      pendingOrders,
      expiringSoonCampaigns,
      negativeReviews,
      totalAlerts,
    };
  }

  /**
   * Get recent activities for seller
   *
   * @param sellerId - Seller ID
   * @param limit - Number of activities to return
   * @returns Recent activities
   */
  async getRecentActivities(sellerId: string, limit: number = 10) {
    const sellerObjectId = new Types.ObjectId(sellerId);

    // Get recent orders
    const recentOrders = await this.orderModel
      .find({ 'items.sellerId': sellerObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName')
      .lean();

    // Get recent reviews
    const sellerProducts = await this.productModel
      .find({ sellerId: sellerObjectId })
      .select('_id name');
    const productIds = sellerProducts.map((p) => p._id);
    const productMap = sellerProducts.reduce((acc, product) => {
      acc[(product._id as any).toString()] = product.name;
      return acc;
    }, {});

    const recentReviews =
      productIds.length > 0
        ? await this.reviewModel
            .find({ productId: { $in: productIds } })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('userId', 'firstName lastName')
            .populate('productId', 'name')
            .lean()
        : [];

    const activities = [
      ...recentOrders.map((order) => ({
        type: 'order',
        title: 'New Order Received',
        description: `Order from ${(order.userId as any)?.firstName} ${(order.userId as any)?.lastName}`,
        amount: order.items
          .filter((item) => item.sellerId.toString() === sellerId)
          .reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: order.status,
        createdAt: (order as any).createdAt,
        orderId: order._id,
      })),
      ...recentReviews.map((review) => ({
        type: 'review',
        title: 'New Product Review',
        description: `${review.rating}⭐ review for ${productMap[review.productId.toString()]}`,
        rating: review.rating,
        reviewer: `${(review.userId as any)?.firstName} ${(review.userId as any)?.lastName}`,
        createdAt: (review as any).createdAt,
        reviewId: review._id,
        productName: productMap[review.productId.toString()],
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
   * Get chart data for seller dashboard
   *
   * @param sellerId - Seller ID
   * @param days - Number of days to include (default: 30)
   * @returns Chart data for dashboard visualizations
   */
  async getChartData(sellerId: string, days: number = 30) {
    const sellerObjectId = new Types.ObjectId(sellerId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily sales chart
    const dailySales = await this.orderModel.aggregate([
      {
        $match: {
          'items.sellerId': sellerObjectId,
          createdAt: { $gte: startDate },
          status: {
            $in: [
              OrderStatus.DELIVERED,
              OrderStatus.PROCESSING,
              OrderStatus.SHIPPED,
            ],
          },
        },
      },
      { $unwind: '$items' },
      { $match: { 'items.sellerId': sellerObjectId } },
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
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $addToSet: '$_id' },
        },
      },
      {
        $project: {
          date: '$_id.date',
          revenue: 1,
          orderCount: { $size: '$orders' },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Product performance
    const productPerformance = await this.orderModel.aggregate([
      {
        $match: {
          'items.sellerId': sellerObjectId,
          createdAt: { $gte: startDate },
          status: {
            $in: [
              OrderStatus.DELIVERED,
              OrderStatus.PROCESSING,
              OrderStatus.SHIPPED,
            ],
          },
        },
      },
      { $unwind: '$items' },
      { $match: { 'items.sellerId': sellerObjectId } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$product.name' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          quantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Monthly comparison (current vs previous month)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentMonthStats, previousMonthStats] = await Promise.all([
      this.orderModel.aggregate([
        {
          $match: {
            'items.sellerId': sellerObjectId,
            createdAt: { $gte: currentMonthStart },
            status: {
              $in: [
                OrderStatus.DELIVERED,
                OrderStatus.PROCESSING,
                OrderStatus.SHIPPED,
              ],
            },
          },
        },
        { $unwind: '$items' },
        { $match: { 'items.sellerId': sellerObjectId } },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: { $multiply: ['$items.price', '$items.quantity'] },
            },
            orders: { $addToSet: '$_id' },
          },
        },
      ]),
      this.orderModel.aggregate([
        {
          $match: {
            'items.sellerId': sellerObjectId,
            createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
            status: {
              $in: [
                OrderStatus.DELIVERED,
                OrderStatus.PROCESSING,
                OrderStatus.SHIPPED,
              ],
            },
          },
        },
        { $unwind: '$items' },
        { $match: { 'items.sellerId': sellerObjectId } },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: { $multiply: ['$items.price', '$items.quantity'] },
            },
            orders: { $addToSet: '$_id' },
          },
        },
      ]),
    ]);

    const currentRevenue = currentMonthStats[0]?.revenue || 0;
    const previousRevenue = previousMonthStats[0]?.revenue || 0;
    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    return {
      dailySales,
      productPerformance,
      monthlyComparison: {
        current: {
          revenue: currentRevenue,
          orders: currentMonthStats[0]?.orders?.length || 0,
        },
        previous: {
          revenue: previousRevenue,
          orders: previousMonthStats[0]?.orders?.length || 0,
        },
        growth: {
          revenue: revenueGrowth,
          orders:
            previousMonthStats[0]?.orders?.length > 0
              ? (((currentMonthStats[0]?.orders?.length || 0) -
                  (previousMonthStats[0]?.orders?.length || 0)) /
                  (previousMonthStats[0]?.orders?.length || 1)) *
                100
              : 0,
        },
      },
    };
  }
}
