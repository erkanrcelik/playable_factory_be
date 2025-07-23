import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import {
  SellerProfile,
  SellerProfileDocument,
} from '../schemas/seller-profile.schema';
import { Campaign, CampaignDocument } from '../schemas/campaign.schema';
import { SearchDto } from './dto/search.dto';

export interface SearchResult {
  products: Array<{
    _id: string;
    name: string;
    description: string;
    price: number;
    discountedPrice?: number;
    imageUrls: string[];
    averageRating: number;
    reviewCount: number;
    category: {
      _id: string;
      name: string;
    };
    seller: {
      _id: string;
      name: string;
      storeName?: string;
    };
    hasDiscount: boolean;
    discountPercentage?: number;
  }>;
  categories: Array<{
    _id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    productCount: number;
  }>;
  sellers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    storeName?: string;
    description?: string;
    logoUrl?: string;
    averageRating: number;
    reviewCount: number;
    productCount: number;
  }>;
  campaigns: Array<{
    _id: string;
    name: string;
    description?: string;
    discountType: string;
    discountValue: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    remainingDays: number;
  }>;
  totalResults: {
    products: number;
    categories: number;
    sellers: number;
    campaigns: number;
  };
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(SellerProfile.name)
    private sellerProfileModel: Model<SellerProfileDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
  ) {}

  /**
   * Genel arama yapar - ürünler, kategoriler, satıcılar ve kampanyalar
   */
  async searchAll(searchDto: SearchDto): Promise<SearchResult> {
    const { query, page = 1, limit = 10, type } = searchDto;

    // Eğer belirli bir tip belirtilmişse sadece o tipi ara
    if (type) {
      switch (type) {
        case 'products':
          return this.searchProducts(query, page, limit);
        case 'categories':
          return this.searchCategories(query, page, limit);
        case 'sellers':
          return this.searchSellers(query, page, limit);
        case 'campaigns':
          return this.searchCampaigns(query, page, limit);
        default:
          return this.searchAll(searchDto);
      }
    }

    // Tüm tipleri paralel olarak ara
    const [products, categories, sellers, campaigns] = await Promise.all([
      this.searchProductsInternal(query, limit),
      this.searchCategoriesInternal(query, limit),
      this.searchSellersInternal(query, limit),
      this.searchCampaignsInternal(query, limit),
    ]);

    return {
      products,
      categories,
      sellers,
      campaigns,
      totalResults: {
        products: products.length,
        categories: categories.length,
        sellers: sellers.length,
        campaigns: campaigns.length,
      },
    };
  }

  /**
   * Sadece ürün araması
   */
  async searchProducts(query: string, page: number = 1, limit: number = 10) {
    const products = await this.searchProductsInternal(
      query,
      limit,
      (page - 1) * limit,
    );
    const total = await this.getProductSearchCount(query);

    return {
      products,
      categories: [],
      sellers: [],
      campaigns: [],
      totalResults: {
        products: total,
        categories: 0,
        sellers: 0,
        campaigns: 0,
      },
    };
  }

  /**
   * Sadece kategori araması
   */
  async searchCategories(query: string, page: number = 1, limit: number = 10) {
    const categories = await this.searchCategoriesInternal(
      query,
      limit,
      (page - 1) * limit,
    );
    const total = await this.getCategorySearchCount(query);

    return {
      products: [],
      categories,
      sellers: [],
      campaigns: [],
      totalResults: {
        products: 0,
        categories: total,
        sellers: 0,
        campaigns: 0,
      },
    };
  }

  /**
   * Sadece satıcı araması
   */
  async searchSellers(query: string, page: number = 1, limit: number = 10) {
    const sellers = await this.searchSellersInternal(
      query,
      limit,
      (page - 1) * limit,
    );
    const total = await this.getSellerSearchCount(query);

    return {
      products: [],
      categories: [],
      sellers,
      campaigns: [],
      totalResults: {
        products: 0,
        categories: 0,
        sellers: total,
        campaigns: 0,
      },
    };
  }

  /**
   * Sadece kampanya araması
   */
  async searchCampaigns(query: string, page: number = 1, limit: number = 10) {
    const campaigns = await this.searchCampaignsInternal(
      query,
      limit,
      (page - 1) * limit,
    );
    const total = await this.getCampaignSearchCount(query);

    return {
      products: [],
      categories: [],
      sellers: [],
      campaigns,
      totalResults: {
        products: 0,
        categories: 0,
        sellers: 0,
        campaigns: total,
      },
    };
  }

  /**
   * Ürün arama (internal)
   */
  private async searchProductsInternal(
    query: string,
    limit: number,
    skip: number = 0,
  ) {
    const searchRegex = new RegExp(query, 'i');

    const products = await this.productModel
      .find({
        isActive: true,
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
        ],
      })
      .populate('category', 'name')
      .populate('sellerId', 'firstName lastName storeName')
      .sort({ isFeatured: -1, averageRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return products.map((product) => ({
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
      hasDiscount:
        !!(product as any).discountedPrice &&
        (product as any).discountedPrice < product.price,
      discountPercentage:
        (product as any).discountedPrice &&
        (product as any).discountedPrice < product.price
          ? Math.round(
              ((product.price - (product as any).discountedPrice) /
                product.price) *
                100,
            )
          : undefined,
    }));
  }

  /**
   * Kategori arama (internal)
   */
  private async searchCategoriesInternal(
    query: string,
    limit: number,
    skip: number = 0,
  ) {
    const searchRegex = new RegExp(query, 'i');

    const categories = await this.categoryModel
      .find({
        isActive: true,
        $or: [{ name: searchRegex }, { description: searchRegex }],
      })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Her kategori için ürün sayısını hesapla
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await this.productModel.countDocuments({
          category: category._id,
          isActive: true,
        });

        return {
          _id: (category._id as any).toString(),
          name: category.name,
          description: category.description,
          imageUrl: (category as any).imageUrl,
          productCount,
        };
      }),
    );

    return categoriesWithCount.filter((cat) => cat.productCount > 0);
  }

  /**
   * Satıcı arama (internal)
   */
  private async searchSellersInternal(
    query: string,
    limit: number,
    skip: number = 0,
  ) {
    const searchRegex = new RegExp(query, 'i');

    const sellers = await this.sellerProfileModel
      .find({
        isActive: true,
        $or: [{ storeName: searchRegex }, { description: searchRegex }],
      })
      .populate('sellerId', 'firstName lastName')
      .sort({ storeName: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Her satıcı için ürün sayısını hesapla
    const sellersWithCount = await Promise.all(
      sellers.map(async (seller) => {
        const productCount = await this.productModel.countDocuments({
          sellerId: seller.sellerId,
          isActive: true,
        });

        return {
          _id: (seller.sellerId as any).toString(),
          firstName: (seller.sellerId as any).firstName,
          lastName: (seller.sellerId as any).lastName,
          storeName: seller.storeName,
          description: seller.description,
          logoUrl: seller.logoUrl,
          averageRating: (seller as any).averageRating || 0,
          reviewCount: (seller as any).reviewCount || 0,
          productCount,
        };
      }),
    );

    return sellersWithCount.filter((seller) => seller.productCount > 0);
  }

  /**
   * Kampanya arama (internal)
   */
  private async searchCampaignsInternal(
    query: string,
    limit: number,
    skip: number = 0,
  ) {
    const searchRegex = new RegExp(query, 'i');
    const now = new Date();

    const campaigns = await this.campaignModel
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [{ name: searchRegex }, { description: searchRegex }],
      })
      .sort({ discountValue: -1, startDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return campaigns.map((campaign) => ({
      _id: (campaign._id as any).toString(),
      name: campaign.name,
      description: campaign.description,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      isActive: campaign.isActive,
      remainingDays: Math.ceil(
        (campaign.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  /**
   * Ürün arama sayısı
   */
  private async getProductSearchCount(query: string): Promise<number> {
    const searchRegex = new RegExp(query, 'i');

    return this.productModel.countDocuments({
      isActive: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ],
    });
  }

  /**
   * Kategori arama sayısı
   */
  private async getCategorySearchCount(query: string): Promise<number> {
    const searchRegex = new RegExp(query, 'i');

    return this.categoryModel.countDocuments({
      isActive: true,
      $or: [{ name: searchRegex }, { description: searchRegex }],
    });
  }

  /**
   * Satıcı arama sayısı
   */
  private async getSellerSearchCount(query: string): Promise<number> {
    const searchRegex = new RegExp(query, 'i');

    return this.sellerProfileModel.countDocuments({
      isActive: true,
      $or: [{ storeName: searchRegex }, { description: searchRegex }],
    });
  }

  /**
   * Kampanya arama sayısı
   */
  private async getCampaignSearchCount(query: string): Promise<number> {
    const searchRegex = new RegExp(query, 'i');
    const now = new Date();

    return this.campaignModel.countDocuments({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [{ name: searchRegex }, { description: searchRegex }],
    });
  }
}
