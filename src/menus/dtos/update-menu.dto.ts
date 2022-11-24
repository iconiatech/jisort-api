import {
  IsArray,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  menuIsTopMost: boolean;

  @IsString()
  @IsOptional()
  menuActionResponseType: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  subMenus: string[];

  @IsNumber()
  @IsOptional()
  menuNumber: number;

  @IsString()
  @IsOptional()
  menuParentId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  menuProductCategories: string[];

  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @IsString()
  @IsOptional()
  inactiveMessage: string;
}
