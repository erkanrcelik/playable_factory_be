import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  SELLER = 'seller',
  CUSTOMER = 'customer',
}

@Schema({ timestamps: true })
export class Address {
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
}

@Schema({ timestamps: true })
export class UserPreferences {
  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  favoriteCategories: Types.ObjectId[];
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: [Address], default: [] })
  addresses: Address[];

  @Prop({ type: UserPreferences, default: () => ({}) })
  preferences: UserPreferences;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationTokenExpires?: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetTokenExpires?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogoutAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
