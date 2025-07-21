import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { CreateProductDto, UpdateProductDto, FindAllProductsDto } from './dto';
import { ProductError, ProductErrorMessages } from './enums';
import { MinioService } from '../../common/services/minio.service';

@Injectable()
export class SellerProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly minioService: MinioService,
  ) {}

  /**
   * Satıcının ürünlerini listeler
   * @param sellerId - Satıcı ID'si
   * @param options - Filtreleme ve sayfalama seçenekleri
   * @returns Ürün listesi ve sayfalama bilgileri
   */
  async findAllProducts(sellerId: string, options: FindAllProductsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isActive,
      isFeatured,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const query: any = { sellerId: new Types.ObjectId(sellerId) };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) {
      query.category = new Types.ObjectId(category);
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('category', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(query),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Belirli bir ürünü getirir (sadece satıcının kendi ürünü)
   * @param productId - Ürün ID'si
   * @param sellerId - Satıcı ID'si
   * @returns Ürün detayları
   */
  async findOneProduct(productId: string, sellerId: string) {
    const product = await this.productModel
      .findOne({
        _id: new Types.ObjectId(productId),
        sellerId: new Types.ObjectId(sellerId),
      })
      .populate('category', 'name description')
      .lean();

    if (!product) {
      throw new NotFoundException(
        ProductErrorMessages[ProductError.PRODUCT_NOT_FOUND],
      );
    }

    return product;
  }

  /**
   * Yeni ürün oluşturur
   * @param createProductDto - Ürün oluşturma verileri
   * @param sellerId - Satıcı ID'si
   * @returns Oluşturulan ürün
   */
  async createProduct(createProductDto: CreateProductDto, sellerId: string) {
    // Kategori kontrolü
    const category = await this.categoryModel.findById(
      createProductDto.category,
    );
    if (!category) {
      throw new BadRequestException(
        ProductErrorMessages[ProductError.INVALID_CATEGORY],
      );
    }

    const product = new this.productModel({
      ...createProductDto,
      sellerId: new Types.ObjectId(sellerId),
      category: new Types.ObjectId(createProductDto.category),
    });

    const savedProduct = await product.save();
    return savedProduct.populate('category', 'name');
  }

  /**
   * Ürün günceller (sadece satıcının kendi ürünü)
   * @param productId - Ürün ID'si
   * @param updateProductDto - Güncelleme verileri
   * @param sellerId - Satıcı ID'si
   * @returns Güncellenmiş ürün
   */
  async updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
    sellerId: string,
  ) {
    // Ürünün satıcıya ait olduğunu kontrol et
    const existingProduct = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!existingProduct) {
      throw new NotFoundException(
        ProductErrorMessages[ProductError.PRODUCT_NOT_FOUND],
      );
    }

    // Kategori güncelleniyorsa kontrol et
    if (updateProductDto.category) {
      const category = await this.categoryModel.findById(
        updateProductDto.category,
      );
      if (!category) {
        throw new BadRequestException(
          ProductErrorMessages[ProductError.INVALID_CATEGORY],
        );
      }
      updateProductDto.category = updateProductDto.category as any;
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        productId,
        { ...updateProductDto },
        { new: true, runValidators: true },
      )
      .populate('category', 'name');

    if (!updatedProduct) {
      throw new NotFoundException(
        ProductErrorMessages[ProductError.PRODUCT_NOT_FOUND],
      );
    }

    return updatedProduct;
  }

  /**
   * Ürün siler (sadece satıcının kendi ürünü)
   * @param productId - Ürün ID'si
   * @param sellerId - Satıcı ID'si
   * @returns Silme mesajı
   */
  async deleteProduct(productId: string, sellerId: string) {
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!product) {
      throw new NotFoundException(
        ProductErrorMessages[ProductError.PRODUCT_NOT_FOUND],
      );
    }

    // Ürün resimlerini MinIO'dan sil
    if (product.imageUrls && product.imageUrls.length > 0) {
      for (const imageUrl of product.imageUrls) {
        try {
          await this.minioService.deleteFile(imageUrl);
        } catch (error) {
          console.error('Resim silme hatası:', error);
        }
      }
    }

    await this.productModel.findByIdAndDelete(productId);

    return { message: 'Product deleted successfully' };
  }

  /**
   * Ürün durumunu değiştirir (aktif/pasif)
   * @param productId - Ürün ID'si
   * @param sellerId - Satıcı ID'si
   * @returns Güncellenmiş ürün
   */
  async toggleProductStatus(productId: string, sellerId: string) {
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!product) {
      throw new NotFoundException(
        ProductErrorMessages[ProductError.PRODUCT_NOT_FOUND],
      );
    }

    product.isActive = !product.isActive;
    const updatedProduct = await product.save();

    return updatedProduct.populate('category', 'name');
  }

  /**
   * Ürün resmi yükler
   * @param productId - Ürün ID'si
   * @param file - Yüklenecek dosya
   * @param sellerId - Satıcı ID'si
   * @returns Yüklenen resim bilgileri
   */
  async uploadProductImage(
    productId: string,
    file: Express.Multer.File,
    sellerId: string,
  ) {
    // Ürünün satıcıya ait olduğunu kontrol et
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!product) {
      throw new NotFoundException(
        ProductErrorMessages[ProductError.PRODUCT_NOT_FOUND],
      );
    }

    // Dosya tipi kontrolü
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        ProductErrorMessages[ProductError.INVALID_IMAGE_FORMAT],
      );
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException(
        ProductErrorMessages[ProductError.IMAGE_TOO_LARGE],
      );
    }

    try {
      // MinIO'ya yükle
      const uploadResult = await this.minioService.uploadFile(file, 'products');

      // Ürünün imageUrls array'ine ekle
      product.imageUrls.push(uploadResult.key);
      await product.save();

      // Presigned URL al
      const imageUrl = uploadResult.url;

      return {
        imageUrl,
        imageKey: uploadResult.key,
        message: 'Image uploaded successfully',
      };
    } catch {
      throw new BadRequestException(
        ProductErrorMessages[ProductError.UPLOAD_FAILED],
      );
    }
  }

  /**
   * Ürün resmini siler
   * @param productId - Ürün ID'si
   * @param imageKey - Silinecek resmin key'i
   * @param sellerId - Satıcı ID'si
   * @returns Silme mesajı
   */
  async deleteProductImage(
    productId: string,
    imageKey: string,
    sellerId: string,
  ) {
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!product) {
      throw new NotFoundException(
        ProductErrorMessages[ProductError.PRODUCT_NOT_FOUND],
      );
    }

    // Resmin ürüne ait olduğunu kontrol et
    if (!product.imageUrls.includes(imageKey)) {
      throw new BadRequestException(
        'This image does not belong to this product',
      );
    }

    try {
      // MinIO'dan sil
      await this.minioService.deleteFile(imageKey);

      // Ürünün imageUrls array'inden çıkar
      product.imageUrls = product.imageUrls.filter((url) => url !== imageKey);
      await product.save();

      return { message: 'Image deleted successfully' };
    } catch {
      throw new BadRequestException('Image deletion failed');
    }
  }

  /**
   * Satıcının ürün istatistiklerini getirir
   * @param sellerId - Satıcı ID'si
   * @returns İstatistikler
   */
  async getProductStats(sellerId: string) {
    const stats = await this.productModel.aggregate([
      { $match: { sellerId: new Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          featured: { $sum: { $cond: ['$isFeatured', 1, 0] } },
          avgPrice: { $avg: '$price' },
        },
      },
    ]);

    return (
      stats[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        featured: 0,
        avgPrice: 0,
      }
    );
  }
}
