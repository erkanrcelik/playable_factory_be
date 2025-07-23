import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { Address, AddressDocument } from '../schemas/address.schema';
import { Wishlist, WishlistDocument } from '../schemas/wishlist.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  UpdateEmailDto,
} from './dto/update-profile.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

/**
 * Users Service
 *
 * Handles customer profile management, address management, and wishlist operations
 * for authenticated customers in the e-commerce platform
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // EXISTING METHODS (for auth and admin compatibility)
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(userId: string, updateData: Partial<User>) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // CUSTOMER PROFILE MANAGEMENT

  /**
   * Get customer profile information
   */
  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive fields from response
    const userObject = user.toObject();
    const { emailVerificationToken, passwordResetToken, ...userProfile } =
      userObject;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = { emailVerificationToken, passwordResetToken };
    return userProfile;
  }

  /**
   * Update customer profile
   */
  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields
    Object.assign(user, updateData);
    await user.save();

    // Return updated user without sensitive fields
    const userObject = user.toObject();
    const {
      password,
      emailVerificationToken,
      passwordResetToken,
      ...cleanProfile
    } = userObject;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = { password, emailVerificationToken, passwordResetToken };

    return cleanProfile;
  }

  /**
   * Change customer password
   *
   * @param userId - Customer user ID
   * @param changePasswordData - Password change data
   * @returns Success message
   */
  async changePassword(userId: string, changePasswordData: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordData.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(
      changePasswordData.newPassword,
      saltRounds,
    );

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    return {
      message: 'Password changed successfully',
    };
  }

  /**
   * Update customer email
   *
   * @param userId - Customer user ID
   * @param updateEmailData - Email update data
   * @returns Success message with verification requirement
   */
  async updateEmail(userId: string, updateEmailData: UpdateEmailDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      updateEmailData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Password is incorrect');
    }

    // Check if new email is already in use
    const existingUser = await this.userModel.findOne({
      email: updateEmailData.newEmail,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    // Update email and mark as unverified
    user.email = updateEmailData.newEmail;
    user.isEmailVerified = false;
    await user.save();

    return {
      message:
        'Email updated successfully. Please verify your new email address.',
      requiresVerification: true,
    };
  }

  // ADDRESS MANAGEMENT

  /**
   * Get all customer addresses
   *
   * @param userId - Customer user ID
   * @returns List of customer addresses
   */
  async getAddresses(userId: string) {
    const addresses = await this.addressModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return addresses;
  }

  /**
   * Create new address for customer
   *
   * @param userId - Customer user ID
   * @param addressData - Address creation data
   * @returns Created address
   */
  async createAddress(userId: string, addressData: CreateAddressDto) {
    // If this is the first address or set as default, make it default
    const existingAddressCount = await this.addressModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    const isDefault = existingAddressCount === 0 || addressData.isDefault;

    // If setting as default, unset other default addresses
    if (isDefault) {
      await this.addressModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        { isDefault: false },
      );
    }

    const address = new this.addressModel({
      ...addressData,
      userId: new Types.ObjectId(userId),
      isDefault,
    });

    const savedAddress = await address.save();
    return savedAddress.toObject();
  }

  /**
   * Update customer address
   *
   * @param userId - Customer user ID
   * @param addressId - Address ID to update
   * @param updateData - Address update data
   * @returns Updated address
   */
  async updateAddress(
    userId: string,
    addressId: string,
    updateData: UpdateAddressDto,
  ) {
    const address = await this.addressModel.findOne({
      _id: new Types.ObjectId(addressId),
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    Object.assign(address, updateData);
    await address.save();

    return address.toObject();
  }

  /**
   * Set address as default
   *
   * @param userId - Customer user ID
   * @param addressId - Address ID to set as default
   * @returns Updated address
   */
  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.addressModel.findOne({
      _id: new Types.ObjectId(addressId),
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Unset other default addresses
    await this.addressModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      { isDefault: false },
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    return address.toObject();
  }

  /**
   * Delete customer address
   *
   * @param userId - Customer user ID
   * @param addressId - Address ID to delete
   * @returns Success message
   */
  async deleteAddress(userId: string, addressId: string) {
    const address = await this.addressModel.findOne({
      _id: new Types.ObjectId(addressId),
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Soft delete
    address.isActive = false;
    await address.save();

    // If this was the default address, set another address as default
    if (address.isDefault) {
      const nextAddress = await this.addressModel.findOne({
        userId: new Types.ObjectId(userId),
        isActive: true,
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return {
      message: 'Address deleted successfully',
    };
  }

  // WISHLIST MANAGEMENT

  /**
   * Get customer wishlist
   *
   * @param userId - Customer user ID
   * @returns List of wishlist items with product details
   */
  async getWishlist(userId: string) {
    const wishlistItems = await this.wishlistModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .populate({
        path: 'productId',
        select: 'name price imageUrls isActive category',
        populate: {
          path: 'category',
          select: 'name',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out inactive products
    const activeWishlistItems = wishlistItems.filter(
      (item) => (item.productId as any)?.isActive,
    );

    return activeWishlistItems.map((item) => ({
      _id: item._id,
      productId: item.productId,
      notes: item.notes,
      addedAt: (item as any).createdAt,
    }));
  }

  /**
   * Add product to wishlist
   *
   * @param userId - Customer user ID
   * @param productId - Product ID to add
   * @param notes - Optional notes
   * @returns Added wishlist item
   */
  async addToWishlist(userId: string, productId: string, notes?: string) {
    // Check if product exists and is active
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      isActive: true,
    });

    if (!product) {
      throw new NotFoundException('Product not found or inactive');
    }

    // Check if already in wishlist
    const existingItem = await this.wishlistModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
      isActive: true,
    });

    if (existingItem) {
      throw new BadRequestException('Product is already in wishlist');
    }

    const wishlistItem = new this.wishlistModel({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
      notes,
    });

    const savedItem = await wishlistItem.save();

    await savedItem.populate({
      path: 'productId',
      select: 'name price imageUrls category',
      populate: {
        path: 'category',
        select: 'name',
      },
    });

    return {
      _id: savedItem._id,
      productId: savedItem.productId,
      notes: savedItem.notes,
      addedAt: (savedItem as any).createdAt,
    };
  }

  /**
   * Remove product from wishlist
   *
   * @param userId - Customer user ID
   * @param productId - Product ID to remove
   * @returns Success message
   */
  async removeFromWishlist(userId: string, productId: string) {
    const wishlistItem = await this.wishlistModel.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
      isActive: true,
    });

    if (!wishlistItem) {
      throw new NotFoundException('Product not found in wishlist');
    }

    // Soft delete
    wishlistItem.isActive = false;
    await wishlistItem.save();

    return {
      message: 'Product removed from wishlist',
    };
  }

  /**
   * Update wishlist item notes
   *
   * @param userId - Customer user ID
   * @param wishlistItemId - Wishlist item ID
   * @param notes - Updated notes
   * @returns Updated wishlist item
   */
  async updateWishlistNotes(
    userId: string,
    wishlistItemId: string,
    notes: string,
  ) {
    const wishlistItem = await this.wishlistModel.findOne({
      _id: new Types.ObjectId(wishlistItemId),
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!wishlistItem) {
      throw new NotFoundException('Wishlist item not found');
    }

    wishlistItem.notes = notes;
    await wishlistItem.save();

    return {
      message: 'Wishlist notes updated successfully',
      notes,
    };
  }
}
