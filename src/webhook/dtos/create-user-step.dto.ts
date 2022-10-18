import { IsString } from 'class-validator';

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
}
