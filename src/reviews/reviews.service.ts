import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FindAllReviewsDto } from './dto/find-all-reviews.dto';
import { ReviewError, ReviewErrorMessages } from './enums/review-error.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Get customer's own reviews
   */
  async getCustomerReviews(userId: string, options: FindAllReviewsDto) {
    const {
      page = 1,
      limit = 10,
      rating,
      isApproved,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const query: any = {
      userId: new Types.ObjectId(userId),
    };

    if (rating) {
      query.rating = rating;
    }

    if (isApproved !== undefined) {
      query.isApproved = isApproved;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(query)
        .populate('productId', 'name imageUrls')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.reviewModel.countDocuments(query),
    ]);

    return {
      data: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all reviews with filtering and pagination
   */
  async findAllReviews(options: FindAllReviewsDto) {
    const {
      page = 1,
      limit = 10,
      productId,
      rating,
      isApproved,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const query: any = {};

    if (productId) {
      query.productId = new Types.ObjectId(productId);
    }

    if (rating) {
      query.rating = rating;
    }

    if (isApproved !== undefined) {
      query.isApproved = isApproved;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(query)
        .populate('productId', 'name imageUrls')
        .populate('userId', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.reviewModel.countDocuments(query),
    ]);

    return {
      data: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get reviews for a specific product
   */
  async getProductReviews(productId: string, options: FindAllReviewsDto) {
    // Validate product exists
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException(
        ReviewErrorMessages[ReviewError.PRODUCT_NOT_FOUND],
      );
    }

    const queryOptions = {
      ...options,
      productId,
      isApproved: true, // Only show approved reviews for public
    };

    return this.findAllReviews(queryOptions);
  }

  /**
   * Get review by ID
   */
  async findOneReview(reviewId: string) {
    const review = await this.reviewModel
      .findById(reviewId)
      .populate('productId', 'name imageUrls')
      .populate('userId', 'firstName lastName')
      .exec();

    if (!review) {
      throw new NotFoundException(
        ReviewErrorMessages[ReviewError.REVIEW_NOT_FOUND],
      );
    }

    return review;
  }

  /**
   * Create a new review
   */
  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    const { productId, rating, comment } = createReviewDto;

    // Validate product exists
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException(
        ReviewErrorMessages[ReviewError.PRODUCT_NOT_FOUND],
      );
    }

    // Check if user already reviewed this product
    const existingReview = await this.reviewModel
      .findOne({
        productId: new Types.ObjectId(productId),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (existingReview) {
      throw new BadRequestException(
        ReviewErrorMessages[ReviewError.ALREADY_REVIEWED],
      );
    }

    // Create review
    const review = new this.reviewModel({
      productId: new Types.ObjectId(productId),
      userId: new Types.ObjectId(userId),
      rating,
      comment,
      isApproved: true, // Reviews are automatically approved
    });

    await review.save();

    // Populate and return
    return this.reviewModel
      .findById(review._id)
      .populate('productId', 'name imageUrls')
      .populate('userId', 'firstName lastName')
      .exec();
  }

  /**
   * Update review (only by the review author)
   */
  async updateReview(
    reviewId: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.reviewModel.findById(reviewId).exec();

    if (!review) {
      throw new NotFoundException(
        ReviewErrorMessages[ReviewError.REVIEW_NOT_FOUND],
      );
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId) {
      throw new ForbiddenException(
        ReviewErrorMessages[ReviewError.UNAUTHORIZED_ACCESS],
      );
    }

    // Update review
    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(
        reviewId,
        { ...updateReviewDto, isApproved: true }, // Keep approved status
        { new: true },
      )
      .populate('productId', 'name imageUrls')
      .populate('userId', 'firstName lastName')
      .exec();

    return updatedReview;
  }

  /**
   * Delete review (only by the review author)
   */
  async deleteReview(reviewId: string, userId: string) {
    const review = await this.reviewModel.findById(reviewId).exec();

    if (!review) {
      throw new NotFoundException(
        ReviewErrorMessages[ReviewError.REVIEW_NOT_FOUND],
      );
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId) {
      throw new ForbiddenException(
        ReviewErrorMessages[ReviewError.UNAUTHORIZED_ACCESS],
      );
    }

    await this.reviewModel.findByIdAndDelete(reviewId).exec();

    return { message: 'Review deleted successfully' };
  }

  /**
   * Approve review (admin only)
   * Note: Currently reviews are auto-approved, this method is kept for future use
   */
  async approveReview(reviewId: string) {
    const review = await this.reviewModel.findById(reviewId).exec();

    if (!review) {
      throw new NotFoundException(
        ReviewErrorMessages[ReviewError.REVIEW_NOT_FOUND],
      );
    }

    review.isApproved = true;
    await review.save();

    return this.reviewModel
      .findById(reviewId)
      .populate('productId', 'name imageUrls')
      .populate('userId', 'firstName lastName')
      .exec();
  }

  /**
   * Reject review (admin only)
   * Note: Currently reviews are auto-approved, this method is kept for future use
   */
  async rejectReview(reviewId: string) {
    const review = await this.reviewModel.findById(reviewId).exec();

    if (!review) {
      throw new NotFoundException(
        ReviewErrorMessages[ReviewError.REVIEW_NOT_FOUND],
      );
    }

    review.isApproved = false;
    await review.save();

    return this.reviewModel
      .findById(reviewId)
      .populate('productId', 'name imageUrls')
      .populate('userId', 'firstName lastName')
      .exec();
  }

  /**
   * Get review statistics for a product
   */
  async getProductReviewStats(productId: string) {
    const stats = await this.reviewModel.aggregate([
      {
        $match: {
          productId: new Types.ObjectId(productId),
          isApproved: true,
        },
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    const stat = stats[0];
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    stat.ratingDistribution.forEach((rating: number) => {
      ratingDistribution[rating as keyof typeof ratingDistribution]++;
    });

    return {
      totalReviews: stat.totalReviews,
      averageRating: Math.round(stat.averageRating * 10) / 10,
      ratingDistribution,
    };
  }
}
