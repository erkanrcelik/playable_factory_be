import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { addToCartSchema } from './dto/add-to-cart.dto';
import { updateCartItemSchema } from './dto/update-cart-item.dto';
import { checkoutSchema } from './dto/checkout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Shopping Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get user's cart
   */
  @Get()
  @ApiOperation({
    summary: 'Get user cart',
    description:
      "Retrieve the current user's shopping cart with calculated totals and applied discounts",
  })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              quantity: { type: 'number' },
              price: { type: 'number' },
              name: { type: 'string' },
              imageUrl: { type: 'string' },
              sellerId: { type: 'string' },
              sellerName: { type: 'string' },
            },
          },
        },
        subtotal: { type: 'number' },
        totalDiscount: { type: 'number' },
        total: { type: 'number' },
        appliedCampaigns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              campaignId: { type: 'string' },
              campaignName: { type: 'string' },
              discountAmount: { type: 'number' },
              discountType: { type: 'string', enum: ['percentage', 'fixed'] },
            },
          },
        },
      },
    },
  })
  async getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  /**
   * Add item to cart
   */
  @Post('add')
  @ApiOperation({
    summary: 'Add item to cart',
    description: "Add a product to the user's shopping cart",
  })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid product or insufficient stock',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addToCart(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(addToCartSchema)) addToCartDto: any,
  ) {
    return this.cartService.addToCart(userId, addToCartDto);
  }

  /**
   * Update cart item quantity
   */
  @Put('items/:productId')
  @ApiOperation({
    summary: 'Update cart item quantity',
    description: 'Update the quantity of a specific item in the cart',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid quantity or insufficient stock',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateCartItem(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(updateCartItemSchema)) updateDto: any,
  ) {
    return this.cartService.updateCartItem(userId, productId, updateDto);
  }

  /**
   * Remove item from cart
   */
  @Delete('items/:productId')
  @ApiOperation({
    summary: 'Remove item from cart',
    description: 'Remove a specific item from the cart',
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeFromCart(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeFromCart(userId, productId);
  }

  /**
   * Clear cart
   */
  @Delete('clear')
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Remove all items from the cart',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }

  /**
   * Checkout
   */
  @Post('checkout')
  @ApiOperation({
    summary: 'Checkout',
    description: 'Process checkout with payment and create order',
  })
  @ApiResponse({
    status: 201,
    description: 'Order placed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        orderId: { type: 'string' },
        transactionId: { type: 'string' },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Empty cart or payment failed' })
  async checkout(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(checkoutSchema)) checkoutDto: any,
  ) {
    return this.cartService.checkout(userId, checkoutDto);
  }
}
