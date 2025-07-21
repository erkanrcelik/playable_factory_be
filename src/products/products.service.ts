import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { UserRole } from '../schemas/user.schema';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { Campaign, CampaignDocument } from '../schemas/campaign.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
  ) {}

  // Kampanyalı fiyat hesaplama fonksiyonu
  private async getDiscountedPrice(product: any): Promise<number | null> {
    const now = new Date();
    // Aktif kampanyaları bul (platform veya satıcı, ürün veya kategoride geçerli)
    const campaigns = await this.campaignModel
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [
          { productIds: product._id },
          { categoryIds: product.category },
          { type: 'platform' },
        ],
      })
      .lean();
    if (!campaigns.length) return null;
    // En avantajlı kampanyayı uygula
    let minPrice = product.price;
    for (const campaign of campaigns) {
      let discounted = product.price;
      if (campaign.discountType === ('percentage' as any)) {
        discounted = product.price * (1 - campaign.discountValue / 100);
      } else if (campaign.discountType === ('amount' as any)) {
        discounted = product.price - campaign.discountValue;
      }
      if (discounted < minPrice) minPrice = discounted;
    }
    return Math.max(0, Math.round(minPrice * 100) / 100);
  }

  async create(createProductDto: Product, sellerId: string): Promise<Product> {
    const product = new this.productModel({
      ...createProductDto,
      sellerId,
    });
    return product.save();
  }

  async findAllProducts(options: FindAllProductsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isActive,
      isFeatured,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) {
      query.category = new Types.ObjectId(category);
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    } else {
      query.isActive = true; // Default to active products
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('category', 'name')
        .populate('sellerId', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(query),
    ]);

    // Kampanyalı fiyatları ekle
    const productsWithDiscount = await Promise.all(
      products.map(async (product) => {
        const discountedPrice = await this.getDiscountedPrice(product);
        return { ...product, discountedPrice };
      }),
    );

    return {
      data: productsWithDiscount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneProduct(id: string): Promise<any> {
    const product = await this.productModel
      .findById(id)
      .populate('category', 'name')
      .populate('sellerId', 'firstName lastName')
      .lean();

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const discountedPrice = await this.getDiscountedPrice(product);
    return { ...product, discountedPrice };
  }

  async update(
    id: string,
    updateProductDto: Product,
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
