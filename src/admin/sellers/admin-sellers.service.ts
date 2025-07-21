import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../../schemas/user.schema';
import {
  SellerProfile,
  SellerProfileDocument,
} from '../../schemas/seller-profile.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { SellerError, SellerErrorMessages } from './enums/seller-error.enum';

export interface FindAllSellersOptions {
  page: number;
  limit: number;
  search?: string;
  isApproved?: boolean;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SellerWithProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    _id: string;
    storeName: string;
    description?: string;
    isActive: boolean;
    logoUrl?: string;
    phoneNumber?: string;
    website?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    businessHours?: {
      monday?: { open?: string; close?: string; closed: boolean };
      tuesday?: { open?: string; close?: string; closed: boolean };
      wednesday?: { open?: string; close?: string; closed: boolean };
      thursday?: { open?: string; close?: string; closed: boolean };
      friday?: { open?: string; close?: string; closed: boolean };
      saturday?: { open?: string; close?: string; closed: boolean };
      sunday?: { open?: string; close?: string; closed: boolean };
    };
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export interface SellerStats {
  total: number;
  approved: number;
  pending: number;
  active: number;
  inactive: number;
}

@Injectable()
export class AdminSellersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(SellerProfile.name)
    private sellerProfileModel: Model<SellerProfileDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAllSellers(
    options: FindAllSellersOptions,
  ): Promise<PaginatedResponse<SellerWithProfile>> {
    const { page, limit, search, isApproved, isActive } = options;
    const skip = (page - 1) * limit;

    // Create filter for sellers only
    const userFilter: Record<string, unknown> = {
      role: UserRole.SELLER,
    };

    if (search) {
      userFilter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      userFilter.isActive = isActive;
    }

    // Get total count
    const total = await this.userModel.countDocuments(userFilter);

    // Get sellers with profiles
    const sellers = await this.userModel
      .find(userFilter)
      .select(
        '-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires',
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get profiles for these sellers
    const sellerIds = sellers.map((seller) => (seller._id as any).toString());
    const profiles = await this.sellerProfileModel
      .find({ userId: { $in: sellerIds } })
      .exec();

    // Create a map for quick lookup
    const profileMap = new Map();
    profiles.forEach((profile) => {
      profileMap.set((profile.sellerId as any).toString(), profile);
    });

    // Combine sellers with their profiles
    const data: SellerWithProfile[] = sellers
      .map((seller) => {
        const profile = profileMap.get((seller._id as any).toString());

        // Apply approval filter if specified
        if (
          isApproved !== undefined &&
          profile &&
          profile.isApproved !== isApproved
        ) {
          return null;
        }

        return {
          _id: (seller._id as any).toString(),
          email: seller.email,
          firstName: seller.firstName,
          lastName: seller.lastName,
          phoneNumber: seller.phoneNumber,
          role: seller.role,
          isActive: seller.isActive,
          isEmailVerified: seller.isEmailVerified,
          createdAt: (seller as any).createdAt,
          updatedAt: (seller as any).updatedAt,
          profile: profile
            ? {
                _id: profile._id.toString(),
                storeName: profile.storeName,
                storeDescription: profile.storeDescription,
                isApproved: profile.isApproved,
                logo: profile.logo,
                banner: profile.banner,
                businessCategories: profile.businessCategories,
                contactEmail: profile.contactEmail,
                contactPhone: profile.contactPhone,
                website: profile.website,
                socialMedia: profile.socialMedia,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
              }
            : null,
        };
      })
      .filter((seller) => seller !== null) as SellerWithProfile[];

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findSellerById(id: string): Promise<SellerWithProfile> {
    const seller = await this.userModel
      .findOne({ _id: id, role: UserRole.SELLER })
      .select(
        '-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires',
      )
      .exec();

    if (!seller) {
      throw new NotFoundException(
        SellerErrorMessages[SellerError.SELLER_NOT_FOUND],
      );
    }

    const profile = await this.sellerProfileModel
      .findOne({ userId: seller._id })
      .exec();

    return {
      _id: (seller._id as any).toString(),
      email: seller.email,
      firstName: seller.firstName,
      lastName: seller.lastName,
      phoneNumber: seller.phoneNumber,
      role: seller.role,
      isActive: seller.isActive,
      isEmailVerified: seller.isEmailVerified,
      createdAt: (seller as any).createdAt,
      updatedAt: (seller as any).updatedAt,
      profile: profile
        ? {
            _id: (profile._id as any).toString(),
            storeName: profile.storeName,
            description: profile.description,
            isActive: profile.isActive,
            logoUrl: profile.logoUrl,
            phoneNumber: profile.phoneNumber,
            website: profile.website,
            address: profile.address,
            businessHours: profile.businessHours,
            socialMedia: profile.socialMedia,
            createdAt: (profile as any).createdAt,
            updatedAt: (profile as any).updatedAt,
          }
        : null,
    };
  }

  async approveSeller(id: string): Promise<SellerWithProfile> {
    const seller = await this.userModel.findOne({
      _id: id,
      role: UserRole.SELLER,
    });

    if (!seller) {
      throw new NotFoundException(
        SellerErrorMessages[SellerError.SELLER_NOT_FOUND],
      );
    }

    const profile = await this.sellerProfileModel.findOne({
      userId: seller._id,
    });
    if (!profile) {
      throw new NotFoundException(
        SellerErrorMessages[SellerError.SELLER_PROFILE_NOT_FOUND],
      );
    }

    profile.isActive = true;
    await profile.save();

    return this.findSellerById(id);
  }

  async rejectSeller(id: string): Promise<SellerWithProfile> {
    const seller = await this.userModel.findOne({
      _id: id,
      role: UserRole.SELLER,
    });

    if (!seller) {
      throw new NotFoundException(
        SellerErrorMessages[SellerError.SELLER_NOT_FOUND],
      );
    }

    const profile = await this.sellerProfileModel.findOne({
      userId: seller._id,
    });
    if (!profile) {
      throw new NotFoundException(
        SellerErrorMessages[SellerError.SELLER_PROFILE_NOT_FOUND],
      );
    }

    profile.isActive = false;
    await profile.save();

    return this.findSellerById(id);
  }

  async deleteSeller(id: string): Promise<{ message: string }> {
    const seller = await this.userModel.findOne({
      _id: id,
      role: UserRole.SELLER,
    });

    if (!seller) {
      throw new NotFoundException(
        SellerErrorMessages[SellerError.SELLER_NOT_FOUND],
      );
    }

    // Check if seller has products
    const productsCount = await this.productModel.countDocuments({
      sellerId: id,
    });
    if (productsCount > 0) {
      throw new BadRequestException(
        SellerErrorMessages[SellerError.SELLER_HAS_PRODUCTS],
      );
    }

    // Delete seller profile first
    await this.sellerProfileModel.findOneAndDelete({ userId: seller._id });

    // Delete seller account
    await this.userModel.findByIdAndDelete(id);

    return {
      message: SellerErrorMessages[SellerError.SELLER_DELETED_SUCCESS],
    };
  }

  async toggleSellerStatus(id: string): Promise<SellerWithProfile> {
    const seller = await this.userModel.findOne({
      _id: id,
      role: UserRole.SELLER,
    });

    if (!seller) {
      throw new NotFoundException(
        SellerErrorMessages[SellerError.SELLER_NOT_FOUND],
      );
    }

    seller.isActive = !seller.isActive;
    await seller.save();

    return this.findSellerById(id);
  }

  async getSellerStats(): Promise<SellerStats> {
    const [total, active] = await Promise.all([
      this.userModel.countDocuments({ role: UserRole.SELLER }),
      this.userModel.countDocuments({ role: UserRole.SELLER, isActive: true }),
    ]);

    const [approved, pending] = await Promise.all([
      this.sellerProfileModel.countDocuments({ isApproved: true }),
      this.sellerProfileModel.countDocuments({ isApproved: false }),
    ]);

    return {
      total,
      approved,
      pending,
      active,
      inactive: total - active,
    };
  }
}
