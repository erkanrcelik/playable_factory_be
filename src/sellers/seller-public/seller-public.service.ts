import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SellerProfile,
  SellerProfileDocument,
} from '../../schemas/seller-profile.schema';
import { User, UserDocument } from '../../schemas/user.schema';

/**
 * Service for public seller operations
 * Provides methods to retrieve seller information publicly
 */
@Injectable()
export class SellerPublicService {
  constructor(
    @InjectModel(SellerProfile.name)
    private sellerProfileModel: Model<SellerProfileDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  /**
   * Get seller information by ID
   * @param sellerId - Seller's MongoDB ObjectId
   * @returns Seller information with user details
   * @throws NotFoundException if seller not found
   */
  async getSellerById(sellerId: string) {
    const objectId = new Types.ObjectId(sellerId);

    // Find seller profile
    const sellerProfile = await this.sellerProfileModel
      .findOne({ sellerId: objectId, isActive: true })
      .exec();

    if (!sellerProfile) {
      throw new NotFoundException('Seller not found');
    }

    // Get user information
    const user = await this.userModel
      .findById(objectId)
      .select('firstName lastName email phoneNumber')
      .exec();

    if (!user) {
      throw new NotFoundException('Seller user information not found');
    }

    // Public olarak döndürülecek bilgileri birleştir
    return {
      id: sellerProfile.sellerId,
      storeName: sellerProfile.storeName,
      description: sellerProfile.description,
      logoUrl: sellerProfile.logoUrl,
      phoneNumber: sellerProfile.phoneNumber || user.phoneNumber,
      website: sellerProfile.website,
      address: sellerProfile.address,
      businessHours: sellerProfile.businessHours,
      socialMedia: sellerProfile.socialMedia,
      sellerName: `${user.firstName} ${user.lastName}`,
      email: user.email,
    };
  }

  /**
   * Get all active sellers with pagination and search
   * @param options - Pagination and search options
   * @param options.page - Page number (default: 1)
   * @param options.limit - Items per page (default: 10)
   * @param options.search - Search term for store name or description
   * @returns Paginated list of sellers with user information
   */
  async getAllSellers(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 10, search } = options;

    // Build query
    const query: any = { isActive: true };

    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Find seller profiles
    const sellerProfiles = await this.sellerProfileModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .exec();

    // Get user information
    const sellerIds = sellerProfiles.map((profile) => profile.sellerId);
    const users = await this.userModel
      .find({ _id: { $in: sellerIds } })
      .select('firstName lastName email phoneNumber')
      .exec();

    // Map user information
    const userMap = new Map();
    users.forEach((user) => {
      userMap.set((user as any)._id.toString(), user);
    });

    // Combine results
    const sellers = sellerProfiles.map((profile) => {
      const user = userMap.get(profile.sellerId.toString());
      return {
        id: profile.sellerId,
        storeName: profile.storeName,
        description: profile.description,
        logoUrl: profile.logoUrl,
        phoneNumber: profile.phoneNumber || user?.phoneNumber,
        website: profile.website,
        address: profile.address,
        businessHours: profile.businessHours,
        socialMedia: profile.socialMedia,
        sellerName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        email: user?.email || 'Unknown',
      };
    });

    // Get total count
    const total = await this.sellerProfileModel.countDocuments(query);

    return {
      data: sellers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
