import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  compName: string;

  @IsOptional()
  @IsString()
  compPhone: string;

  @IsOptional()
  @IsString()
  compWhatsappNo: string;

  @IsOptional()
  @IsNumber()
  compTillNo: number;

  @IsOptional()
  @IsString()
  compDescription: string;

  @IsOptional()
  @IsString()
  compLocation: string;

  @IsOptional()
  @IsString()
  compType: string;

  @IsOptional()
  @IsString()
  compBearerToken: string;

  @IsOptional()
  @IsBoolean()
  isActive: string;

  @IsOptional()
  @IsString()
  inactiveMessage: string;

  @IsOptional()
  @IsString()
  compOpeningTime: string;

  @IsOptional()
  @IsString()
  compClosingTime: string;
}
