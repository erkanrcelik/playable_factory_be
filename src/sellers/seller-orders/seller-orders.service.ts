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

@Injectable()
export class SellerOrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Get all orders for a seller
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
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.firstName': { $regex: search, $options: 'i' } },
        { 'customer.lastName': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
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
        .populate('customer', 'firstName lastName email')
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
   * Get order by ID for a seller
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
      .populate('customer', 'firstName lastName email phoneNumber')
      .lean();

    if (!order) {
      throw new NotFoundException(
        OrderErrorMessages[OrderError.ORDER_NOT_FOUND],
      );
    }

    return order;
  }

  /**
   * Update order status
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
      .populate('customer', 'firstName lastName email');

    return updatedOrder;
  }

  /**
   * Get order statistics for seller
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
}
