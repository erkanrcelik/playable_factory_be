import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Campaign,
  CampaignDocument,
  CampaignType,
  DiscountType,
} from '../../schemas/campaign.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import {
  CampaignError,
  CampaignErrorMessages,
} from './enums/campaign-error.enum';
import { CreatePlatformCampaignDto, UpdatePlatformCampaignDto } from './dto';

export interface FindAllCampaignsOptions {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  type?: CampaignType;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CampaignWithDetails {
  _id: string;
  name: string;
  description?: string;
  type: CampaignType;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  products: {
    _id: string;
    name: string;
    price: number;
    sellerName: string;
  }[];
  categories: {
    _id: string;
    name: string;
    description?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignStats {
  total: number;
  active: number;
  inactive: number;
  platform: number;
  seller: number;
  current: number;
  upcoming: number;
  expired: number;
}

@Injectable()
export class AdminCampaignsService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async createPlatformCampaign(
    createDto: CreatePlatformCampaignDto,
  ): Promise<CampaignWithDetails> {
    // Validate dates
    if (new Date(createDto.startDate) >= new Date(createDto.endDate)) {
      throw new BadRequestException(
        CampaignErrorMessages[CampaignError.INVALID_DATE_RANGE],
      );
    }

    // Validate discount value
    if (
      createDto.discountType === DiscountType.PERCENTAGE &&
      createDto.discountValue > 100
    ) {
      throw new BadRequestException(
        CampaignErrorMessages[CampaignError.INVALID_DISCOUNT_VALUE],
      );
    }

    // Validate products and categories exist
    if (createDto.productIds && createDto.productIds.length > 0) {
      const productsCount = await this.productModel.countDocuments({
        _id: { $in: createDto.productIds },
      });
      if (productsCount !== createDto.productIds.length) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.INVALID_PRODUCTS],
        );
      }
    }

