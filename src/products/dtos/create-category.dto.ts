import { IsString, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  catName: string;

  @IsString()
  compId: string;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  inactiveMessage: string;
}
