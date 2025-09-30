import {
  IsString, IsNumber, IsArray, ValidateNested, IsEmail, IsOptional,
  IsPositive, Min, MaxLength, ArrayMinSize, IsEnum, IsLatitude, IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CustomerInfoDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MaxLength(128)
  name!: string;

  @ApiProperty({ example: '+51 999 888 777' })
  @IsString()
  @MaxLength(32)
  phone!: string;

  @ApiProperty({ example: 'juan@example.com', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(128)
  email?: string;
}

class RestaurantInfoDto {
  @ApiProperty({ example: 'Pizzería Roma' })
  @IsString()
  @MaxLength(128)
  name!: string;

  @ApiProperty({ example: '+51 111 222 333' })
  @IsString()
  @MaxLength(32)
  phone!: string;

  @ApiProperty({ example: 'Av. Siempre Viva 123' })
  @IsString()
  @MaxLength(256)
  address!: string;

  @ApiProperty({ example: -12.0464 })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: -77.0428 })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude!: number;
}

class DeliveryAddressDto {
  @ApiProperty({ example: 'Calle Falsa 123, Dpto 401' })
  @IsString()
  @MaxLength(256)
  fullAddress!: string;

  @ApiProperty({ example: 'Miraflores' })
  @IsString()
  @MaxLength(64)
  district!: string;

  @ApiProperty({ example: 'Frente al parque', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  reference?: string;

  @ApiProperty({ example: -12.1212 })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: -77.0123 })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude!: number;
}

class OrderItemDto {
  @ApiProperty({ example: 'prod_001' })
  @IsString()
  @MaxLength(64)
  productId!: string;

  @ApiProperty({ example: 'Pizza Margarita' })
  @IsString()
  @MaxLength(128)
  name!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiProperty({ example: 29.9, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({ example: 'Sin aceitunas', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(256)
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
}