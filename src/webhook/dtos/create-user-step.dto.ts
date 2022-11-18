import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateUserStepDto {
  @IsString()
  compId: string;

  @IsString()
  menuId: string;

  @IsString()
  phoneNumberFrom: string;

  @IsString()
  lastAccessTime: string;

  @IsString()
  lastAccessAction: string;

  @IsOptional()
  @IsArray()
  prevChoices: string[];
}
