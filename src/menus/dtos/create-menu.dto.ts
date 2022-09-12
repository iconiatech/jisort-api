import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  compId: string;

  @IsString()
  menuTitle: string;

  @IsString()
  menuActionType: string;

  @IsString()
  menuActionResponseType: string;

  @IsString()
  menuAnswer: string;

  @IsNumber()
  menuNumber: number;

  @IsString()
  @IsOptional()
  menuParentId: string;

  @IsString()
  @IsOptional()
  menuCategories: string[];

  @IsBoolean()
  isActive: boolean;

  @IsString()
  inactiveMessage: string;
}