    if (createDto.categoryIds && createDto.categoryIds.length > 0) {
      const categoriesCount = await this.categoryModel.countDocuments({
        _id: { $in: createDto.categoryIds },
      });
      if (categoriesCount !== createDto.categoryIds.length) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.INVALID_CATEGORIES],
        );
      }
    }

    const campaign = new this.campaignModel({
      ...createDto,
      type: CampaignType.PLATFORM,
      products: createDto.productIds || [],
      categories: createDto.categoryIds || [],
    });

    const savedCampaign = await campaign.save();
    return this.findCampaignById((savedCampaign._id as any).toString());
  }

  async findAllCampaigns(
    options: FindAllCampaignsOptions,
  ): Promise<PaginatedResponse<CampaignWithDetails>> {
    const { page, limit, search, isActive, type } = options;
    const skip = (page - 1) * limit;

    // Create filter
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (type) {
      filter.type = type;
    }

    // Get total count
    const total = await this.campaignModel.countDocuments(filter);

    // Get campaigns
    const campaigns = await this.campaignModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get detailed information for each campaign
    const data: CampaignWithDetails[] = await Promise.all(
      campaigns.map(async (campaign) => {
        const products = await this.productModel
          .find({ _id: { $in: campaign.productIds } })
          .populate('sellerId', 'firstName lastName')
          .exec();

        const categories = await this.categoryModel
          .find({ _id: { $in: campaign.categoryIds } })
          .exec();

        return {
          _id: (campaign._id as any).toString(),
          name: campaign.name,
          description: campaign.description,
          type: campaign.type,
          discountType: campaign.discountType,
          discountValue: campaign.discountValue,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          isActive: campaign.isActive,
          products: products.map((product) => ({
            _id: (product._id as any).toString(),
            name: product.name,
            price: product.price,
            sellerName: product.sellerId
              ? `${(product.sellerId as any).firstName} ${(product.sellerId as any).lastName}`
              : 'Unknown Seller',
          })),
          categories: categories.map((category) => ({
            _id: (category._id as any).toString(),
            name: category.name,
            description: category.description,
          })),
          createdAt: (campaign as any).createdAt,
          updatedAt: (campaign as any).updatedAt,
        };
      }),
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findCampaignById(id: string): Promise<CampaignWithDetails> {
    const campaign = await this.campaignModel.findById(id).exec();

    if (!campaign) {
      throw new NotFoundException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_NOT_FOUND],
      );
    }

    const products = await this.productModel
              .find({ _id: { $in: campaign.productIds } })
      .populate('sellerId', 'firstName lastName')
      .exec();

    const categories = await this.categoryModel
              .find({ _id: { $in: campaign.categoryIds } })
      .exec();

    return {
      _id: (campaign._id as any).toString(),
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      isActive: campaign.isActive,
      products: products.map((product) => ({
        _id: (product._id as any).toString(),
        name: product.name,
        price: product.price,
        sellerName: product.sellerId
          ? `${(product.sellerId as any).firstName} ${(product.sellerId as any).lastName}`
          : 'Unknown Seller',
      })),
      categories: categories.map((category) => ({
        _id: (category._id as any).toString(),
        name: category.name,
        description: category.description,
      })),
      createdAt: (campaign as any).createdAt,
      updatedAt: (campaign as any).updatedAt,
    };
  }

  async updateCampaign(
    id: string,
    updateDto: UpdatePlatformCampaignDto,
  ): Promise<CampaignWithDetails> {
    const campaign = await this.campaignModel.findById(id).exec();

    if (!campaign) {
      throw new NotFoundException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_NOT_FOUND],
      );
    }

    // Validate dates if provided
    if (updateDto.startDate && updateDto.endDate) {
      if (new Date(updateDto.startDate) >= new Date(updateDto.endDate)) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.INVALID_DATE_RANGE],
        );
      }
    }

    // Validate discount value if provided
    if (updateDto.discountType && updateDto.discountValue) {
      if (
        updateDto.discountType === DiscountType.PERCENTAGE &&
        updateDto.discountValue > 100
      ) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.INVALID_DISCOUNT_VALUE],
        );
      }
    }

    // Validate products if provided
    if (updateDto.productIds) {
      const productsCount = await this.productModel.countDocuments({
        _id: { $in: updateDto.productIds },
      });
      if (productsCount !== updateDto.productIds.length) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.INVALID_PRODUCTS],
        );
      }
    }

    // Validate categories if provided
    if (updateDto.categoryIds) {
      const categoriesCount = await this.categoryModel.countDocuments({
        _id: { $in: updateDto.categoryIds },
      });
      if (categoriesCount !== updateDto.categoryIds.length) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.INVALID_CATEGORIES],
        );
      }
    }

    // Update campaign
    const updatedCampaign = await this.campaignModel
      .findByIdAndUpdate(
        id,
        {
          ...updateDto,
          productIds: updateDto.productIds || campaign.productIds,
          categoryIds: updateDto.categoryIds || campaign.categoryIds,
        },
        { new: true },
      )
      .exec();

    if (!updatedCampaign) {
      throw new NotFoundException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_NOT_FOUND],
      );
    }
    return this.findCampaignById((updatedCampaign._id as any).toString());
  }

  async deleteCampaign(id: string): Promise<{ message: string }> {
    const campaign = await this.campaignModel.findById(id).exec();

    if (!campaign) {
      throw new NotFoundException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_NOT_FOUND],
      );
    }

    await this.campaignModel.findByIdAndDelete(id).exec();

    return {
      message: CampaignErrorMessages[CampaignError.CAMPAIGN_DELETED_SUCCESS],
    };
  }

  async toggleCampaignStatus(id: string): Promise<CampaignWithDetails> {
    const campaign = await this.campaignModel.findById(id).exec();

    if (!campaign) {
      throw new NotFoundException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_NOT_FOUND],
      );
    }

    campaign.isActive = !campaign.isActive;
    await campaign.save();

    return this.findCampaignById(id);
  }

  async getCampaignStats(): Promise<CampaignStats> {
    const now = new Date();

    const [total, active, platform, seller] = await Promise.all([
      this.campaignModel.countDocuments(),
      this.campaignModel.countDocuments({ isActive: true }),
      this.campaignModel.countDocuments({ type: CampaignType.PLATFORM }),
      this.campaignModel.countDocuments({ type: CampaignType.SELLER }),
    ]);

    const [current, upcoming, expired] = await Promise.all([
      this.campaignModel.countDocuments({
        startDate: { $lte: now },
        endDate: { $gte: now },
      }),
      this.campaignModel.countDocuments({
        startDate: { $gt: now },
      }),
      this.campaignModel.countDocuments({
        endDate: { $lt: now },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      platform,
      seller,
      current,
      upcoming,
      expired,
    };
  }
}
