import { Controller, Post, Body } from '@nestjs/common';

import { WhatsappMessageDto } from './dtos';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post()
  async webhook(@Body() body: WhatsappMessageDto) {
    await this.webhookService.webhook(body);
    return 'Success';
  }
}
