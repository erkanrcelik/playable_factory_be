import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WishlistDocument = Wishlist & Document;

/**
 * Wishlist Schema for user favorite products
 *
 * Represents user's saved/favorite products for later purchase consideration
 */
@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop({ default: true })
  isActive: boolean;
}

// Create compound index to prevent duplicate active entries
export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
WishlistSchema.index(
  { userId: 1, productId: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);
