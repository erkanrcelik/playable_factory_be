import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SellerProfileDocument = SellerProfile & Document;

@Schema({ timestamps: true })
export class SellerProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  storeName: string;

  @Prop()
  storeDescription?: string;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop()
  logo?: string;

  @Prop()
  banner?: string;

  @Prop({ type: [String], default: [] })
  businessCategories: string[];

  @Prop()
  contactEmail?: string;

  @Prop()
  contactPhone?: string;

  @Prop()
  website?: string;

  @Prop({ type: Object, default: {} })
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export const SellerProfileSchema = SchemaFactory.createForClass(SellerProfile);
