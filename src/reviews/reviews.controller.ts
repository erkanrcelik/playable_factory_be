import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createReviewSchema } from './dto/create-review.dto';
import { updateReviewSchema } from './dto/update-review.dto';
import { findAllReviewsSchema } from './dto/find-all-reviews.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Get customer's own reviews
   */
  @Get('customer/my-reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get customer reviews',
    description:
      'Retrieve all reviews created by the authenticated customer (Customer only)',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'rating', required: false, description: 'Rating filter' })
  @ApiQuery({
    name: 'isApproved',
    required: false,
    description: 'Approval status filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer reviews retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              productId: { type: 'string' },
              userId: { type: 'string' },
              rating: { type: 'number' },
              title: { type: 'string' },
              comment: { type: 'string' },
              isApproved: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              product: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  imageUrls: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyReviews(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(findAllReviewsSchema)) query: any,
  ) {
    return this.reviewsService.getCustomerReviews(userId, query);
  }

  /**
   * Get all reviews (admin only)
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all reviews (Admin)',
    description:
      'Retrieve all reviews with filtering and pagination (Admin only)',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'productId',
    required: false,
    description: 'Product ID filter',
  })
  @ApiQuery({ name: 'rating', required: false, description: 'Rating filter' })
  @ApiQuery({
    name: 'isApproved',
    required: false,
    description: 'Approval status filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              productId: { type: 'string' },
              userId: { type: 'string' },
              rating: { type: 'number' },
              title: { type: 'string' },
              comment: { type: 'string' },
              isApproved: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
              },
              product: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  imageUrls: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAllReviews(
    @Query(new ZodValidationPipe(findAllReviewsSchema)) query: any,
  ) {
    return this.reviewsService.findAllReviews(query);
  }

  /**
   * Get reviews for a specific product (public)
   */
  @Get('product/:productId')
  @ApiOperation({
    summary: 'Get product reviews',
    description: 'Retrieve approved reviews for a specific product',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'rating', required: false, description: 'Rating filter' })
  @ApiResponse({
    status: 200,
    description: 'Product reviews retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              productId: { type: 'string' },
              userId: { type: 'string' },
              rating: { type: 'number' },
              title: { type: 'string' },
              comment: { type: 'string' },
              isApproved: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
              },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        averageRating: { type: 'number' },
        totalReviews: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductReviews(
    @Param('productId') productId: string,
    @Query(new ZodValidationPipe(findAllReviewsSchema)) query: any,
  ) {
    return this.reviewsService.getProductReviews(productId, query);
  }

  /**
   * Get review statistics for a product (public)
   */
  @Get('product/:productId/stats')
  @ApiOperation({
    summary: 'Get product review statistics',
    description: 'Retrieve review statistics for a specific product',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Review statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalReviews: { type: 'number' },
        averageRating: { type: 'number' },
        ratingDistribution: {
          type: 'object',
          properties: {
            1: { type: 'number' },
            2: { type: 'number' },
            3: { type: 'number' },
            4: { type: 'number' },
            5: { type: 'number' },
          },
        },
      },
    },
  })
  async getProductReviewStats(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviewStats(productId);
  }

  /**
   * Get review by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get review by ID',
    description: 'Retrieve a specific review by its ID',
  })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        productId: { type: 'string' },
        userId: { type: 'string' },
        rating: { type: 'number' },
        title: { type: 'string' },
        comment: { type: 'string' },
        isApproved: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        user: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
        product: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            imageUrls: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async findOneReview(@Param('id') id: string) {
    return this.reviewsService.findOneReview(id);
  }

  /**
   * Create a new review
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create review',
    description: 'Create a new review for a product (requires authentication)',
  })
  @ApiBody({
    description: 'Review creation data',
    schema: {
      type: 'object',
      required: ['productId', 'rating', 'title', 'comment'],
      properties: {
        productId: {
          type: 'string',
          description: 'Product ID to review',
          example: '507f1f77bcf86cd799439011',
        },
        rating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Rating from 1 to 5',
          example: 5,
        },
        title: {
          type: 'string',
          minLength: 3,
          maxLength: 100,
          description: 'Review title',
          example: 'Great product!',
        },
        comment: {
          type: 'string',
          minLength: 10,
          maxLength: 1000,
          description: 'Review comment',
          example: 'This product exceeded my expectations. Highly recommended!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        productId: { type: 'string' },
        userId: { type: 'string' },
        rating: { type: 'number' },
        title: { type: 'string' },
        comment: { type: 'string' },
        isApproved: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid data or already reviewed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async createReview(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createReviewSchema)) createReviewDto: any,
  ) {
    return this.reviewsService.createReview(userId, createReviewDto);
  }

  /**
   * Update review
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update review',
    description: 'Update a review (only by the review author)',
  })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiBody({
    description: 'Review update data',
    schema: {
      type: 'object',
      properties: {
        rating: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Rating from 1 to 5',
          example: 4,
        },
        title: {
          type: 'string',
          minLength: 3,
          maxLength: 100,
          description: 'Review title',
          example: 'Updated review title',
        },
        comment: {
          type: 'string',
          minLength: 10,
          maxLength: 1000,
          description: 'Review comment',
          example: 'Updated review comment with more details.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        productId: { type: 'string' },
        userId: { type: 'string' },
        rating: { type: 'number' },
        title: { type: 'string' },
        comment: { type: 'string' },
        isApproved: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not review author' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async updateReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(updateReviewSchema)) updateReviewDto: any,
  ) {
    return this.reviewsService.updateReview(id, userId, updateReviewDto);
  }

  /**
   * Delete review
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete review',
    description: 'Delete a review (only by the review author)',
  })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Review deleted successfully' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not review author' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async deleteReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewsService.deleteReview(id, userId);
  }

  /**
   * Approve review (admin only)
   */
  @Put('admin/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Approve review (Admin)',
    description: 'Approve a review (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review approved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        productId: { type: 'string' },
        userId: { type: 'string' },
        rating: { type: 'number' },
        title: { type: 'string' },
        comment: { type: 'string' },
        isApproved: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async approveReview(@Param('id') id: string) {
    return this.reviewsService.approveReview(id);
  }

  /**
   * Reject review (admin only)
   */
  @Put('admin/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reject review (Admin)',
    description: 'Reject a review (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review rejected successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        productId: { type: 'string' },
        userId: { type: 'string' },
        rating: { type: 'number' },
        title: { type: 'string' },
        comment: { type: 'string' },
        isApproved: { type: 'boolean', example: false },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async rejectReview(@Param('id') id: string) {
    return this.reviewsService.rejectReview(id);
  }
}
