import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { CategoryError, CategoryErrorMessages } from './enums';

export interface FindAllOptions {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class AdminCategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Aynı isimde kategori var mı kontrol et
    const existingCategory = await this.categoryModel.findOne({
      name: { $regex: new RegExp(`^${createCategoryDto.name}$`, 'i') },
    });

    if (existingCategory) {
      throw new BadRequestException(
        CategoryErrorMessages[CategoryError.CATEGORY_ALREADY_EXISTS],
      );
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      isActive: createCategoryDto.isActive ?? true,
    });
    return category.save();
  }

  async findAll(options: FindAllOptions): Promise<PaginatedResponse<Category>> {
    const { page, limit, search, isActive } = options;
    const skip = (page - 1) * limit;

    // Create filter
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    // Get total count
    const total = await this.categoryModel.countDocuments(filter);

    // Get categories
    const data = await this.categoryModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(
        CategoryErrorMessages[CategoryError.CATEGORY_NOT_FOUND],
      );
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Kategori var mı kontrol et
    const existingCategory = await this.categoryModel.findById(id);
    if (!existingCategory) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    // Check if name is being changed and if it conflicts with existing category
    if (
      updateCategoryDto.name &&
      updateCategoryDto.name !== existingCategory.name
    ) {
      const duplicateCategory = await this.categoryModel.findOne({
        name: { $regex: new RegExp(`^${updateCategoryDto.name}$`, 'i') },
        _id: { $ne: id },
      });

      if (duplicateCategory) {
        throw new BadRequestException(
          CategoryErrorMessages[CategoryError.CATEGORY_ALREADY_EXISTS],
        );
      }
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(
        CategoryErrorMessages[CategoryError.CATEGORY_NOT_FOUND],
      );
    }

    return updatedCategory;
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(
        CategoryErrorMessages[CategoryError.CATEGORY_NOT_FOUND],
      );
    }

    // Check if category has associated products (can be implemented in the future)
    // const productsCount = await this.productModel.countDocuments({ categoryId: id });
    // if (productsCount > 0) {
    //   throw new BadRequestException(CategoryErrorMessages[CategoryError.CATEGORY_HAS_PRODUCTS]);
    // }

    await this.categoryModel.findByIdAndDelete(id);
    return {
      message: CategoryErrorMessages[CategoryError.CATEGORY_DELETED_SUCCESS],
    };
  }

  async toggleStatus(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(
        CategoryErrorMessages[CategoryError.CATEGORY_NOT_FOUND],
      );
    }

    category.isActive = !category.isActive;
    return category.save();
  }

  async getCategoryStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active] = await Promise.all([
      this.categoryModel.countDocuments(),
      this.categoryModel.countDocuments({ isActive: true }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }
}
