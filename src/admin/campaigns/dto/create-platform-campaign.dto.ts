import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsArray,
  Min,
  IsEnum,
} from 'class-validator';
import { DiscountType } from '../../../schemas/campaign.schema';

export class CreatePlatformCampaignDto {
  @ApiProperty({
    description: 'Campaign name',
    example: 'Summer Sale 2024',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Campaign description',
    example: 'Biggest summer sale with up to 50% off',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Discount type (percentage or fixed)',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    description:
      'Discount value (percentage: 0-100, fixed: any positive number)',
    example: 25,
  })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({
    description: 'Campaign start date',
    example: '2024-06-01T00:00:00.000Z',
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'Campaign end date',
    example: '2024-08-31T23:59:59.000Z',
  })
  @IsDate()
  endDate: Date;

  @ApiProperty({
    description: 'Product IDs to include in campaign',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @ApiProperty({
    description: 'Category IDs to include in campaign',
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];
}
