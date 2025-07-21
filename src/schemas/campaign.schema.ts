import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampaignDocument = Campaign & Document;

export enum CampaignType {
  PLATFORM = 'platform',
  SELLER = 'seller',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  AMOUNT = 'amount',
}

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: CampaignType })
  type: CampaignType;

  @Prop({ required: true, enum: DiscountType })
  discountType: DiscountType;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  productIds: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  categoryIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sellerId?: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: Number })
  maxUsage?: number;

  @Prop({ type: Number, default: 0 })
  minOrderAmount?: number;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
