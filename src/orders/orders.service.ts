import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentStatus,
} from '../schemas/order.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersDto } from './dto/find-orders.dto';

export interface OrderSummary {
  _id: string;
  status: OrderStatus;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  itemCount: number;
  orderDate: Date;
  estimatedDelivery?: Date;
}

export interface OrderDetails extends OrderSummary {
  items: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    sellerId: string;
    sellerName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  shippingAddress: any;
  trackingNumber?: string;
  notes?: string;
  sellerNotes?: string;
}

/**
 * Orders Service
 *
 * Handles comprehensive order management including:
 * - Order creation from cart checkout
 * - Customer order listing and details
 * - Order status tracking and updates
 * - Order cancellation with business rules
 * - Stock management integration
 * - Seller order associations
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Create a new order from cart data
   *
   * @param userId - Customer user ID
   * @param createOrderDto - Order creation data from checkout
   * @returns Created order with details
   */
  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderDetails> {
    // Validate user exists and is customer
    const user = await this.userModel.findById(userId);
    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new BadRequestException('Invalid customer');
    }

    // Validate products and stock availability
    const validatedItems = await this.validateOrderItems(createOrderDto.items);

    // Calculate total price
    const totalPrice = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Create order
    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      items: validatedItems.map((item) => ({
        productId: new Types.ObjectId(item.productId),
        sellerId: new Types.ObjectId(item.sellerId),
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice,
      shippingAddress: createOrderDto.shippingAddress,
      status: OrderStatus.PENDING,
      paymentStatus: createOrderDto.paymentStatus || PaymentStatus.PENDING,
      notes: createOrderDto.notes,
    });

    const savedOrder = await order.save();

    // Reduce stock for ordered products
    await this.reduceProductStock(validatedItems);

    // Return order details
    return this.formatOrderDetails(savedOrder, validatedItems);
  }

  /**
   * Get paginated orders for a customer
   *
   * @param userId - Customer user ID
   * @param query - Query parameters for filtering and pagination
   * @returns Paginated order list
   */
  async findCustomerOrders(userId: string, query: FindOrdersDto) {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = { userId: new Types.ObjectId(userId) };

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('items.productId', 'name imageUrls')
        .populate('items.sellerId', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    const orderSummaries: OrderSummary[] = orders.map((order) => ({
      _id: (order._id as any).toString(),
      status: order.status,
      totalPrice: order.totalPrice,
      paymentStatus: order.paymentStatus,
      itemCount: order.items.length,
      orderDate: (order as any).createdAt,
      estimatedDelivery: (order as any).estimatedDelivery,
    }));

    return {
      data: orderSummaries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get detailed order information
   *
   * @param orderId - Order ID
   * @param userId - Customer user ID (for access control)
   * @returns Detailed order information
   */
  async findOrderById(orderId: string, userId: string): Promise<OrderDetails> {
    const order = await this.orderModel
      .findOne({
        _id: new Types.ObjectId(orderId),
        userId: new Types.ObjectId(userId),
      })
      .populate('items.productId', 'name imageUrls')
      .populate('items.sellerId', 'firstName lastName')
      .lean();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const items = order.items.map((item) => ({
      productId: item.productId._id.toString(),
      productName: (item.productId as any).name,
      productImage: (item.productId as any).imageUrls?.[0],
      sellerId: item.sellerId._id.toString(),
      sellerName: `${(item.sellerId as any).firstName} ${(item.sellerId as any).lastName}`,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    return {
      _id: (order._id as any).toString(),
      status: order.status,
      totalPrice: order.totalPrice,
      paymentStatus: order.paymentStatus,
      itemCount: order.items.length,
      orderDate: (order as any).createdAt,
      estimatedDelivery: this.calculateEstimatedDelivery(
        order.status,
        (order as any).createdAt,
      ),
      items,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      sellerNotes: (order as any).sellerNotes,
    };
  }

  /**
   * Cancel an order if allowed
   *
   * @param orderId - Order ID
   * @param userId - Customer user ID
   * @returns Updated order
   */
  async cancelOrder(orderId: string, userId: string): Promise<OrderDetails> {
    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if order can be cancelled
    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Cannot cancel shipped or delivered orders',
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    // Update order status
    order.status = OrderStatus.CANCELLED;
    await order.save();

    // Restore product stock
    await this.restoreProductStock(order.items);

    // Return updated order details
    const populatedOrder = await this.orderModel
      .findById(orderId)
      .populate('items.productId', 'name imageUrls')
      .populate('items.sellerId', 'firstName lastName')
      .lean();

    return this.formatOrderDetailsFromPopulated(populatedOrder!);
  }

  /**
   * Get order tracking information
   *
   * @param orderId - Order ID
   * @param userId - Customer user ID
   * @returns Order tracking details
   */
  async getOrderTracking(orderId: string, userId: string) {
    const order = await this.findOrderById(orderId, userId);

    const trackingHistory = this.generateTrackingHistory(
      order.status,
      order.orderDate,
    );

    return {
      orderId: order._id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      currentLocation: this.getCurrentLocation(order.status),
      trackingHistory,
    };
  }

  /**
   * Validate order items and check stock availability
   *
   * @private
   * @param items - Order items to validate
   * @returns Validated items with product details
   */
  private async validateOrderItems(items: any[]) {
    const validatedItems: Array<{
      productId: string;
      sellerId: string;
      quantity: number;
      price: number;
      productName: string;
      productImage?: string;
      sellerName: string;
    }> = [];

    for (const item of items) {
      const product = await this.productModel
        .findById(item.productId)
        .populate('sellerId', 'firstName lastName')
        .exec();

      if (!product || !product.isActive) {
        throw new BadRequestException(
          `Product ${item.productId} not found or inactive`,
        );
      }

      const totalStock = product.stock || 0;
      if (totalStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}`,
        );
      }

      validatedItems.push({
        productId: (product._id as any).toString(),
        sellerId: (product.sellerId._id as any).toString(),
        quantity: item.quantity,
        price: item.price,
        productName: product.name,
        productImage: product.imageUrls?.[0],
        sellerName: `${(product.sellerId as any).firstName} ${(product.sellerId as any).lastName}`,
      });
    }

    return validatedItems;
  }

  /**
   * Reduce product stock after order creation
   *
   * @private
   * @param items - Order items
   */
  private async reduceProductStock(items: any[]) {
    for (const item of items) {
      const product = await this.productModel.findById(item.productId);
      if (product) {
        // Reduce stock from main product stock
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }
  }

  /**
   * Restore product stock after order cancellation
   *
   * @private
   * @param items - Order items
   */
  private async restoreProductStock(items: any[]) {
    for (const item of items) {
      const product = await this.productModel.findById(item.productId);
      if (product) {
        // Restore stock to main product stock
        product.stock += item.quantity;
        await product.save();
      }
    }
  }

  /**
   * Calculate estimated delivery date based on order status
   *
   * @private
   * @param status - Order status
   * @param orderDate - Order creation date
   * @returns Estimated delivery date
   */
  private calculateEstimatedDelivery(
    status: OrderStatus,
    orderDate: Date,
  ): Date | undefined {
    const businessDays = {
      [OrderStatus.PENDING]: 7,
      [OrderStatus.PROCESSING]: 5,
      [OrderStatus.SHIPPED]: 3,
      [OrderStatus.DELIVERED]: 0,
      [OrderStatus.CANCELLED]: undefined,
    };

    const days = businessDays[status];
    if (days === undefined) return undefined;

    const delivery = new Date(orderDate);
    delivery.setDate(delivery.getDate() + days);
    return delivery;
  }

  /**
   * Generate tracking history for order status progression
   *
   * @private
   * @param currentStatus - Current order status
   * @param orderDate - Order creation date
   * @returns Tracking history array
   */
  private generateTrackingHistory(currentStatus: OrderStatus, orderDate: Date) {
    const baseHistory = [
      {
        status: OrderStatus.PENDING,
        timestamp: orderDate,
        description: 'Order received and being processed',
        completed: true,
      },
    ];

    const statusOrder = [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);

    for (let i = 1; i <= currentIndex; i++) {
      const status = statusOrder[i];
      const timestamp = new Date(orderDate);
      timestamp.setDate(timestamp.getDate() + i);

      baseHistory.push({
        status,
        timestamp,
        description: this.getStatusDescription(status),
        completed: true,
      });
    }

    // Add next expected status if not delivered or cancelled
    if (
      currentStatus !== OrderStatus.DELIVERED &&
      currentStatus !== OrderStatus.CANCELLED
    ) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < statusOrder.length) {
        const nextStatus = statusOrder[nextIndex];
        const estimatedTimestamp = new Date(orderDate);
        estimatedTimestamp.setDate(
          estimatedTimestamp.getDate() + nextIndex + 1,
        );

        baseHistory.push({
          status: nextStatus,
          timestamp: estimatedTimestamp,
          description: this.getStatusDescription(nextStatus),
          completed: false,
        });
      }
    }

    return baseHistory;
  }

  /**
   * Get human-readable status description
   *
   * @private
   * @param status - Order status
   * @returns Status description
   */
  private getStatusDescription(status: OrderStatus): string {
    const descriptions = {
      [OrderStatus.PENDING]: 'Order received and being processed',
      [OrderStatus.PROCESSING]: 'Order is being prepared for shipping',
      [OrderStatus.SHIPPED]: 'Order has been shipped and is on its way',
      [OrderStatus.DELIVERED]: 'Order has been delivered successfully',
      [OrderStatus.CANCELLED]: 'Order has been cancelled',
    };

    return descriptions[status];
  }

  /**
   * Get current location based on order status
   *
   * @private
   * @param status - Order status
   * @returns Current location string
   */
  private getCurrentLocation(status: OrderStatus): string {
    const locations = {
      [OrderStatus.PENDING]: 'Order Processing Center',
      [OrderStatus.PROCESSING]: 'Fulfillment Center',
      [OrderStatus.SHIPPED]: 'In Transit',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.CANCELLED]: 'N/A',
    };

    return locations[status];
  }

  /**
   * Format order details from validated items
   *
   * @private
   * @param order - Saved order document
   * @param validatedItems - Validated item details
   * @returns Formatted order details
   */
  private formatOrderDetails(
    order: OrderDocument,
    validatedItems: any[],
  ): OrderDetails {
    return {
      _id: (order._id as any).toString(),
      status: order.status,
      totalPrice: order.totalPrice,
      paymentStatus: order.paymentStatus,
      itemCount: order.items.length,
      orderDate: (order as any).createdAt,
      estimatedDelivery: this.calculateEstimatedDelivery(
        order.status,
        (order as any).createdAt,
      ),
      items: validatedItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
    };
  }

  /**
   * Format order details from populated order
   *
   * @private
   * @param order - Populated order document
   * @returns Formatted order details
   */
  private formatOrderDetailsFromPopulated(order: any): OrderDetails {
    const items = order.items.map((item: any) => ({
      productId: item.productId._id.toString(),
      productName: item.productId.name,
      productImage: item.productId.imageUrls?.[0],
      sellerId: item.sellerId._id.toString(),
      sellerName: `${item.sellerId.firstName} ${item.sellerId.lastName}`,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    return {
      _id: order._id.toString(),
      status: order.status,
      totalPrice: order.totalPrice,
      paymentStatus: order.paymentStatus,
      itemCount: order.items.length,
      orderDate: order.createdAt,
      estimatedDelivery: this.calculateEstimatedDelivery(
        order.status,
        order.createdAt,
      ),
      items,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      sellerNotes: order.sellerNotes,
    };
  }
}
