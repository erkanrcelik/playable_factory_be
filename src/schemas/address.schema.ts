import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AddressDocument = Address & Document;

/**
 * Address Schema for user address management
 *
 * Represents customer shipping and billing addresses
 * with support for multiple addresses per user and default address selection
 */
@Schema({ timestamps: true })
export class Address {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  company?: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ default: 'home' })
  type: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
