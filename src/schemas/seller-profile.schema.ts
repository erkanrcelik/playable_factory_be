import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SellerProfileDocument = SellerProfile & Document;

@Schema({ timestamps: true })
export class SellerProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  sellerId: Types.ObjectId;

  @Prop()
  storeName?: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  logoUrl?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  website?: string;

  @Prop({ type: Object })
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @Prop({ type: Object })
  businessHours?: {
    monday?: { open?: string; close?: string; closed: boolean };
    tuesday?: { open?: string; close?: string; closed: boolean };
    wednesday?: { open?: string; close?: string; closed: boolean };
    thursday?: { open?: string; close?: string; closed: boolean };
    friday?: { open?: string; close?: string; closed: boolean };
    saturday?: { open?: string; close?: string; closed: boolean };
    sunday?: { open?: string; close?: string; closed: boolean };
  };

  @Prop({ type: Object })
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export const SellerProfileSchema = SchemaFactory.createForClass(SellerProfile);
