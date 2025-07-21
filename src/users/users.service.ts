import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, User, UserDocument, UserRole } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(userId: string, updateData: Partial<User>) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateData: Partial<User>) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async addAddress(userId: string, address: Address) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async removeAddress(userId: string, addressIndex: number) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (addressIndex >= 0 && addressIndex < user.addresses.length) {
      user.addresses.splice(addressIndex, 1);
      await user.save();
    }

    return user;
  }

  async updateAddress(userId: string, addressIndex: number, address: Address) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (addressIndex >= 0 && addressIndex < user.addresses.length) {
      user.addresses[addressIndex] = address;
      await user.save();
    }

    return user;
  }

  async findByRole(role: UserRole) {
    return this.userModel.find({ role }).exec();
  }

  async getUsersByRole(role: UserRole) {
    return this.userModel.find({ role }).exec();
  }

  async approveSeller(sellerId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      sellerId,
      { $set: { role: UserRole.SELLER } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
