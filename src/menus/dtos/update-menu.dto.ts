import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateMenuDto {
  @IsString()
  @IsOptional()
  compId: string;

  @IsString()
  @IsOptional()
  menuTitle: string;

  @IsString()
  @IsOptional()
  menuActionType: string;

  @IsString()
  @IsOptional()
  menuActionResponseType: string;

  @IsString()
  @IsOptional()
  menuAnswer: string;

  @IsNumber()
  @IsOptional()
  menuNumber: number;

  @IsString()
  @IsOptional()
  menuParentId: string;

  @IsString()
  @IsOptional()
  menuCategories: string[];

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsString()
  @IsOptional()
  inactiveMessage: string;
}
