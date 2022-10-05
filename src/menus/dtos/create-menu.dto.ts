import {
  IsArray,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  ArrayMinSize,
} from 'class-validator';

export class CreateMenuDto {
  @IsString()
  compId: string;

  @IsString()
  menuTitle: string;

  @IsString()
  menuActionType: string;

  @IsBoolean()
  menuIsTopMost: boolean;

  @IsString()
  menuActionResponseType: string;

  @IsString()
  menuAnswer: string;

  @IsNumber()
  @IsOptional()
  menuNumber: number;

  @IsString()
  @IsOptional()
  menuParentId: string;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  inactiveMessage: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  menuProductCategories: string[];
}
