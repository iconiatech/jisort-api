import { IsString, IsNumber } from 'class-validator';

export class AddToCartDto {
  @IsString()
  compId: string;

  @IsString()
  productId: string;

  @IsNumber()
  productQty: number;

  @IsString()
  phoneNumberId: string;

  @IsString()
  lastAccessTime: string;
}
