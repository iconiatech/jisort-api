import axios from 'axios';
import { WhatsappBtn } from './globalTypes';

export class Whatsapp {
  bearerToken: string;
  phoneNumberId: string;
  displayPhoneNumber: string;

  constructor({
    bearerToken,
    phoneNumberId,
    displayPhoneNumber,
  }: {
    bearerToken: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
  }) {
    this.bearerToken = bearerToken;
    this.phoneNumberId = phoneNumberId;
    this.displayPhoneNumber = displayPhoneNumber;
  }

  async markMessageRead(msgId: string): Promise<string> {
    const fbUrl = `https://graph.facebook.com/v12.0/${this.phoneNumberId}/messages`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.bearerToken}`,
      },
    };

    const payload = {
      status: 'read',
      message_id: msgId,
      messaging_product: 'whatsapp',
    };

    const response = await axios.post<string>(fbUrl, payload, config);
    const respData = response.data;

    return respData;
  }

  async sendMessageResponse({
    messageResponse,
    phoneNumberFrom,
  }: {
    phoneNumberFrom: string;
    messageResponse: string;
  }): Promise<string> {
    const fbUrl = `https://graph.facebook.com/v12.0/${this.phoneNumberId}/messages`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.bearerToken}`,
      },
    };

    const payload = {
      to: `${phoneNumberFrom}`,
      messaging_product: 'whatsapp',
      text: { body: `${messageResponse}` },
    };

    const response = await axios.post<string>(fbUrl, payload, config);
    const respData = response.data;

    return respData;
  }

  async sendButtonResponse({
    buttons,
    messageResponse,
    phoneNumberFrom,
  }: {
    buttons: WhatsappBtn[];
    messageResponse: string;
    phoneNumberFrom: string;
  }): Promise<string> {
    const fbUrl = `https://graph.facebook.com/v12.0/${this.phoneNumberId}/messages`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.bearerToken}`,
      },
    };

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: `${phoneNumberFrom}`,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `${messageResponse}`,
        },
        action: {
          buttons,
        },
      },
    };

    const response = await axios.post<string>(fbUrl, payload, config);
    const respData = response.data;

    return respData;
  }
}
