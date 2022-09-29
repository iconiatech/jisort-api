import { Injectable } from '@nestjs/common';

import { Whatsapp } from '../utils';
import { WhatsappMessageDto } from './dtos';

@Injectable()
export class WebhookService {
  async webhook(message: WhatsappMessageDto): Promise<string> {
    const whatsapp = new Whatsapp({
      bearerToken: `EABPK7nFQpeoBAN5xVWug6ZAeISY3ryr4OmHu59WbLSP3aFS8oVfJzmcBzphyUezfrIHxU5PyR8mq5SRJEjnt4coV75ccTMxVGStYAsJSD5TegXcRY7NbxPZAOrrgYRWURZAKAgpKNLgDMcA53NTlWksoH0W0yirmQKOb1oNyK3tEKA8rLDzPWz1ZAHiX1gNi2vV7fHb1fgZDZD`,
      phoneNumberId: message.phoneNumberId,
      displayPhoneNumber: message.displayPhoneNumber,
    });

    await whatsapp.markMessageRead(message.messageId);

    const response = await whatsapp.sendMessageResponse({
      phoneNumberFrom: message.phoneNumberFrom,
      messageResponse: `Hello ${message.senderName} how may I help you today?`,
    });

    return response;
  }
}
