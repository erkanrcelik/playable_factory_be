import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { UserRole } from '../schemas/user.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: any, sellerId: string): Promise<Product> {
    const product = new this.productModel({
      ...createProductDto,
      sellerId,
    });
    return product.save();
  }

  async findAll(query: any = {}): Promise<Product[]> {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      isFeatured,
      page = 1,
      limit = 20,
    } = query;

    const filter: any = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (isFeatured) {
      filter.isFeatured = isFeatured === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;

    return this.productModel
      .find(filter)
      .populate('category', 'name')
      .populate('sellerId', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('category', 'name')
      .populate('sellerId', 'firstName lastName')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: any,
    userId: string,
    userRole: UserRole,
  ): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Only seller can update their own products, admin can update any
    if (userRole !== UserRole.ADMIN && product.sellerId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true },
    );

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Only seller can delete their own products, admin can delete any
    if (userRole !== UserRole.ADMIN && product.sellerId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productModel.findByIdAndDelete(id);
  }

  async findBySeller(sellerId: string): Promise<Product[]> {
    return this.productModel
      .find({ sellerId, isActive: true })
      .populate('category', 'name')
      .exec();
  }

  async toggleFeatured(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Only admin can toggle featured status
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can toggle featured status');
    }

    product.isFeatured = !product.isFeatured;
    return product.save();
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.productModel
      .find({ isFeatured: true, isActive: true })
      .populate('category', 'name')
      .populate('sellerId', 'firstName lastName')
      .limit(10)
      .exec();
  }
}
