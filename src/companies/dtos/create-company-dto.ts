import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  compName: string;

  @IsString()
  compPhone: string;

  @IsString()
  compWhatsappNo: string;

  @IsNumber()
  @IsOptional()
  compTillNo: number;

  @IsString()
  compDescription: string;

  @IsString()
  compLocation: string;

  @IsString()
  compType: string;

  @IsBoolean()
  isActive: string;

  @IsString()
  inactiveMessage: string;

  @IsString()
  compOpeningTime: string;

  @IsString()
  compClosingTime: string;
}
