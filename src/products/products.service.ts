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
      seller,
      isActive,
      isFeatured,
      minPrice,
      maxPrice,
      tags,
      hasDiscount,
      inStock,
      // campaignId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const query: any = {};

    // Arama filtresi
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Kategori filtresi
    if (category) {
      query.category = new Types.ObjectId(category);
    }

    // Satıcı filtresi
    if (seller) {
      query.sellerId = new Types.ObjectId(seller);
    }

    // Aktif ürün filtresi
    if (isActive !== undefined) {
      query.isActive = isActive;
    } else {
      query.isActive = true; // Default to active products
    }

    // Öne çıkan ürün filtresi
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured;
    }

    // Fiyat filtresi
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Tag filtresi
    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Stok filtresi
    if (inStock !== undefined) {
      if (inStock) {
        query.stock = { $gt: 0 };
      } else {
        query.stock = { $lte: 0 };
      }
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('category', 'name')
        .populate('sellerId', 'firstName lastName storeName')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(query),
    ]);

    // Kampanyalı fiyatları ve indirim bilgilerini ekle
    const productsWithDiscount = await Promise.all(
      products.map(async (product) => {
        const discountedPrice = await this.getDiscountedPrice(product);
        const hasDiscount =
          discountedPrice !== null && discountedPrice < product.price;
        const discountPercentage = hasDiscount
          ? Math.round(
              ((product.price - discountedPrice) / product.price) * 100,
            )
          : 0;

        return {
          ...product,
          discountedPrice,
          hasDiscount,
          discountPercentage,
        };
      }),
    );

    // İndirim filtresi (kampanya hesaplamasından sonra)
    let filteredProducts = productsWithDiscount;
    if (hasDiscount !== undefined) {
      filteredProducts = productsWithDiscount.filter(
        (product) => product.hasDiscount === hasDiscount,
      );
    }

    return {
      data: filteredProducts,
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

  /**
   * Get filter options for products
   */
  async getFilterOptions() {
    // Kategoriler
    const categories = await this.productModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: '$categoryInfo._id',
          name: '$categoryInfo.name',
          productCount: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    // Fiyat aralıkları
    const priceStats = await this.productModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    const priceRanges: Array<{
      min: number;
      max: number;
      label: string;
      productCount: number;
    }> = [];
    if (priceStats.length > 0) {
      const { minPrice, maxPrice } = priceStats[0];
      const range = maxPrice - minPrice;
      const step = range / 5;

      for (let i = 0; i < 5; i++) {
        const min = Math.round(minPrice + i * step);
        const max = Math.round(minPrice + (i + 1) * step);

        const productCount = await this.productModel.countDocuments({
          isActive: true,
          price: { $gte: min, $lte: max },
        });

        priceRanges.push({
          min,
          max,
          label: `${min} TL - ${max} TL`,
          productCount,
        });
      }
    }

    // Tag'ler
    const tags = await this.productModel.aggregate([
      { $match: { isActive: true, tags: { $exists: true, $ne: [] } } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          name: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Satıcılar
    const sellers = await this.productModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$sellerId',
          productCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'sellerInfo',
        },
      },
      { $unwind: '$sellerInfo' },
      {
        $project: {
          _id: '$sellerInfo._id',
          name: {
            $concat: ['$sellerInfo.firstName', ' ', '$sellerInfo.lastName'],
          },
          storeName: '$sellerInfo.storeName',
          productCount: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    return {
      categories,
      priceRanges,
      tags,
      sellers,
    };
  }

  async getProductsByCampaign(campaignId: string, page = 1, limit = 10) {
    const query: any = {};
    const campaign = await this.campaignModel.findById(campaignId).lean();
    if (!campaign) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
    const now = new Date();
    if (
      !campaign.isActive ||
      campaign.startDate > now ||
      campaign.endDate < now
    ) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
    const campaignProductIds = (campaign.productIds || []).map(
      (id) => new Types.ObjectId(id),
    );
    const campaignCategoryIds = (campaign.categoryIds || []).map(
      (id) => new Types.ObjectId(id),
    );
    if (campaignProductIds.length && campaignCategoryIds.length) {
      query.$or = [
        { _id: { $in: campaignProductIds } },
        { category: { $in: campaignCategoryIds } },
      ];
    } else if (campaignProductIds.length) {
      query._id = { $in: campaignProductIds };
    } else if (campaignCategoryIds.length) {
      query.category = { $in: campaignCategoryIds };
    }
    // Eğer ikisi de boşsa tüm ürünleri getir
    query.isActive = true;
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('category', 'name')
        .populate('sellerId', 'firstName lastName storeName')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(query),
    ]);
    // Kampanyalı fiyatları ve indirim bilgilerini ekle
    const productsWithDiscount = await Promise.all(
      products.map(async (product) => {
        const discountedPrice = await this.getDiscountedPrice(product);
        const hasDiscount =
          discountedPrice !== null && discountedPrice < product.price;
        const discountPercentage = hasDiscount
          ? Math.round(
              ((product.price - discountedPrice) / product.price) * 100,
            )
          : 0;
        return {
          ...product,
          discountedPrice,
          hasDiscount,
          discountPercentage,
        };
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
}
