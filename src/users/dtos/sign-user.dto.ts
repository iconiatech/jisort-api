import { IsString, IsEmail } from 'class-validator';

export class SignInUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
