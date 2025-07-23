import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import {
  Campaign,
  CampaignDocument,
  DiscountType,
} from '../schemas/campaign.schema';
import { Order, OrderDocument } from '../schemas/order.schema';
import { RecommendationsService } from '../recommendations/recommendations.service';

/**
 * Homepage Service
 *
 * Provides data for e-commerce homepage including featured products,
 * popular products, new arrivals, categories, and special offers
 */
@Injectable()
export class HomepageService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  /**
   * Get discounted price for a product based on active campaigns
   *
   * @param product - Product object
   * @returns Discounted price or null if no discount
   */
  private async getDiscountedPrice(product: any): Promise<number | null> {
    const now = new Date();

    const campaigns = await this.campaignModel
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [
          { productIds: product._id },
          { categoryIds: product.category },
          {
            $and: [{ productIds: { $size: 0 } }, { categoryIds: { $size: 0 } }],
          },
        ],
      })
      .lean();

    if (!campaigns.length) return null;

    let minPrice = product.price;
    for (const campaign of campaigns) {
      let discounted = product.price;
      if (campaign.discountType === DiscountType.PERCENTAGE) {
        discounted = product.price * (1 - campaign.discountValue / 100);
      } else if (campaign.discountType === DiscountType.AMOUNT) {
        discounted = product.price - campaign.discountValue;
      }
      if (discounted < minPrice) minPrice = discounted;
    }

    return Math.max(0, Math.round(minPrice * 100) / 100);
  }

  /**
   * Add discount information to products
   *
   * @param products - Array of products
   * @returns Products with discount information
   */
  private async addDiscountInfo(products: any[]) {
    return Promise.all(
      products.map(async (product) => {
        const discountedPrice = await this.getDiscountedPrice(product);
        const hasDiscount =
          discountedPrice !== null && discountedPrice < product.price;

        return {
          ...product,
          discountedPrice,
          hasDiscount,
          discountPercentage: hasDiscount
            ? Math.round(
                ((product.price - discountedPrice) / product.price) * 100,
              )
            : 0,
        };
      }),
    );
  }

  /**
   * Get featured products for homepage
   *
   * @param limit - Number of products to return
   * @returns Featured products with discount information
   */
  async getFeaturedProducts(limit: number = 8) {
    const products = await this.productModel
      .find({
        isFeatured: true,
        isActive: true,
        stock: { $gt: 0 },
      })
      .populate('category', 'name imageUrl')
      .populate('sellerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return this.addDiscountInfo(products);
  }

  /**
   * Get new arrival products
   *
   * @param limit - Number of products to return
   * @param days - Consider products created within last X days as new
   * @returns New arrival products
   */
  async getNewArrivals(limit: number = 8, days: number = 30) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const products = await this.productModel
      .find({
        isActive: true,
        stock: { $gt: 0 },
        createdAt: { $gte: daysAgo },
      })
      .populate('category', 'name imageUrl')
      .populate('sellerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return this.addDiscountInfo(products);
  }

  /**
   * Get popular/bestseller products based on order frequency
   *
   * @param limit - Number of products to return
   * @param days - Consider orders from last X days
   * @returns Popular products
   */
  async getPopularProducts(limit: number = 8, days: number = 30) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    // Aggregate to find most ordered products
    const popularProductIds = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          status: { $in: ['processing', 'shipped', 'delivered'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          orderCount: { $sum: '$items.quantity' },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: limit },
      { $project: { productId: '$_id' } },
    ]);

    if (popularProductIds.length === 0) {
      // Fallback to highest rated or most recent if no orders
      const products = await this.productModel
        .find({
          isActive: true,
          stock: { $gt: 0 },
        })
        .populate('category', 'name imageUrl')
        .populate('sellerId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return this.addDiscountInfo(products);
    }

    const products = await this.productModel
      .find({
        _id: { $in: popularProductIds.map((p) => p.productId) },
        isActive: true,
        stock: { $gt: 0 },
      })
      .populate('category', 'name imageUrl')
      .populate('sellerId', 'firstName lastName')
      .lean();

    return this.addDiscountInfo(products);
  }

  /**
   * Get special offers and discounted products
   */
  async getSpecialOffers(limit: number = 8) {
    // Get products with active campaigns
    const productsWithCampaigns = await this.productModel
      .find({
        isActive: true,
        $or: [
          { 'campaigns.0': { $exists: true } }, // Products with campaigns
          { isFeatured: true }, // Featured products as fallback
        ],
      })
      .populate('category', 'name')
      .populate('sellerId', 'firstName lastName storeName')
      .sort({ isFeatured: -1, averageRating: -1 })
      .limit(limit)
      .lean();

    return productsWithCampaigns.map((product) => ({
      _id: (product._id as any).toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      discountedPrice: (product as any).discountedPrice,
      imageUrls: product.imageUrls || [],
      averageRating: (product as any).averageRating || 0,
      reviewCount: (product as any).reviewCount || 0,
      category: {
        _id: (product.category as any)?._id?.toString(),
        name: (product.category as any)?.name,
      },
      seller: {
        _id: (product.sellerId as any)?._id?.toString(),
        name: `${(product.sellerId as any)?.firstName} ${(product.sellerId as any)?.lastName}`,
        storeName: (product.sellerId as any)?.storeName,
      },
      isFeatured: product.isFeatured,
      hasDiscount:
        (product as any).discountedPrice &&
        (product as any).discountedPrice < product.price,
      discountPercentage:
        (product as any).discountedPrice &&
        (product as any).discountedPrice < product.price
          ? Math.round(
              ((product.price - (product as any).discountedPrice) /
                product.price) *
                100,
            )
          : 0,
    }));
  }

  /**
   * Get products by specific category for homepage sections
   *
   * @param categoryId - Category ID
   * @param limit - Number of products to return
   * @returns Products in the category
   */
  async getProductsByCategory(categoryId: string, limit: number = 6) {
    const products = await this.productModel
      .find({
        category: new Types.ObjectId(categoryId),
        isActive: true,
        stock: { $gt: 0 },
      })
      .populate('category', 'name imageUrl')
      .populate('sellerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return this.addDiscountInfo(products);
  }

  /**
   * Get all active categories for homepage navigation
   *
   * @param limit - Number of categories to return
   * @returns Active categories with product count
   */
  async getCategories(limit: number = 12) {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .limit(limit)
      .lean();

    // Add product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await this.productModel.countDocuments({
          category: category._id,
          isActive: true,
          stock: { $gt: 0 },
        });

        return {
          ...category,
          productCount,
        };
      }),
    );

    return categoriesWithCount;
  }

  /**
   * Get complete homepage data in a single call
   *
   * @param userId - Optional user ID for personalized recommendations
   * @returns All homepage sections data
   */
  async getHomepageData(userId?: string) {
    const [
      featuredProducts,
      newArrivals,
      popularProducts,
      specialOffers,
      categories,
    ] = await Promise.all([
      this.getFeaturedProducts(8),
      this.getNewArrivals(8),
      this.getPopularProducts(8),
      this.getSpecialOffers(8),
      this.getCategories(12),
    ]);

    const result = {
      featuredProducts: {
        title: 'Featured Products',
        products: featuredProducts,
      },
      newArrivals: {
        title: 'New Arrivals',
        products: newArrivals,
      },
      popularProducts: {
        title: 'Popular Products',
        products: popularProducts,
      },
      specialOffers: {
        title: 'Special Offers',
        products: specialOffers,
      },
      categories: {
        title: 'Shop by Category',
        items: categories,
      },
    };

    // Eğer kullanıcı login olmuşsa recommendation verilerini ekle
    if (userId) {
      try {
        const [personalized, mostViewed, browsingHistory] = await Promise.all([
          this.recommendationsService.getPersonalizedRecommendations(userId, 6),
          this.recommendationsService.getMostViewedProducts(userId, 6),
          this.recommendationsService.getBrowsingHistoryRecommendations(userId, 6),
        ]);

        result['recommendations'] = {
          personalized,
          mostViewed,
          browsingHistory,
        };
      } catch (error) {
        // Recommendation servisi çalışmazsa boş array döndür
        result['recommendations'] = {
          personalized: [],
          mostViewed: [],
          browsingHistory: [],
        };
      }
    }

    return result;
  }

  /**
   * Get complete homepage data with personalized recommendations for authenticated users
   *
   * @param userId - User ID for personalized recommendations
   * @returns All homepage sections data with recommendations
   */
  async getHomepageDataWithRecommendations(userId: string) {
    const [
      featuredProducts,
      newArrivals,
      popularProducts,
      specialOffers,
      categories,
      personalized,
      mostViewed,
      browsingHistory,
    ] = await Promise.all([
      this.getFeaturedProducts(8),
      this.getNewArrivals(8),
      this.getPopularProducts(8),
      this.getSpecialOffers(8),
      this.getCategories(12),
      this.recommendationsService.getPersonalizedRecommendations(userId, 6),
      this.recommendationsService.getMostViewedProducts(userId, 6),
      this.recommendationsService.getBrowsingHistoryRecommendations(userId, 6),
    ]);

    return {
      featuredProducts: {
        title: 'Featured Products',
        products: featuredProducts,
      },
      newArrivals: {
        title: 'New Arrivals',
        products: newArrivals,
      },
      popularProducts: {
        title: 'Popular Products',
        products: popularProducts,
      },
      specialOffers: {
        title: 'Special Offers',
        products: specialOffers,
      },
      categories: {
        title: 'Shop by Category',
        items: categories,
      },
      recommendations: {
        personalized,
        mostViewed,
        browsingHistory,
      },
    };
  }

  /**
   * Get products by seller for seller profile page
   *
   * @param sellerId - Seller ID
   * @param limit - Number of products to return
   * @returns Seller's products
   */
  async getSellerProducts(sellerId: string, limit: number = 12) {
    const products = await this.productModel
      .find({
        sellerId: new Types.ObjectId(sellerId),
        isActive: true,
        stock: { $gt: 0 },
      })
      .populate('category', 'name imageUrl')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return this.addDiscountInfo(products);
  }

  /**
   * Get related products for product detail page
   *
   * @param productId - Current product ID
   * @param limit - Number of related products to return
   * @returns Related products
   */
  async getRelatedProducts(productId: string, limit: number = 6) {
    const currentProduct = await this.productModel
      .findById(productId)
      .select('category tags')
      .lean();

    if (!currentProduct) {
      return [];
    }

    const products = await this.productModel
      .find({
        _id: { $ne: new Types.ObjectId(productId) },
        $or: [
          { category: currentProduct.category },
          { tags: { $in: currentProduct.tags || [] } },
        ],
        isActive: true,
        stock: { $gt: 0 },
      })
      .populate('category', 'name imageUrl')
      .populate('sellerId', 'firstName lastName')
      .limit(limit)
      .lean();

    return this.addDiscountInfo(products);
  }
}
