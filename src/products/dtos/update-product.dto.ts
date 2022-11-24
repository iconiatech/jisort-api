import { IsString, IsNumber, IsBoolean, IsArray, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  prodNumber: string;

  @IsOptional()
  @IsString()
  prodName: string;

  @IsOptional()
  @IsString()
  compId: string;

  @IsOptional()
  @IsString()
  prodPrice: number;

  @IsOptional()
  @IsNumber()
  prodStockLeft: number;

  @IsOptional()
  @IsNumber()
  prodMenuNumber: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prodCategories: string[];

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  inactiveMessage: string;
}
