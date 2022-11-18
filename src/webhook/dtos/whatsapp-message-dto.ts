import { IsString } from 'class-validator';

export class WhatsappMessageDto {
  @IsString()
  messageId: string;

  @IsString()
  senderName: string;

  @IsString()
  messageBody: string;

  @IsString()
  phoneNumberId: string;

  @IsString()
  phoneNumberFrom: string;

  @IsString()
  displayPhoneNumber: string;
}
