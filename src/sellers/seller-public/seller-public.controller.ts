import { Controller, Get, Param, Query } from '@nestjs/common';
import { SellerPublicService } from './seller-public.service';
import { ParseMongoIdPipe } from '../../common/pipes/mongo-id.pipe';

/**
 * Controller for public seller operations
 * Provides endpoints to retrieve seller information publicly
 */
@Controller('sellers')
export class SellerPublicController {
  constructor(private readonly sellerPublicService: SellerPublicService) {}

  /**
   * Get all active sellers with pagination and search
   * @param page - Page number (optional)
   * @param limit - Items per page (optional)
   * @param search - Search term for store name or description (optional)
   * @returns Paginated list of sellers
   */
  @Get()
  async getAllSellers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.sellerPublicService.getAllSellers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    });
  }

  /**
   * Get specific seller information by ID
   * @param sellerId - Seller's MongoDB ObjectId
   * @returns Detailed seller information
   */
  @Get('detail/:sellerId')
  async getSellerById(@Param('sellerId', ParseMongoIdPipe) sellerId: string) {
    return this.sellerPublicService.getSellerById(sellerId);
  }
}
