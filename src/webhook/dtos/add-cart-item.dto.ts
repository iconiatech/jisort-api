import { IsString, IsNumber } from 'class-validator';

export class AddToCartDto {
  @IsString()
  compId: string;

  @IsString()
  productId: string;

  @IsNumber()
  productQty: number;

  @IsString()
  productName: string;

  @IsNumber()
  productPrice: number;

  @IsString()
  phoneNumberFrom: string;

  @IsString()
  lastAccessTime: string;
}
