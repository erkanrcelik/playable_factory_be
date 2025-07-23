import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  UserActivity,
  UserActivityDocument,
} from '../schemas/user-activity.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Order, OrderDocument } from '../schemas/order.schema';

export interface ProductVector {
  productId: string;
  vector: number[];
  features: {
    category: string;
    price: number;
    rating: number;
    salesCount: number;
    tags: string[];
  };
}

export interface UserVector {
  userId: string;
  vector: number[];
  preferences: {
    favoriteCategories: string[];
    priceRange: { min: number; max: number };
    averageRating: number;
  };
}

@Injectable()
export class RecommendationsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(UserActivity.name)
    private userActivityModel: Model<UserActivityDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  /**
   * Kullanıcı etkinliğini kaydet
   */
  async trackUserActivity(
    userId: string,
    productId: string,
    activityType: 'view' | 'purchase' | 'cart_add',
  ): Promise<void> {
    const activity = await this.userActivityModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (activity) {
      // Mevcut aktiviteyi güncelle
      if (activityType === 'view') {
        if (!activity.viewedProducts.includes(new Types.ObjectId(productId))) {
          activity.viewedProducts.push(new Types.ObjectId(productId));
        }
        if (!activity.browsingHistory.includes(new Types.ObjectId(productId))) {
          activity.browsingHistory.push(new Types.ObjectId(productId));
        }
      } else if (activityType === 'purchase') {
        if (
          !activity.purchasedProducts.includes(new Types.ObjectId(productId))
        ) {
          activity.purchasedProducts.push(new Types.ObjectId(productId));
        }
      }

      await activity.save();
    } else {
      // Yeni aktivite oluştur
      const newActivity = new this.userActivityModel({
        userId: new Types.ObjectId(userId),
        viewedProducts:
          activityType === 'view' ? [new Types.ObjectId(productId)] : [],
        browsingHistory:
          activityType === 'view' ? [new Types.ObjectId(productId)] : [],
        purchasedProducts:
          activityType === 'purchase' ? [new Types.ObjectId(productId)] : [],
        favoriteCategories: [],
      });

      await newActivity.save();
    }

    // Vector'ları güncelle
    await this.updateUserVector(userId);
    await this.updateProductVector(productId);
  }

  /**
   * Ürün vektörünü oluştur/güncelle
   */
  private async updateProductVector(productId: string): Promise<void> {
    const product = await this.productModel
      .findById(productId)
      .populate('category')
      .exec();
    if (!product) return;

    // Ürün özelliklerini vektöre dönüştür
    const vector = this.createProductVector(product);

    // Redis'e kaydet
    const vectorKey = `product_vector:${productId}`;
    await this.cacheManager.set(vectorKey, vector, 60 * 60 * 24); // 24 saat
  }

  /**
   * Kullanıcı vektörünü oluştur/güncelle
   */
  private async updateUserVector(userId: string): Promise<void> {
    const activity = await this.userActivityModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    if (!activity) return;

    // Kullanıcı tercihlerini analiz et
    const preferences = await this.analyzeUserPreferences(userId);
    const vector = this.createUserVector(activity, preferences);

    // Redis'e kaydet
    const vectorKey = `user_vector:${userId}`;
    await this.cacheManager.set(vectorKey, vector, 60 * 60 * 24); // 24 saat
  }

  /**
   * Ürün vektörü oluştur
   */
  private createProductVector(product: any): ProductVector {
    // Kategori encoding (one-hot benzeri)
    const categoryVector = this.encodeCategory(
      product.category?.name || 'other',
    );

    // Fiyat normalizasyonu (0-1 arası)
    const normalizedPrice = Math.min(product.price / 1000, 1); // 1000 TL max varsayımı

    // Rating normalizasyonu (varsayılan 3)
    const normalizedRating = 3 / 5; // Varsayılan rating

    // Satış sayısı normalizasyonu (varsayılan 0)
    const normalizedSales = 0;

    // Tag'ler encoding
    const tagVector = this.encodeTags(product.tags || []);

    return {
      productId: product._id.toString(),
      vector: [
        ...categoryVector,
        normalizedPrice,
        normalizedRating,
        normalizedSales,
        ...tagVector,
      ],
      features: {
        category: product.category?.name || 'other',
        price: product.price,
        rating: 3, // Varsayılan rating
        salesCount: 0, // Varsayılan satış sayısı
        tags: product.tags || [],
      },
    };
  }

  /**
   * Kullanıcı vektörü oluştur
   */
  private createUserVector(activity: any, preferences: any): UserVector {
    // Kategori tercihleri
    const categoryPreferences = this.encodeCategoryPreferences(
      preferences.favoriteCategories,
    );

    // Fiyat aralığı normalizasyonu
    const normalizedPriceRange = {
      min: Math.min(preferences.priceRange.min / 1000, 1),
      max: Math.min(preferences.priceRange.max / 1000, 1),
    };

    // Ortalama rating tercihi
    const normalizedAvgRating = preferences.averageRating / 5;

    return {
      userId: activity.userId.toString(),
      vector: [
        ...categoryPreferences,
        normalizedPriceRange.min,
        normalizedPriceRange.max,
        normalizedAvgRating,
      ],
      preferences,
    };
  }

  /**
   * Kategori encoding
   */
  private encodeCategory(categoryName: string): number[] {
    const categories = [
      'electronics',
      'clothing',
      'books',
      'home',
      'sports',
      'beauty',
      'food',
      'other',
    ];
    const vector = new Array(categories.length).fill(0);
    const index = categories.indexOf(categoryName.toLowerCase());
    if (index !== -1) {
      vector[index] = 1;
    }
    return vector;
  }

  /**
   * Tag encoding
   */
  private encodeTags(tags: string[]): number[] {
    const allTags = [
      'new',
      'sale',
      'trending',
      'popular',
      'limited',
      'premium',
      'eco-friendly',
    ];
    const vector = new Array(allTags.length).fill(0);

    tags.forEach((tag) => {
      const index = allTags.indexOf(tag.toLowerCase());
      if (index !== -1) {
        vector[index] = 1;
      }
    });

    return vector;
  }

  /**
   * Kategori tercihleri encoding
   */
  private encodeCategoryPreferences(favoriteCategories: string[]): number[] {
    const categories = [
      'electronics',
      'clothing',
      'books',
      'home',
      'sports',
      'beauty',
      'food',
      'other',
    ];
    const vector = new Array(categories.length).fill(0);

    favoriteCategories.forEach((category) => {
      const index = categories.indexOf(category.toLowerCase());
      if (index !== -1) {
        vector[index] = 1;
      }
    });

    return vector;
  }

  /**
   * Kullanıcı tercihlerini analiz et
   */
  private async analyzeUserPreferences(userId: string): Promise<any> {
    const activity = await this.userActivityModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    if (!activity) {
      return {
        favoriteCategories: [],
        priceRange: { min: 0, max: 1000 },
        averageRating: 3,
      };
    }

    // Satın alınan ürünlerden kategori analizi
    const purchasedProducts = await this.productModel
      .find({ _id: { $in: activity.purchasedProducts } })
      .populate('category')
      .exec();

    const categoryCounts: { [key: string]: number } = {};
    const prices: number[] = [];
    const ratings: number[] = [];

    purchasedProducts.forEach((product) => {
      const category = (product.category as any)?.name || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      prices.push(product.price);
      ratings.push(3); // Varsayılan rating
    });

    const favoriteCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return {
      favoriteCategories,
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 1000,
      },
      averageRating:
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 3,
    };
  }

  /**
   * Cosine similarity hesapla
   */
  private calculateCosineSimilarity(
    vector1: number[],
    vector2: number[],
  ): number {
    if (vector1.length !== vector2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Kullanıcı için ürün tavsiyeleri
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<any[]> {
    const userVectorKey = `user_vector:${userId}`;
    const userVector = await this.cacheManager.get<UserVector>(userVectorKey);

    if (!userVector) {
      // Kullanıcı vektörü yoksa popüler ürünleri döndür
      return this.getPopularProducts(limit);
    }

    // Tüm aktif ürünleri al
    const products = await this.productModel
      .find({ isActive: true })
      .populate('category')
      .exec();

    const recommendations: Array<{ product: any; similarity: number }> = [];

    for (const product of products) {
      const productVectorKey = `product_vector:${(product._id as any).toString()}`;
      let productVector =
        await this.cacheManager.get<ProductVector>(productVectorKey);

      if (!productVector) {
        // Ürün vektörü yoksa oluştur
        productVector = this.createProductVector(product);
        await this.cacheManager.set(
          productVectorKey,
          productVector,
          60 * 60 * 24,
        );
      }

      const similarity = this.calculateCosineSimilarity(
        userVector.vector,
        productVector.vector,
      );
      recommendations.push({ product, similarity });
    }

    // Benzerliğe göre sırala ve limit kadar döndür
    return recommendations
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((item) => ({
        ...item.product.toObject(),
        similarity: item.similarity,
      }));
  }

  /**
   * "Birlikte sıkça alınanlar" önerileri
   */
  async getFrequentlyBoughtTogether(
    productId: string,
    limit: number = 5,
  ): Promise<any[]> {
    // Bu ürünle birlikte satın alınan ürünleri bul
    const orders = await this.orderModel
      .find({
        'items.productId': new Types.ObjectId(productId),
        status: { $in: ['completed', 'shipped'] },
      })
      .exec();

    const productCounts: { [key: string]: number } = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.productId.toString() !== productId) {
          productCounts[item.productId.toString()] =
            (productCounts[item.productId.toString()] || 0) + 1;
        }
      });
    });

    // En çok birlikte alınan ürünleri getir
    const topProductIds = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId]) => productId);

    const products = await this.productModel
      .find({ _id: { $in: topProductIds }, isActive: true })
      .populate('category')
      .exec();

    return products.map((product) => product.toObject());
  }

  /**
   * Popüler ürünleri getir
   */
  async getPopularProducts(limit: number = 10): Promise<any[]> {
    const products = await this.productModel
      .find({ isActive: true })
      .populate('category')
      .sort({ price: 1 })
      .limit(limit)
      .exec();

    return products.map((product) => product.toObject());
  }

  /**
   * Kategori bazlı öneriler
   */
  async getCategoryRecommendations(
    categoryId: string,
    limit: number = 10,
  ): Promise<any[]> {
    const products = await this.productModel
      .find({
        category: new Types.ObjectId(categoryId),
        isActive: true,
      })
      .populate('category')
      .sort({ price: 1 })
      .limit(limit)
      .exec();

    return products.map((product) => product.toObject());
  }

  /**
   * Kullanıcının göz atma geçmişine göre öneriler
   */
  async getBrowsingHistoryRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<any[]> {
    const activity = await this.userActivityModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!activity || activity.browsingHistory.length === 0) {
      return this.getPopularProducts(limit);
    }

    // Son görüntülenen ürünlerin kategorilerini analiz et
    const recentProducts = await this.productModel
      .find({ _id: { $in: activity.browsingHistory.slice(-10) } })
      .populate('category')
      .exec();

    const categoryCounts: { [key: string]: number } = {};
    recentProducts.forEach((product) => {
      const category = (product.category as any)?.name || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Kategori analizi yapıldı ama kullanılmadı - şimdilik basit öneriler döndür
    // const _topCategories = Object.entries(categoryCounts)
    //   .sort(([, a], [, b]) => b - a)
    //   .slice(0, 3)
    //   .map(([category]) => category);

    // Bu kategorilerdeki ürünleri getir
    const products = await this.productModel
      .find({
        isActive: true,
        _id: { $nin: activity.browsingHistory }, // Zaten görüntülenenleri hariç tut
      })
      .populate('category')
      .sort({ price: 1 }) // Fiyata göre sırala
      .limit(limit)
      .exec();

    return products.map((product) => product.toObject());
  }
}
