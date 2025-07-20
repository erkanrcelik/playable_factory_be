import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserActivityDocument = UserActivity & Document;

@Schema({ timestamps: true })
export class UserActivity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  viewedProducts: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  browsingHistory: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  purchasedProducts: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  favoriteCategories: Types.ObjectId[];
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
