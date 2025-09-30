import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsOptional()
  @IsBoolean()
  isMoving?: boolean;
}