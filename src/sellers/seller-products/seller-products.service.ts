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
import { MinioService } from '../../minio/minio.service';

@Injectable()
export class SellerProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private readonly minioService: MinioService,
  ) {}

  /**
   * List seller's products
   * @param sellerId - Seller ID
   * @param options - Filtering and pagination options
   * @returns Product list and pagination information
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
   * Get a specific product (only seller's own product)
   * @param productId - Product ID
   * @param sellerId - Seller ID
   * @returns Product details
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
   * Create a new product
   * @param createProductDto - Product creation data
   * @param sellerId - Seller ID
   * @returns Created product
   */
  async createProduct(createProductDto: CreateProductDto, sellerId: string) {
    // Category validation
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
   * Update product (only seller's own product)
   * @param productId - Product ID
   * @param updateProductDto - Update data
   * @param sellerId - Seller ID
   * @returns Updated product
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

    // Validate category if being updated
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
   * Delete product (only seller's own product)
   * @param productId - Product ID
   * @param sellerId - Seller ID
   * @returns Deletion message
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

    // Delete product images from MinIO
    if (product.imageUrls && product.imageUrls.length > 0) {
      for (const imageUrl of product.imageUrls) {
        try {
          await this.minioService.deleteFile(
            'ecommerce',
            imageUrl.split('/').pop() || '',
          );
        } catch (error) {
          // Log error but don't throw - file might already be deleted
          console.warn('Failed to delete product image:', error);
        }
      }
    }

    await this.productModel.findByIdAndDelete(productId);

    return { message: 'Product deleted successfully' };
  }

  /**
   * Toggle product status (active/inactive)
   * @param productId - Product ID
   * @param sellerId - Seller ID
   * @returns Updated product
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
   * Upload product image
   * @param productId - Product ID
   * @param file - File to upload
   * @param sellerId - Seller ID
   * @returns Uploaded image information
   */
  async uploadProductImage(
    productId: string,
    file: Express.Multer.File,
    sellerId: string,
  ) {
    // Check if product belongs to seller
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      sellerId: new Types.ObjectId(sellerId),
    });

    if (!product) {
      throw new NotFoundException(
        ProductErrorMessages[ProductError.PRODUCT_NOT_FOUND],
      );
    }

    // File type validation
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        ProductErrorMessages[ProductError.INVALID_IMAGE_FORMAT],
      );
    }

    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException(
        ProductErrorMessages[ProductError.IMAGE_TOO_LARGE],
      );
    }

    try {
      // Upload to MinIO
      const uploadResult = await this.minioService.uploadFile(file, 'products');

      // Add to product's imageUrls array
      product.imageUrls.push(uploadResult);
      await product.save();

      // Get presigned URL
      const imageUrl = uploadResult;

      return {
        imageUrl,
        imageKey: uploadResult.split('/').pop() || '',
        message: 'Image uploaded successfully',
      };
    } catch {
      throw new BadRequestException(
        ProductErrorMessages[ProductError.UPLOAD_FAILED],
      );
    }
  }

  /**
   * Delete product image
   * @param productId - Product ID
   * @param imageKey - Image key to delete
   * @param sellerId - Seller ID
   * @returns Deletion message
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

    // Check if image belongs to product
    if (!product.imageUrls.includes(imageKey)) {
      throw new BadRequestException(
        'This image does not belong to this product',
      );
    }

    try {
      // Delete from MinIO
      await this.minioService.deleteFile('ecommerce', imageKey);

      // Remove from product's imageUrls array
      product.imageUrls = product.imageUrls.filter((url) => url !== imageKey);
      await product.save();

      return { message: 'Image deleted successfully' };
    } catch {
      throw new BadRequestException('Image deletion failed');
    }
  }

  /**
   * Get seller's product statistics
   * @param sellerId - Seller ID
   * @returns Statistics
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
