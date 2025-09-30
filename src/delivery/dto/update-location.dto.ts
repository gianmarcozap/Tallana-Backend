import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsOptional, IsLatitude, IsLongitude } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLocationDto {
  @ApiProperty({ example: -12.0464, description: 'Latitud de la ubicación actual' })
  @IsNumber()
  @IsLatitude()
  @Type(() => Number)
  latitude!: number;

  @ApiProperty({ example: -77.0428, description: 'Longitud de la ubicación actual' })
  @IsNumber()
  @IsLongitude()
  @Type(() => Number)
  longitude!: number;

  @ApiProperty({ example: 30, required: false, description: 'Velocidad actual en km/h' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  speed?: number;

  @ApiProperty({ example: true, required: false, description: 'Indica si el repartidor está en movimiento' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isMoving?: boolean;
}