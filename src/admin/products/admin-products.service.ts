import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Delete all out of stock products
   * @returns Deletion operation result
   */
  async deleteOutOfStockProducts() {
    // Find out of stock products
    const outOfStockProducts = await this.productModel.find({
      $or: [{ stock: { $lte: 0 } }, { 'variants.stock': { $lte: 0 } }],
    });

    if (outOfStockProducts.length === 0) {
      return {
        message: 'No out of stock products found',
        deletedCount: 0,
      };
    }

    let deletedCount = 0;
    const errors: string[] = [];

    // Delete each product one by one
    for (const product of outOfStockProducts) {
      try {
        // Delete product from database (images remain in MinIO)
        await this.productModel.findByIdAndDelete(product._id);
        deletedCount++;
      } catch (error) {
        errors.push(`Error deleting ${product.name}: ${error.message}`);
      }
    }

    return {
      message: `${deletedCount} out of stock products successfully deleted`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Delete a specific product (for admin)
   * @param productId - Product ID
   * @returns Deletion message
   */
  async deleteProduct(productId: string) {
    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Delete product from database (images remain in MinIO)
    await this.productModel.findByIdAndDelete(productId);

    return { message: 'Product successfully deleted' };
  }

  /**
   * List out of stock products (before deletion)
   * @returns Out of stock product list
   */
  async getOutOfStockProducts() {
    const outOfStockProducts = await this.productModel
      .find({
        $or: [{ stock: { $lte: 0 } }, { 'variants.stock': { $lte: 0 } }],
      })
      .populate('category', 'name')
      .populate('sellerId', 'firstName lastName storeName')
      .lean();

    return {
      data: outOfStockProducts,
      total: outOfStockProducts.length,
    };
  }
}
