import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Product, ProductDocument } from '../schemas/product.schema';
import {
  Campaign,
  CampaignDocument,
  DiscountType,
} from '../schemas/campaign.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { CartError, CartErrorMessages } from './enums/cart-error.enum';
import { OrdersService } from '../orders/orders.service';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
  sellerId: string;
  sellerName: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  appliedCampaigns: Array<{
    campaignId: string;
    campaignName: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
  }>;
}

@Injectable()
export class CartService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    private ordersService: OrdersService,
  ) {}

  /**
   * Get cart for user
   */
  async getCart(userId: string): Promise<Cart> {
    const cartKey = `cart:${userId}`;
    const cart = await this.cacheManager.get<Cart>(cartKey);

    if (!cart) {
      return {
        userId,
        items: [],
        subtotal: 0,
        totalDiscount: 0,
        total: 0,
        appliedCampaigns: [],
      };
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;

    // Validate product exists and is active
    const product = await this.productModel.findById(productId).exec();

    if (!product || !product.isActive) {
      throw new NotFoundException(
        CartErrorMessages[CartError.PRODUCT_NOT_FOUND],
      );
    }

    // Check stock availability
    const totalStock = product.stock || 0;

    if (totalStock < quantity) {
      throw new BadRequestException(
        CartErrorMessages[CartError.INSUFFICIENT_STOCK],
      );
    }

    const cartKey = `cart:${userId}`;
    let cart = await this.getCart(userId);

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        price: product.price,
        name: product.name,
        imageUrl: product.imageUrls?.[0],
        sellerId: product.sellerId.toString(),
        sellerName: `${(product.sellerId as any).firstName} ${(product.sellerId as any).lastName}`,
      });
    }

    // Recalculate totals
    cart = await this.calculateCartTotals(cart);

    // Save to Redis
    await this.cacheManager.set(cartKey, cart, 60 * 60 * 24 * 7); // 7 days

    return cart;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    userId: string,
    productId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const { quantity } = updateDto;

    const cart = await this.getCart(userId);
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(
        CartErrorMessages[CartError.CART_ITEM_NOT_FOUND],
      );
    }

    // Validate product stock
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException(
        CartErrorMessages[CartError.PRODUCT_NOT_FOUND],
      );
    }

    const totalStock = product.stock || 0;

    if (totalStock < quantity) {
      throw new BadRequestException(
        CartErrorMessages[CartError.INSUFFICIENT_STOCK],
      );
    }

    cart.items[itemIndex].quantity = quantity;

    // Recalculate totals
    const updatedCart = await this.calculateCartTotals(cart);

    // Save to Redis
    const cartKey = `cart:${userId}`;
    await this.cacheManager.set(cartKey, updatedCart, 60 * 60 * 24 * 7);

    return updatedCart;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(
        CartErrorMessages[CartError.CART_ITEM_NOT_FOUND],
      );
    }

    cart.items.splice(itemIndex, 1);

    // Recalculate totals
    const updatedCart = await this.calculateCartTotals(cart);

    // Save to Redis
    const cartKey = `cart:${userId}`;
    await this.cacheManager.set(cartKey, updatedCart, 60 * 60 * 24 * 7);

    return updatedCart;
  }

  /**
   * Clear cart
   */
  async clearCart(userId: string): Promise<{ message: string }> {
    const cartKey = `cart:${userId}`;
    await this.cacheManager.del(cartKey);

    return { message: 'Cart cleared successfully' };
  }

  /**
   * Calculate cart totals with campaign discounts
   */
  private async calculateCartTotals(cart: Cart): Promise<Cart> {
    if (cart.items.length === 0) {
      return {
        ...cart,
        subtotal: 0,
        totalDiscount: 0,
        total: 0,
        appliedCampaigns: [],
      };
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Get active campaigns
    const now = new Date();
    const activeCampaigns = await this.campaignModel
      .find({
        startDate: { $lte: now },
        endDate: { $gte: now },
        isActive: true,
      })
      .exec();

    let totalDiscount = 0;
    const appliedCampaigns: Array<{
      campaignId: string;
      campaignName: string;
      discountAmount: number;
      discountType: 'percentage' | 'fixed';
    }> = [];

    // Apply platform campaigns first
    const platformCampaigns = activeCampaigns.filter(
      (campaign) => campaign.type === ('platform' as any),
    );

    for (const campaign of platformCampaigns) {
      const campaignDiscount = this.calculateCampaignDiscount(
        cart.items,
        campaign,
        totalDiscount,
      );

      if (campaignDiscount > 0) {
        totalDiscount += campaignDiscount;
        appliedCampaigns.push({
          campaignId: (campaign._id as any).toString(),
          campaignName: campaign.name,
          discountAmount: campaignDiscount,
          discountType:
            campaign.discountType === DiscountType.PERCENTAGE
              ? 'percentage'
              : 'fixed',
        });
      }
    }

    // Apply seller campaigns
    const sellerCampaigns = activeCampaigns.filter(
      (campaign) => campaign.type === ('seller' as any),
    );

    for (const campaign of sellerCampaigns) {
      const campaignDiscount = this.calculateCampaignDiscount(
        cart.items,
        campaign,
        totalDiscount,
      );

      if (campaignDiscount > 0) {
        totalDiscount += campaignDiscount;
        appliedCampaigns.push({
          campaignId: (campaign._id as any).toString(),
          campaignName: campaign.name,
          discountAmount: campaignDiscount,
          discountType:
            campaign.discountType === DiscountType.PERCENTAGE
              ? 'percentage'
              : 'fixed',
        });
      }
    }

    return {
      ...cart,
      subtotal,
      totalDiscount,
      total: Math.max(0, subtotal - totalDiscount),
      appliedCampaigns,
    };
  }

  /**
   * Calculate discount for a specific campaign
   */
  private calculateCampaignDiscount(
    items: CartItem[],
    campaign: any,
    currentTotalDiscount: number,
  ): number {
    let applicableItems: CartItem[] = [];

    if (campaign.type === ('platform' as any)) {
      // Platform campaigns apply to all products
      applicableItems = items;
    } else if (campaign.type === ('seller' as any)) {
      // Seller campaigns apply only to seller's products
      applicableItems = items.filter((item) =>
        campaign.productIds.includes(item.productId),
      );
    }

    if (applicableItems.length === 0) {
      return 0;
    }

    const applicableSubtotal = applicableItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    if (applicableSubtotal < campaign.minOrderAmount) {
      return 0;
    }

    let discount = 0;
    if (campaign.discountType === 'percentage') {
      discount = (applicableSubtotal * campaign.discountValue) / 100;
    } else {
      discount = campaign.discountValue;
    }

    // Apply maximum discount limit
    if (campaign.maxDiscountAmount && discount > campaign.maxDiscountAmount) {
      discount = campaign.maxDiscountAmount;
    }

    return Math.min(discount, applicableSubtotal - currentTotalDiscount);
  }

  /**
   * Process checkout
   */
  async checkout(userId: string, checkoutDto: CheckoutDto): Promise<any> {
    const cart = await this.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException(CartErrorMessages[CartError.EMPTY_CART]);
    }

    // Validate stock availability
    for (const item of cart.items) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product) {
        throw new NotFoundException(`Product not found: ${item.name}`);
      }

      const totalStock = product.stock || 0;
      if (totalStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${item.name}`,
        );
      }
    }

    // Process payment (dummy implementation)
    const paymentResult = await this.processPayment(checkoutDto, cart.total);

    if (!paymentResult.success) {
      throw new BadRequestException('Payment failed: ' + paymentResult.message);
    }

    // Create order through Orders Service
    const orderData = {
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        sellerId: item.sellerId,
      })),
      shippingAddress: checkoutDto.shippingAddress,
      paymentStatus: paymentResult.success
        ? ('paid' as any)
        : ('pending' as any),
      notes: checkoutDto.notes,
      paymentTransactionId: paymentResult.transactionId,
      appliedCampaigns: cart.appliedCampaigns,
      subtotal: cart.subtotal,
      totalDiscount: cart.totalDiscount,
    };

    // Create real order using OrdersService
    const createdOrder = await this.ordersService.createOrder(
      userId,
      orderData,
    );

    // Clear cart after successful order creation
    await this.clearCart(userId);

    return {
      message: 'Order placed successfully',
      orderId: createdOrder._id,
      transactionId: paymentResult.transactionId,
      total: cart.total,
      order: createdOrder,
    };
  }

  /**
   * Dummy payment processing
   */
  private async processPayment(
    checkoutDto: CheckoutDto,
    amount: number,
  ): Promise<any> {
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate 95% success rate
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
      return {
        success: true,
        transactionId:
          'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        amount,
      };
    } else {
      return {
        success: false,
        message: 'Payment declined by bank',
      };
    }
  }
}
