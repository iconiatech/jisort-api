import { IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  prodNumber: string;

  @IsString()
  prodName: string;

  @IsString()
  compId: string;

  @IsNumber()
  prodStockLeft: number;

  @IsArray()
  prodCategories: string[];

  @IsBoolean()
  isActive: boolean;

  @IsString()
  inactiveMessage: string;
}
