// src/orders/dto/create-order.dto.ts
import {
  IsString, IsNumber, IsArray, ValidateNested, IsEmail, IsOptional,
  IsPositive, Min, MaxLength, ArrayMinSize, IsEnum, IsLatitude, IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum Currency {
  PEN = 'PEN',
  USD = 'USD',
}

export class CustomerInfoDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: '+51 999 888 777' })
  @IsString()
  @MaxLength(30)
  phone!: string;

  @ApiProperty({ example: 'juan@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class RestaurantInfoDto {
  @ApiProperty({ example: 'Pollos La Brasa' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: '+51 955 444 333' })
  @IsString()
  @MaxLength(30)
  phone!: string;

  @ApiProperty({ example: 'Av. Primavera 123, Santiago de Surco' })
  @IsString()
  @MaxLength(160)
  address!: string;

  @ApiProperty({ example: -12.10485 })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: -77.03532 })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude!: number;
}

export class DeliveryAddressDto {
  @ApiProperty({ example: 'Jr. Los Cedros 456, Miraflores' })
  @IsString()
  @MaxLength(160)
  fullAddress!: string;

  @ApiProperty({ example: 'Miraflores' })
  @IsString()
  @MaxLength(60)
  district!: string;

  @ApiProperty({ example: 'Casa con portón negro', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  reference?: string;

  @ApiProperty({ example: -12.12121 })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: -77.01234 })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude!: number;
}

export class OrderItemDto {
  @ApiProperty({ example: 'prod_abc123' })
  @IsString()
  @MaxLength(64)
  productId!: string;

  @ApiProperty({ example: 'Combo 1/4 de pollo' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 29.9, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({ example: 'Sin ají', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'cust_001' })
  @IsString()
  @MaxLength(64)
  customerId!: string;

  @ApiProperty({ type: CustomerInfoDto })
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo!: CustomerInfoDto;

  @ApiProperty({ example: 'rest_001' })
  @IsString()
  @MaxLength(64)
  restaurantId!: string;

  @ApiProperty({ type: RestaurantInfoDto })
  @ValidateNested()
  @Type(() => RestaurantInfoDto)
  restaurantInfo!: RestaurantInfoDto;

  @ApiProperty({ type: DeliveryAddressDto })
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress!: DeliveryAddressDto;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiProperty({ example: 59.8, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  subtotal!: number;

  @ApiProperty({ example: 7.0, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  deliveryFee!: number;

  @ApiProperty({ example: 66.8, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total!: number;

  @ApiProperty({ enum: Currency, default: Currency.PEN, required: false })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.PEN;

  @ApiProperty({ example: 'Dejar en recepción', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}
