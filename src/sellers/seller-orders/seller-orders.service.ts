import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { FindAllOrdersDto } from './dto/find-all-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderError, OrderErrorMessages } from './enums/order-error.enum';

/**
 * Seller Orders Service
 *
 * Handles comprehensive order management for sellers including:
 * - Order listing with advanced filtering and search
 * - Order status management and transitions
 * - Seller-specific order analytics and statistics
 * - Order fulfillment and shipping management
 * - Customer communication and order notes
 */
@Injectable()
export class SellerOrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Get all orders containing seller's products with advanced filtering
   *
   * @param sellerId - Seller user ID
   * @param options - Filtering and pagination options
   * @returns Paginated list of orders with seller's products
   */
  async findAllOrders(sellerId: string, options: FindAllOrdersDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Get seller's product IDs
    const sellerProducts = await this.productModel
      .find({ sellerId: new Types.ObjectId(sellerId) })
      .select('_id');
    const sellerProductIds = sellerProducts.map((product) => product._id);

    const query: any = {
      'items.productId': { $in: sellerProductIds },
    };

    if (search) {
      query.$or = [
        { notes: { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .populate('items.productId', 'name price imageUrls')
        .populate('userId', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get detailed order information for a seller
   *
   * Retrieves comprehensive order details including customer information,
   * product details, and shipping status for orders containing seller's products.
   *
   * @param orderId - Order ID to retrieve
   * @param sellerId - Seller user ID for access control
   * @returns Detailed order information with populated product and customer data
   * @throws NotFoundException when order not found or doesn't contain seller's products
   */
  async findOneOrder(orderId: string, sellerId: string) {
    // Get seller's product IDs
    const sellerProducts = await this.productModel
      .find({ sellerId: new Types.ObjectId(sellerId) })
      .select('_id');
    const sellerProductIds = sellerProducts.map((product) => product._id);

    const order = await this.orderModel
      .findOne({
        _id: new Types.ObjectId(orderId),
        'items.productId': { $in: sellerProductIds },
      })
      .populate('items.productId', 'name price imageUrls description')
      .populate('userId', 'firstName lastName email phoneNumber')
      .lean();

    if (!order) {
      throw new NotFoundException(
        OrderErrorMessages[OrderError.ORDER_NOT_FOUND],
      );
    }

    return order;
  }

  /**
   * Update order status with validation and business rules
   *
   * Handles order status transitions with proper validation to ensure
   * only valid state changes are allowed. Supports adding tracking numbers
   * and seller notes during status updates.
   *
   * Valid transitions:
   * - pending → processing, cancelled
   * - processing → shipped, cancelled
   * - shipped → delivered, cancelled
   * - delivered → (no further transitions)
   * - cancelled → (no further transitions)
   *
   * @param orderId - Order ID to update
   * @param sellerId - Seller user ID for access control
   * @param updateDto - Status update data including new status, tracking number, and notes
   * @returns Updated order with new status and metadata
   * @throws NotFoundException when order not found or doesn't contain seller's products
   * @throws BadRequestException when status transition is invalid or order is already completed
   */
  async updateOrderStatus(
    orderId: string,
    sellerId: string,
    updateDto: UpdateOrderStatusDto,
  ) {
    // Get seller's product IDs
    const sellerProducts = await this.productModel
      .find({ sellerId: new Types.ObjectId(sellerId) })
      .select('_id');
    const sellerProductIds = sellerProducts.map((product) => product._id);

    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      'items.productId': { $in: sellerProductIds },
    });

    if (!order) {
      throw new NotFoundException(
        OrderErrorMessages[OrderError.ORDER_NOT_FOUND],
      );
    }

    // Check if order is already completed or cancelled
    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        order.status === OrderStatus.DELIVERED
          ? OrderErrorMessages[OrderError.ORDER_ALREADY_COMPLETED]
          : OrderErrorMessages[OrderError.ORDER_ALREADY_CANCELLED],
      );
    }

    // Validate status transition
    const validTransitions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    const currentStatus = order.status;
    const newStatus = updateDto.status;

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        OrderErrorMessages[OrderError.INVALID_STATUS_TRANSITION],
      );
    }

    // Update order status
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (updateDto.trackingNumber) {
      updateData.trackingNumber = updateDto.trackingNumber;
    }

    if (updateDto.notes) {
      updateData.sellerNotes = updateDto.notes;
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(orderId, updateData, { new: true })
      .populate('items.productId', 'name price imageUrls')
      .populate('userId', 'firstName lastName email');

    return updatedOrder;
  }

  /**
   * Get comprehensive order statistics for seller
   *
   * Provides detailed analytics including order counts by status,
   * total revenue from completed orders, and performance metrics.
   * Only includes orders containing the seller's products.
   *
   * @param sellerId - Seller user ID
   * @returns Order statistics including counts by status and total revenue
   */
  async getOrderStats(sellerId: string) {
    // Get seller's product IDs
    const sellerProducts = await this.productModel
      .find({ sellerId: new Types.ObjectId(sellerId) })
      .select('_id');
    const sellerProductIds = sellerProducts.map((product) => product._id);

    const query = {
      'items.productId': { $in: sellerProductIds },
    };

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      this.orderModel.countDocuments(query),
      this.orderModel.countDocuments({ ...query, status: OrderStatus.PENDING }),
      this.orderModel.countDocuments({
        ...query,
        status: OrderStatus.PROCESSING,
      }),
      this.orderModel.countDocuments({ ...query, status: OrderStatus.SHIPPED }),
      this.orderModel.countDocuments({
        ...query,
        status: OrderStatus.DELIVERED,
      }),
      this.orderModel.countDocuments({
        ...query,
        status: OrderStatus.CANCELLED,
      }),
      this.orderModel.aggregate([
        {
          $match: {
            ...query,
            status: { $in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  }

  /**
   * Add seller notes to an order
   *
   * Allows sellers to add internal notes to orders for tracking purposes,
   * customer communication, or fulfillment instructions.
   *
   * @param orderId - Order ID
   * @param sellerId - Seller user ID for access control
   * @param notes - Notes to add to the order
   * @returns Updated order with new notes
   * @throws NotFoundException when order not found or doesn't contain seller's products
   */
  async addOrderNotes(orderId: string, sellerId: string, notes: string) {
    // Get seller's product IDs
    const sellerProducts = await this.productModel
      .find({ sellerId: new Types.ObjectId(sellerId) })
      .select('_id');
    const sellerProductIds = sellerProducts.map((product) => product._id);

    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      'items.productId': { $in: sellerProductIds },
    });

    if (!order) {
      throw new NotFoundException(
        OrderErrorMessages[OrderError.ORDER_NOT_FOUND],
      );
    }

    // Update seller notes
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        {
          $set: {
            sellerNotes: notes,
            updatedAt: new Date(),
          },
        },
        { new: true },
      )
      .populate('items.productId', 'name price imageUrls')
      .populate('items.sellerId', 'firstName lastName');

    return updatedOrder;
  }

  /**
   * Get orders requiring attention (pending or processing)
   *
   * Retrieves orders that need seller action, such as processing
   * pending orders or preparing orders for shipment.
   *
   * @param sellerId - Seller user ID
   * @param limit - Maximum number of orders to return (default: 10)
   * @returns List of orders requiring seller attention
   */
  async getOrdersRequiringAttention(sellerId: string, limit: number = 10) {
    // Get seller's product IDs
    const sellerProducts = await this.productModel
      .find({ sellerId: new Types.ObjectId(sellerId) })
      .select('_id');
    const sellerProductIds = sellerProducts.map((product) => product._id);

    const orders = await this.orderModel
      .find({
        'items.productId': { $in: sellerProductIds },
        status: { $in: [OrderStatus.PENDING, OrderStatus.PROCESSING] },
      })
      .populate('items.productId', 'name price imageUrls')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: 1 }) // Oldest first
      .limit(limit)
      .lean();

    return orders.map((order) => ({
      _id: (order._id as any).toString(),
      status: order.status,
      totalPrice: order.totalPrice,
      customerName:
        `${(order.userId as any)?.firstName || ''} ${(order.userId as any)?.lastName || ''}`.trim() ||
        'Unknown Customer',
      customerEmail: (order.userId as any)?.email || '',
      itemCount: order.items.length,
      orderDate: (order as any).createdAt,
      urgency: this.calculateOrderUrgency(
        order.status,
        (order as any).createdAt,
      ),
    }));
  }

  /**
   * Get revenue analytics for a date range
   *
   * Provides detailed revenue breakdown including daily sales,
   * order trends, and performance metrics for the specified period.
   *
   * @param sellerId - Seller user ID
   * @param startDate - Start date for analytics period
   * @param endDate - End date for analytics period
   * @returns Revenue analytics and trends
   */
  async getRevenueAnalytics(sellerId: string, startDate: Date, endDate: Date) {
    // Get seller's product IDs
    const sellerProducts = await this.productModel
      .find({ sellerId: new Types.ObjectId(sellerId) })
      .select('_id');
    const sellerProductIds = sellerProducts.map((product) => product._id);

    const analyticsData = await this.orderModel.aggregate([
      {
        $match: {
          'items.productId': { $in: sellerProductIds },
          status: { $in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          dailyRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalPrice' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    const totalRevenue = analyticsData.reduce(
      (sum, day) => sum + day.dailyRevenue,
      0,
    );
    const totalOrders = analyticsData.reduce(
      (sum, day) => sum + day.orderCount,
      0,
    );

    return {
      period: {
        startDate,
        endDate,
        totalDays: Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
      },
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        dailyAverage:
          analyticsData.length > 0 ? totalRevenue / analyticsData.length : 0,
      },
      dailyBreakdown: analyticsData.map((day) => ({
        date: new Date(day._id.year, day._id.month - 1, day._id.day),
        revenue: day.dailyRevenue,
        orderCount: day.orderCount,
        averageOrderValue: day.avgOrderValue,
      })),
    };
  }

  /**
   * Calculate order urgency based on status and age
   *
   * @private
   * @param status - Order status
   * @param orderDate - Order creation date
   * @returns Urgency level (high, medium, low)
   */
  private calculateOrderUrgency(status: OrderStatus, orderDate: Date): string {
    const ageInHours = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);

    if (status === OrderStatus.PENDING) {
      if (ageInHours > 24) return 'high';
      if (ageInHours > 12) return 'medium';
      return 'low';
    }

    if (status === OrderStatus.PROCESSING) {
      if (ageInHours > 48) return 'high';
      if (ageInHours > 24) return 'medium';
      return 'low';
    }

    return 'low';
  }
}
