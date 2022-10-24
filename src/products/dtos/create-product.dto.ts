import { IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  prodNumber: string;

  @IsString()
  prodName: string;

  @IsString()
  compId: string;

  @IsString()
  prodPrice: number;

  @IsNumber()
  prodStockLeft: number;

  @IsNumber()
  prodMenuNumber: number;

  @IsArray()
  prodCategories: string[];

  @IsBoolean()
  isActive: boolean;

  @IsString()
  inactiveMessage: string;
}
