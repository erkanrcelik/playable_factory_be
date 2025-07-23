import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  SellerProfile,
  SellerProfileDocument,
} from '../../schemas/seller-profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileError, ProfileErrorMessages } from './enums/profile-error.enum';
import { MinioService } from '../../minio/minio.service';

@Injectable()
export class SellerProfileService {
  constructor(
    @InjectModel(SellerProfile.name)
    private sellerProfileModel: Model<SellerProfileDocument>,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get seller profile
   */
  async getProfile(sellerId: string) {
    const profile = await this.sellerProfileModel
      .findOne({ sellerId: new Types.ObjectId(sellerId) })
      .lean();

    if (!profile) {
      // Create default profile if not exists
      const defaultProfile = new this.sellerProfileModel({
        sellerId: new Types.ObjectId(sellerId),
        storeName: '',
        description: '',
        isActive: true,
      });
      return defaultProfile.save();
    }

    return profile;
  }

  /**
   * Update seller profile
   */
  async updateProfile(sellerId: string, updateDto: UpdateProfileDto) {
    const profile = await this.sellerProfileModel.findOne({
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!profile) {
      // Create new profile if not exists
      const newProfile = new this.sellerProfileModel({
        sellerId: new Types.ObjectId(sellerId),
        ...updateDto,
        isActive: true,
      });
      return newProfile.save();
    }

    // Update existing profile
    const updatedProfile = await this.sellerProfileModel.findByIdAndUpdate(
      profile._id,
      { ...updateDto, updatedAt: new Date() },
      { new: true },
    );

    return updatedProfile;
  }

  /**
   * Upload seller logo
   */
  async uploadLogo(sellerId: string, file: Express.Multer.File) {
    // File type validation
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        ProfileErrorMessages[ProfileError.INVALID_IMAGE_FORMAT],
      );
    }

    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException(
        ProfileErrorMessages[ProfileError.IMAGE_TOO_LARGE],
      );
    }

    try {
      const bucketName =
        this.configService.get<string>('MINIO_BUCKET_NAME') || 'ekotest';
      const uploadResult = await this.minioService.uploadFile(file, bucketName);

      // Update profile with logo URL
      const profile = await this.sellerProfileModel.findOne({
        sellerId: new Types.ObjectId(sellerId),
      });

      if (!profile) {
        // Create new profile if not exists
        const newProfile = new this.sellerProfileModel({
          sellerId: new Types.ObjectId(sellerId),
          logoUrl: uploadResult,
          isActive: true,
        });
        await newProfile.save();
      } else {
        // Delete old logo if exists
        if (profile.logoUrl) {
          try {
            const bucketName =
              this.configService.get<string>('MINIO_BUCKET_NAME') || 'ekotest';
            await this.minioService.deleteFile(
              bucketName,
              profile.logoUrl.split('/').pop() || '',
            );
          } catch (error) {
            // Log error but don't throw - file might already be deleted
            console.warn('Failed to delete old logo:', error);
          }
        }

        // Update profile with new logo
        profile.logoUrl = uploadResult;
        await profile.save();
      }

      return {
        logoUrl: uploadResult,
        logoKey: uploadResult.split('/').pop() || '',
        message: 'Logo uploaded successfully',
      };
    } catch {
      throw new BadRequestException(
        ProfileErrorMessages[ProfileError.UPLOAD_FAILED],
      );
    }
  }

  /**
   * Delete seller logo
   */
  async deleteLogo(sellerId: string) {
    const profile = await this.sellerProfileModel.findOne({
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!profile) {
      throw new NotFoundException(
        ProfileErrorMessages[ProfileError.PROFILE_NOT_FOUND],
      );
    }

    if (!profile.logoUrl) {
      throw new BadRequestException('No logo to delete');
    }

    try {
      // Delete from MinIO
      const bucketName =
        this.configService.get<string>('MINIO_BUCKET_NAME') || 'ekotest';
      await this.minioService.deleteFile(
        bucketName,
        profile.logoUrl.split('/').pop() || '',
      );

      // Update profile
      profile.logoUrl = undefined;
      await profile.save();

      return { message: 'Logo deleted successfully' };
    } catch {
      throw new BadRequestException('Logo deletion failed');
    }
  }

  /**
   * Toggle profile active status
   */
  async toggleActiveStatus(sellerId: string) {
    const profile = await this.sellerProfileModel.findOne({
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!profile) {
      throw new NotFoundException(
        ProfileErrorMessages[ProfileError.PROFILE_NOT_FOUND],
      );
    }

    profile.isActive = !profile.isActive;
    await profile.save();

    return profile;
  }

  /**
   * Get public profile for customers
   */
  async getPublicProfile(sellerId: string) {
    const profile = await this.sellerProfileModel
      .findOne({
        sellerId: new Types.ObjectId(sellerId),
        isActive: true,
      })
      .select('-__v -createdAt -updatedAt')
      .lean();

    if (!profile) {
      throw new NotFoundException(
        ProfileErrorMessages[ProfileError.PROFILE_NOT_FOUND],
      );
    }

    return profile;
  }
}
