import { IsString } from 'class-validator';

export class CreateUserStepDto {
  @IsString()
  menuId: string;

  @IsString()
  phoneNumberId: string;

  @IsString()
  lastAccessTime: string;
}
