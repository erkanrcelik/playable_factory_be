import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Campaign,
  CampaignDocument,
  CampaignType,
} from '../../schemas/campaign.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { FindAllCampaignsDto } from './dto/find-all-campaigns.dto';
import {
  CampaignError,
  CampaignErrorMessages,
} from './enums/campaign-error.enum';
import { MinioService } from '../../minio/minio.service';

@Injectable()
export class SellerCampaignsService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly minioService: MinioService,
  ) {}

  /**
   * Get all campaigns for seller
   */
  async findAllCampaigns(sellerId: string, options: FindAllCampaignsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      discountType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const query: any = {
      sellerId: new Types.ObjectId(sellerId),
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (discountType) {
      query.discountType = discountType;
    }

    if (status) {
      const now = new Date();
      switch (status) {
        case 'active':
          query.startDate = { $lte: now };
          query.endDate = { $gte: now };
          query.isActive = true;
          break;
        case 'inactive':
          query.isActive = false;
          break;
        case 'expired':
          query.endDate = { $lt: now };
          break;
        case 'upcoming':
          query.startDate = { $gt: now };
          break;
      }
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      this.campaignModel
        .find(query)
        .populate('productIds', 'name price imageUrls')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.campaignModel.countDocuments(query),
    ]);

    return {
      data: campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get campaign by ID for seller
   */
  async findOneCampaign(campaignId: string, sellerId: string) {
    const campaign = await this.campaignModel
      .findOne({
        _id: new Types.ObjectId(campaignId),
        sellerId: new Types.ObjectId(sellerId),
      })
      .populate('productIds', 'name price imageUrls description')
      .lean();

    if (!campaign) {
      throw new NotFoundException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_NOT_FOUND],
      );
    }

    return campaign;
  }

  /**
   * Create new campaign
   */
  async createCampaign(sellerId: string, createDto: CreateCampaignDto) {
    // Validate dates
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);
    const now = new Date();

    if (startDate <= now) {
      throw new BadRequestException(
        CampaignErrorMessages[CampaignError.INVALID_START_DATE],
      );
    }

    if (endDate <= startDate) {
      throw new BadRequestException(
        CampaignErrorMessages[CampaignError.END_DATE_BEFORE_START],
      );
    }

    // Validate discount value
    if (
      createDto.discountType === 'percentage' &&
      (createDto.discountValue < 1 || createDto.discountValue > 100)
    ) {
      throw new BadRequestException(
        CampaignErrorMessages[CampaignError.INVALID_DISCOUNT_PERCENTAGE],
      );
    }

    if (createDto.discountType === 'amount' && createDto.discountValue <= 0) {
      throw new BadRequestException(
        CampaignErrorMessages[CampaignError.INVALID_DISCOUNT_AMOUNT],
      );
    }

    // Check if campaign name already exists for this seller
    const existingCampaign = await this.campaignModel.findOne({
      sellerId: new Types.ObjectId(sellerId),
      name: createDto.name,
    });

    if (existingCampaign) {
      throw new BadRequestException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_ALREADY_EXISTS],
      );
    }

    let productIds: Types.ObjectId[] = [];

    // If productIds is provided, validate that all products belong to the seller
    if (createDto.productIds && createDto.productIds.length > 0) {
      const sellerProducts = await this.productModel.find({
        _id: { $in: createDto.productIds.map((id) => new Types.ObjectId(id)) },
        sellerId: new Types.ObjectId(sellerId),
      });

      if (sellerProducts.length !== createDto.productIds.length) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.PRODUCT_NOT_OWNED],
        );
      }

      productIds = createDto.productIds.map((id) => new Types.ObjectId(id));
    } else {
      // If no productIds provided, get all seller's products
      const allSellerProducts = await this.productModel.find({
        sellerId: new Types.ObjectId(sellerId),
        isActive: true, // Only active products
      });

      if (allSellerProducts.length === 0) {
        throw new BadRequestException(
          'No active products found. Please add products before creating a campaign.',
        );
      }

      productIds = allSellerProducts.map(
        (product) => product._id as Types.ObjectId,
      );
    }

    const campaign = new this.campaignModel({
      ...createDto,
      type: CampaignType.SELLER,
      sellerId: new Types.ObjectId(sellerId),
      productIds: productIds,
    });

    const savedCampaign = await campaign.save();
    return savedCampaign.populate('productIds', 'name price imageUrls');
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    campaignId: string,
    sellerId: string,
    updateDto: UpdateCampaignDto,
  ) {
    const campaign = await this.campaignModel.findOne({
      _id: new Types.ObjectId(campaignId),
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!campaign) {
      throw new NotFoundException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_NOT_FOUND],
      );
    }

    // Validate dates if provided
    if (updateDto.startDate || updateDto.endDate) {
      const startDate = updateDto.startDate
        ? new Date(updateDto.startDate)
        : campaign.startDate;
      const endDate = updateDto.endDate
        ? new Date(updateDto.endDate)
        : campaign.endDate;
      const now = new Date();

      if (startDate <= now) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.INVALID_START_DATE],
        );
      }

      if (endDate <= startDate) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.END_DATE_BEFORE_START],
        );
      }
    }

    // Validate discount value if provided
    if (updateDto.discountValue !== undefined) {
      const discountType = updateDto.discountType || campaign.discountType;

      if (
        discountType === 'percentage' &&
        (updateDto.discountValue < 1 || updateDto.discountValue > 100)
      ) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.INVALID_DISCOUNT_PERCENTAGE],
        );
      }

      if (discountType === 'amount' && updateDto.discountValue <= 0) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.INVALID_DISCOUNT_AMOUNT],
        );
      }
    }

    // Validate products if provided
    if (updateDto.productIds !== undefined) {
      if (updateDto.productIds && updateDto.productIds.length > 0) {
        // Validate that all products belong to the seller
        const sellerProducts = await this.productModel.find({
          _id: {
            $in: updateDto.productIds.map((id) => new Types.ObjectId(id)),
          },
          sellerId: new Types.ObjectId(sellerId),
        });

        if (sellerProducts.length !== updateDto.productIds.length) {
          throw new BadRequestException(
            CampaignErrorMessages[CampaignError.PRODUCT_NOT_OWNED],
          );
        }
      } else {
        // If empty array provided, get all seller's products
        const allSellerProducts = await this.productModel.find({
          sellerId: new Types.ObjectId(sellerId),
          isActive: true, // Only active products
        });

        if (allSellerProducts.length === 0) {
          throw new BadRequestException(
            'No active products found. Please add products before updating the campaign.',
          );
        }

        updateDto.productIds = allSellerProducts.map((product) =>
          (product._id as Types.ObjectId).toString(),
        );
      }
    }

    // Check name uniqueness if provided
    if (updateDto.name && updateDto.name !== campaign.name) {
      const existingCampaign = await this.campaignModel.findOne({
        sellerId: new Types.ObjectId(sellerId),
        name: updateDto.name,
        _id: { $ne: new Types.ObjectId(campaignId) },
      });

      if (existingCampaign) {
        throw new BadRequestException(
          CampaignErrorMessages[CampaignError.CAMPAIGN_ALREADY_EXISTS],
        );
      }
    }

    const updateData: any = { ...updateDto };
    if (updateDto.productIds) {
      updateData.productIds = updateDto.productIds.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const updatedCampaign = await this.campaignModel
      .findByIdAndUpdate(campaignId, updateData, { new: true })
      .populate('productIds', 'name price imageUrls');

    return updatedCampaign;
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string, sellerId: string) {
    const campaign = await this.campaignModel.findOne({
      _id: new Types.ObjectId(campaignId),
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!campaign) {
      throw new NotFoundException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_NOT_FOUND],
      );
    }

    // Check if campaign is active and not expired
    const now = new Date();
    if (
      campaign.isActive &&
      campaign.startDate <= now &&
      campaign.endDate >= now
    ) {
      throw new BadRequestException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_ACTIVE],
      );
    }

    // Delete campaign image if exists
    if (campaign.imageUrl) {
      try {
        await this.minioService.deleteFile(
          'ecommerce',
          campaign.imageUrl.split('/').pop() || '',
        );
      } catch (error) {
        // Log error but don't throw - file might already be deleted
        console.warn('Failed to delete old campaign image:', error);
      }
    }

    await this.campaignModel.findByIdAndDelete(campaignId);

    return { message: 'Campaign deleted successfully' };
  }

  /**
   * Upload campaign image
   */
  async uploadCampaignImage(
    campaignId: string,
    sellerId: string,
    file: Express.Multer.File,
  ) {
    const campaign = await this.campaignModel.findOne({
      _id: new Types.ObjectId(campaignId),
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!campaign) {
      throw new NotFoundException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_NOT_FOUND],
      );
    }

    // File type validation
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        CampaignErrorMessages[CampaignError.INVALID_IMAGE_FORMAT],
      );
    }

    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException(
        CampaignErrorMessages[CampaignError.IMAGE_TOO_LARGE],
      );
    }

    try {
      const uploadResult = await this.minioService.uploadFile(
        file,
        `seller-campaigns/${sellerId}/${campaignId}`,
      );

      // Delete old image if exists
      if (campaign.imageUrl) {
        try {
          await this.minioService.deleteFile(
            'ecommerce',
            campaign.imageUrl.split('/').pop() || '',
          );
        } catch (error) {
          // Log error but don't throw - file might already be deleted
          console.warn('Failed to delete old campaign image:', error);
        }
      }

      // Update campaign with new image
      campaign.imageUrl = uploadResult;
      await campaign.save();

      return {
        imageUrl: uploadResult,
        imageKey: uploadResult.split('/').pop() || '',
        message: 'Campaign image uploaded successfully',
      };
    } catch {
      throw new BadRequestException(
        CampaignErrorMessages[CampaignError.UPLOAD_FAILED],
      );
    }
  }

  /**
   * Toggle campaign active status
   */
  async toggleCampaignStatus(campaignId: string, sellerId: string) {
    const campaign = await this.campaignModel.findOne({
      _id: new Types.ObjectId(campaignId),
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!campaign) {
      throw new NotFoundException(
        CampaignErrorMessages[CampaignError.CAMPAIGN_NOT_FOUND],
      );
    }

    campaign.isActive = !campaign.isActive;
    await campaign.save();

    return campaign;
  }

  /**
   * Get campaign statistics for seller
   */
  async getCampaignStats(sellerId: string) {
    const now = new Date();

    const [
      totalCampaigns,
      activeCampaigns,
      inactiveCampaigns,
      expiredCampaigns,
      upcomingCampaigns,
    ] = await Promise.all([
      this.campaignModel.countDocuments({
        sellerId: new Types.ObjectId(sellerId),
      }),
      this.campaignModel.countDocuments({
        sellerId: new Types.ObjectId(sellerId),
        startDate: { $lte: now },
        endDate: { $gte: now },
        isActive: true,
      }),
      this.campaignModel.countDocuments({
        sellerId: new Types.ObjectId(sellerId),
        isActive: false,
      }),
      this.campaignModel.countDocuments({
        sellerId: new Types.ObjectId(sellerId),
        endDate: { $lt: now },
      }),
      this.campaignModel.countDocuments({
        sellerId: new Types.ObjectId(sellerId),
        startDate: { $gt: now },
      }),
    ]);

    return {
      totalCampaigns,
      activeCampaigns,
      inactiveCampaigns,
      expiredCampaigns,
      upcomingCampaigns,
    };
  }
}
