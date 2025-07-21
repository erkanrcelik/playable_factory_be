import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../../schemas/user.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { UserError, UserErrorMessages } from './enums/user-error.enum';
import { FindAllCustomersDto } from './dto';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerOrderSummary {
  orderId: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
}

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async findAllCustomers(
    options: FindAllCustomersDto,
  ): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10, search, isActive } = options;
    const skip = (page - 1) * limit;

    // Create filter for customers only
    const filter: Record<string, unknown> = {
      role: UserRole.CUSTOMER,
    };

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    // Get total count
    const total = await this.userModel.countDocuments(filter);

    // Get customers
    const data = await this.userModel
      .find(filter)
      .select(
        '-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires',
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findCustomerById(id: string): Promise<User> {
    const customer = await this.userModel
      .findOne({ _id: id, role: UserRole.CUSTOMER })
      .select(
        '-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires',
      )
      .exec();

    if (!customer) {
      throw new NotFoundException(
        UserErrorMessages[UserError.CUSTOMER_NOT_FOUND],
      );
    }

    return customer;
  }

  async getCustomerOrders(customerId: string): Promise<CustomerOrderSummary[]> {
    // Verify customer exists
    const customer = await this.userModel.findOne({
      _id: customerId,
      role: UserRole.CUSTOMER,
    });

    if (!customer) {
      throw new NotFoundException(
        UserErrorMessages[UserError.CUSTOMER_NOT_FOUND],
      );
    }

    const orders = await this.orderModel
      .find({ userId: customerId })
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 })
      .exec();

    return orders.map((order) => ({
      orderId: (order._id as any).toString(),
      totalAmount: order.totalPrice,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: (order as any).createdAt,
      items: order.items.map((item) => ({
        productId: item.productId._id.toString(),
        productName: (item.productId as any).name,
        price: (item.productId as any).price,
        quantity: item.quantity,
      })),
    }));
  }

  async deleteCustomer(id: string): Promise<{ message: string }> {
    const customer = await this.userModel.findOne({
      _id: id,
      role: UserRole.CUSTOMER,
    });

    if (!customer) {
      throw new NotFoundException(
        UserErrorMessages[UserError.CUSTOMER_NOT_FOUND],
      );
    }

    // Check if customer has orders
    const ordersCount = await this.orderModel.countDocuments({ userId: id });
    if (ordersCount > 0) {
      throw new BadRequestException(
        UserErrorMessages[UserError.CUSTOMER_HAS_ORDERS],
      );
    }

    await this.userModel.findByIdAndDelete(id);
    return {
      message: UserErrorMessages[UserError.CUSTOMER_DELETED_SUCCESS],
    };
  }

  async toggleCustomerStatus(id: string): Promise<User> {
    const customer = await this.userModel.findOne({
      _id: id,
      role: UserRole.CUSTOMER,
    });

    if (!customer) {
      throw new NotFoundException(
        UserErrorMessages[UserError.CUSTOMER_NOT_FOUND],
      );
    }

    customer.isActive = !customer.isActive;
    return customer.save();
  }

  async getCustomerStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active] = await Promise.all([
      this.userModel.countDocuments({ role: UserRole.CUSTOMER }),
      this.userModel.countDocuments({
        role: UserRole.CUSTOMER,
        isActive: true,
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }
}
