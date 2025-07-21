import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsArray,
  Min,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { DiscountType } from '../../../schemas/campaign.schema';

export class UpdatePlatformCampaignDto {
  @ApiProperty({
    description: 'Campaign name',
    example: 'Updated Summer Sale 2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Campaign description',
    example: 'Updated campaign description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Discount type (percentage or fixed)',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    required: false,
  })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiProperty({
    description:
      'Discount value (percentage: 0-100, fixed: any positive number)',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiProperty({
    description: 'Campaign start date',
    example: '2024-06-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: 'Campaign end date',
    example: '2024-08-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  endDate?: Date;

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

  @ApiProperty({
    description: 'Campaign active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
