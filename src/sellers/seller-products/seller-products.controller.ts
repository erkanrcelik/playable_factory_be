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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UserRole } from '../../schemas/user.schema';
import { SellerProductsService } from './seller-products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  FindAllProductsDto,
  createProductSchema,
  updateProductSchema,
  findAllProductsSchema,
} from './dto';

@ApiTags('Satıcı Ürün Yönetimi')
@Controller('seller/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
@ApiBearerAuth()
export class SellerProductsController {
  constructor(private readonly sellerProductsService: SellerProductsService) {}

  /**
   * Satıcının ürünlerini listeler
   */
  @Get()
  @ApiOperation({
    summary: 'Satıcının ürünlerini listeler',
    description:
      'Satıcının kendi ürünlerini filtreleme ve sayfalama ile listeler',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Sayfa numarası' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Sayfa başına öğe sayısı',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Arama terimi' })
  @ApiQuery({ name: 'category', required: false, description: 'Kategori ID' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Aktif durum filtresi',
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    description: 'Öne çıkan ürün filtresi',
  })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum fiyat' })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maksimum fiyat',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sıralama alanı' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sıralama yönü',
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün listesi başarıyla getirildi',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
              category: { type: 'object' },
              imageUrls: { type: 'array', items: { type: 'string' } },
              isActive: { type: 'boolean' },
              isFeatured: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
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
  @ApiResponse({ status: 401, description: 'Yetkilendirme hatası' })
  @ApiResponse({ status: 403, description: 'Yetersiz yetki' })
  async findAllProducts(
    @Query(new ZodValidationPipe(findAllProductsSchema))
    query: FindAllProductsDto,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.findAllProducts(sellerId, query);
  }

  /**
   * Belirli bir ürünü getirir
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Ürün detaylarını getirir',
    description: 'Satıcının kendi ürününün detaylarını getirir',
  })
  @ApiParam({ name: 'id', description: 'Ürün ID' })
  @ApiResponse({
    status: 200,
    description: 'Ürün detayları başarıyla getirildi',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        category: { type: 'object' },
        imageUrls: { type: 'array', items: { type: 'string' } },
        specifications: { type: 'object' },
        tags: { type: 'array', items: { type: 'string' } },
        isActive: { type: 'boolean' },
        isFeatured: { type: 'boolean' },
        variants: { type: 'array' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async findOneProduct(
    @Param('id') productId: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.findOneProduct(productId, sellerId);
  }

  /**
   * Yeni ürün oluşturur
   */
  @Post()
  @ApiOperation({
    summary: 'Yeni ürün oluşturur',
    description: 'Satıcı için yeni ürün oluşturur',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'iPhone 15 Pro' },
        description: { type: 'string', example: 'Apple iPhone 15 Pro 256GB' },
        price: { type: 'number', example: 999.99 },
        category: { type: 'string', example: '507f1f77bcf86cd799439011' },
        specifications: { type: 'object' },
        tags: { type: 'array', items: { type: 'string' } },
        isFeatured: { type: 'boolean' },
        variants: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ürün başarıyla oluşturuldu',
  })
  @ApiResponse({ status: 400, description: 'Geçersiz veri' })
  async createProduct(
    @Body(new ZodValidationPipe(createProductSchema))
    createProductDto: CreateProductDto,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.createProduct(createProductDto, sellerId);
  }

  /**
   * Ürün günceller
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Ürün günceller',
    description: 'Satıcının kendi ürününü günceller',
  })
  @ApiParam({ name: 'id', description: 'Ürün ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'iPhone 15 Pro Max' },
        description: {
          type: 'string',
          example: 'Apple iPhone 15 Pro Max 512GB',
        },
        price: { type: 'number', example: 1299.99 },
        category: { type: 'string', example: '507f1f77bcf86cd799439011' },
        specifications: { type: 'object' },
        tags: { type: 'array', items: { type: 'string' } },
        isFeatured: { type: 'boolean' },
        isActive: { type: 'boolean' },
        variants: { type: 'array' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ürün başarıyla güncellendi',
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async updateProduct(
    @Param('id') productId: string,
    @Body(new ZodValidationPipe(updateProductSchema))
    updateProductDto: UpdateProductDto,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.updateProduct(
      productId,
      updateProductDto,
      sellerId,
    );
  }

  /**
   * Ürün siler
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Ürün siler',
    description: 'Satıcının kendi ürününü siler',
  })
  @ApiParam({ name: 'id', description: 'Ürün ID' })
  @ApiResponse({
    status: 200,
    description: 'Ürün başarıyla silindi',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Ürün başarıyla silindi' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async deleteProduct(
    @Param('id') productId: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.deleteProduct(productId, sellerId);
  }

  /**
   * Ürün durumunu değiştirir (aktif/pasif)
   */
  @Put(':id/toggle-status')
  @ApiOperation({
    summary: 'Ürün durumunu değiştirir',
    description: 'Ürünün aktif/pasif durumunu değiştirir',
  })
  @ApiParam({ name: 'id', description: 'Ürün ID' })
  @ApiResponse({
    status: 200,
    description: 'Ürün durumu başarıyla değiştirildi',
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async toggleProductStatus(
    @Param('id') productId: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.toggleProductStatus(productId, sellerId);
  }

  /**
   * Ürün resmi yükler
   */
  @Post(':id/upload-image')
  @ApiOperation({
    summary: 'Ürün resmi yükler',
    description: 'Ürün için resim yükler (MinIO)',
  })
  @ApiParam({ name: 'id', description: 'Ürün ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Yüklenecek resim dosyası',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({
    status: 201,
    description: 'Resim başarıyla yüklendi',
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string' },
        imageKey: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz dosya formatı veya boyutu',
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async uploadProductImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') sellerId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.sellerProductsService.uploadProductImage(
      productId,
      file,
      sellerId,
    );
  }

  /**
   * Ürün resmini siler
   */
  @Delete(':id/images/:imageKey')
  @ApiOperation({
    summary: 'Ürün resmini siler',
    description: 'Ürünün belirli bir resmini siler',
  })
  @ApiParam({ name: 'id', description: 'Ürün ID' })
  @ApiParam({ name: 'imageKey', description: "Resim key'i" })
  @ApiResponse({
    status: 200,
    description: 'Resim başarıyla silindi',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Resim başarıyla silindi' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async deleteProductImage(
    @Param('id') productId: string,
    @Param('imageKey') imageKey: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.sellerProductsService.deleteProductImage(
      productId,
      imageKey,
      sellerId,
    );
  }

  /**
   * Satıcının ürün istatistiklerini getirir
   */
  @Get('stats/overview')
  @ApiOperation({
    summary: 'Ürün istatistiklerini getirir',
    description: 'Satıcının ürün istatistiklerini getirir',
  })
  @ApiResponse({
    status: 200,
    description: 'İstatistikler başarıyla getirildi',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Toplam ürün sayısı' },
        active: { type: 'number', description: 'Aktif ürün sayısı' },
        inactive: { type: 'number', description: 'Pasif ürün sayısı' },
        featured: { type: 'number', description: 'Öne çıkan ürün sayısı' },
        avgPrice: { type: 'number', description: 'Ortalama fiyat' },
      },
    },
  })
  async getProductStats(@CurrentUser('id') sellerId: string) {
    return this.sellerProductsService.getProductStats(sellerId);
  }
}
