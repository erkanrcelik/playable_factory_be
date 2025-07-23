import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Campaign,
  CampaignDocument,
  CampaignType,
} from '../schemas/campaign.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { FindCampaignsDto } from './dto/find-campaigns.dto';

export interface CampaignSummary {
  _id: string;
  name: string;
  type: CampaignType;
  discountType: string;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  description?: string;
  imageUrl?: string;
  minOrderAmount: number;
  isActive: boolean;
  applicableItems: {
    allProducts: boolean;
    categories: Array<{
      _id: string;
      name: string;
    }>;
    products: Array<{
      _id: string;
      name: string;
    }>;
  };
  seller?: {
    _id: string;
    name: string;
    storeName?: string;
  };
  remainingDays: number;
  isExpired: boolean;
}

/**
 * Campaigns Service
 *
 * Handles public campaign access for customers including:
 * - Platform and seller campaign listing
 * - Campaign filtering and search
 * - Campaign details with product/category information
 * - Active campaign validation
 * - Campaign applicability checking
 */
@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Get all active campaigns (platform + seller) with filtering
   *
   * @param query - Filtering and pagination parameters
   * @returns Paginated list of campaigns with detailed information
   */
  async findAllCampaigns(query: FindCampaignsDto) {
    const {
      page = 1,
      limit = 20,
      type,
      discountType,
      categoryId,
      productId,
      minDiscount,
      maxDiscount,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      activeOnly = true, // Only get active campaigns
    } = query;

    const filter: any = {};

    // Only get active campaigns
    if (activeOnly) {
      filter.isActive = true;

      // Filter expired campaigns - only campaigns in active date range
      const now = new Date();
      filter.startDate = { $lte: now }; // Start date is past or today
      filter.endDate = { $gte: now }; // End date is future or today
    } else {
      // No filter applied for testing
    }

    // Filter by campaign type
    if (type) {
      filter.type = type;
    }

    // Filter by discount type
    if (discountType) {
      filter.discountType = discountType;
    }

    // Filter by discount value range
    if (minDiscount !== undefined || maxDiscount !== undefined) {
      filter.discountValue = {};
      if (minDiscount !== undefined) filter.discountValue.$gte = minDiscount;
      if (maxDiscount !== undefined) filter.discountValue.$lte = maxDiscount;
    }

    // Filter by category
    if (categoryId) {
      filter.categoryIds = new Types.ObjectId(categoryId);
    }

    // Filter by product
    if (productId) {
      filter.productIds = new Types.ObjectId(productId);
    }

    // Search in name and description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      this.campaignModel
        .find(filter)
        .populate('categoryIds', 'name description imageUrl')
        .populate('productIds', 'name price imageUrls')
        .populate('sellerId', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.campaignModel.countDocuments(filter),
    ]);

    const campaignSummaries: CampaignSummary[] = await Promise.all(
      campaigns.map((campaign) => this.formatCampaignSummary(campaign)),
    );

    return {
      data: campaignSummaries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get detailed campaign information by ID
   *
   * @param campaignId - Campaign ID
   * @returns Detailed campaign information
   */
  async findCampaignById(campaignId: string): Promise<CampaignSummary> {
    const campaign = await this.campaignModel
      .findOne({
        _id: new Types.ObjectId(campaignId),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      })
      .populate('categoryIds', 'name description imageUrl')
      .populate('productIds', 'name price imageUrls')
      .populate('sellerId', 'firstName lastName')
      .lean();

    if (!campaign) {
      throw new Error('Campaign not found or expired');
    }

    return this.formatCampaignSummary(campaign);
  }

  /**
   * Get campaigns by category
   *
   * @param categoryId - Category ID
   * @param limit - Maximum number of campaigns to return
   * @returns List of campaigns applicable to the category
   */
  async findCampaignsByCategory(categoryId: string, limit: number = 10) {
    const now = new Date();
    const campaigns = await this.campaignModel
      .find({
        $or: [
          { categoryIds: new Types.ObjectId(categoryId) },
          { categoryIds: { $size: 0 }, productIds: { $size: 0 } }, // All products campaigns
        ],
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .populate('categoryIds', 'name')
      .populate('sellerId', 'firstName lastName')
      .sort({ discountValue: -1 })
      .limit(limit)
      .lean();

    return Promise.all(
      campaigns.map((campaign) => this.formatCampaignSummary(campaign)),
    );
  }

  /**
   * Get campaigns by product
   *
   * @param productId - Product ID
   * @param limit - Maximum number of campaigns to return
   * @returns List of campaigns applicable to the product
   */
  async findCampaignsByProduct(productId: string, limit: number = 10) {
    // First get the product to know its category
    const product = await this.productModel
      .findById(productId)
      .populate('category')
      .lean();
    if (!product) {
      return [];
    }

    const now = new Date();
    const campaigns = await this.campaignModel
      .find({
        $or: [
          { productIds: new Types.ObjectId(productId) },
          { categoryIds: (product.category as any)._id },
          { categoryIds: { $size: 0 }, productIds: { $size: 0 } }, // All products campaigns
        ],
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .populate('categoryIds', 'name')
      .populate('sellerId', 'firstName lastName')
      .sort({ discountValue: -1 })
      .limit(limit)
      .lean();

    return Promise.all(
      campaigns.map((campaign) => this.formatCampaignSummary(campaign)),
    );
  }

  /**
   * Get campaigns by seller for public access
   *
   * @param sellerId - Seller ID
   * @param limit - Maximum number of campaigns to return
   * @returns List of active campaigns created by the seller
   */
  async findCampaignsBySeller(sellerId: string, limit: number = 10) {
    const now = new Date();
    const campaigns = await this.campaignModel
      .find({
        sellerId: new Types.ObjectId(sellerId),
        type: CampaignType.SELLER,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .populate('categoryIds', 'name description imageUrl')
      .populate('productIds', 'name price imageUrls')
      .populate('sellerId', 'firstName lastName')
      .sort({ discountValue: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return Promise.all(
      campaigns.map((campaign) => this.formatCampaignSummary(campaign)),
    );
  }

  /**
   * Get trending campaigns (highest discount or most recent)
   *
   * @param limit - Maximum number of campaigns to return
   * @returns List of trending campaigns
   */
  async getTrendingCampaigns(limit: number = 6) {
    const now = new Date();
    const campaigns = await this.campaignModel
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .populate('categoryIds', 'name')
      .populate('productIds', 'name price imageUrls')
      .populate('sellerId', 'firstName lastName')
      .sort({ discountValue: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return Promise.all(
      campaigns.map((campaign) => this.formatCampaignSummary(campaign)),
    );
  }

  /**
   * Check if a campaign is applicable to a specific product
   *
   * @param campaignId - Campaign ID
   * @param productId - Product ID
   * @returns Whether the campaign applies to the product
   */
  async isCampaignApplicable(
    campaignId: string,
    productId: string,
  ): Promise<boolean> {
    const campaign = await this.campaignModel.findById(campaignId).lean();
    if (!campaign || !campaign.isActive) {
      return false;
    }

    // Check if campaign is within date range
    const now = new Date();
    if (campaign.startDate > now || campaign.endDate < now) {
      return false;
    }

    // If no specific products or categories, applies to all
    if (campaign.productIds.length === 0 && campaign.categoryIds.length === 0) {
      return true;
    }

    // Check if product is directly included
    if (campaign.productIds.some((id) => id.toString() === productId)) {
      return true;
    }

    // Check if product's category is included
    if (campaign.categoryIds.length > 0) {
      const product = await this.productModel.findById(productId).lean();
      if (
        product &&
        campaign.categoryIds.some(
          (id) => id.toString() === (product.category as any).toString(),
        )
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Format campaign for summary display
   */
  private formatCampaignSummary(campaign: any): CampaignSummary {
    const now = new Date();
    const endDate = new Date(campaign.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      _id: campaign._id.toString(),
      name: campaign.name,
      type: campaign.type,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      description: campaign.description,
      imageUrl: campaign.imageUrl,
      minOrderAmount: campaign.minOrderAmount,
      isActive: campaign.isActive,
      applicableItems: {
        allProducts: campaign.applicableItems?.allProducts || false,
        categories: campaign.applicableItems?.categories || [],
        products: campaign.applicableItems?.products || [],
      },
      seller: campaign.sellerId
        ? {
            _id: campaign.sellerId._id.toString(),
            name: `${campaign.sellerId.firstName} ${campaign.sellerId.lastName}`,
            storeName: campaign.sellerId.storeName,
          }
        : undefined,
      remainingDays: Math.max(0, remainingDays),
      isExpired: remainingDays <= 0,
    };
  }
}
