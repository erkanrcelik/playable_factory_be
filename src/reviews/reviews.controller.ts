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
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid data or already reviewed' })
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
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
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
  })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
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
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async rejectReview(@Param('id') id: string) {
    return this.reviewsService.rejectReview(id);
  }
}
