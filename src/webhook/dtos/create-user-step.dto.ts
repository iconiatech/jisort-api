import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateUserStepDto {
  @IsString()
  compId: string;

  @IsString()
  menuId: string;

  @IsString()
  phoneNumberId: string;

  @IsString()
  lastAccessTime: string;

  @IsString()
  lastAccessAction: string;

  @IsOptional()
  @IsArray()
  prevSteps: string[];
}
