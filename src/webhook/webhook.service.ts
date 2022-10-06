import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Whatsapp, checkIsValidNumber, sortMenus } from '../utils';

import { Menu } from '../menus/menus.schema';

import { WhatsappMessageDto, CreateUserStepDto } from './dtos';
import { UserStep, UserStepDocument } from './user-steps.schema';

import { MenusService } from '../menus/menus.service';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(UserStep.name) private userStepModel: Model<UserStepDocument>,
    private menusService: MenusService,
    private companiesService: CompaniesService,
  ) {}

  /**
   * The method to create user step
   *
   * @param createStepDto the user step dto
   * @returns the created user step
   */
  async saveUserStep(createStepDto: CreateUserStepDto): Promise<UserStep> {
    const createdStep = new this.userStepModel(createStepDto);
    return createdStep.save();
  }

  /**
   * Method to get the last step by a user
   * @param phoneNumberId the unique phone number id
   * @returns the last step if it exists, null if not
   */
  async getUserLastStep(phoneNumberId: string): Promise<UserStep> {
    let step: UserStep | null;

    try {
      step = await this.userStepModel.findOne({ phoneNumberId });
    } catch (error) {
      step = null;
    }

    return step;
  }

  async formatMenusResponse(menus: Menu[]): Promise<string> {
    let newStr = ``;

    const sortedMenus = sortMenus(menus);

    sortedMenus.forEach((menu, i) => {
      const item = `\n*${i + 1}*. ${menu.menuTitle}`;
      newStr += item;
    });

    const messageResponse = `
        *Main Menu*:\n(NB: Please enter the appropriate number in the *Main Menu* then click send to continue)
        ${newStr}
        `;

    return messageResponse;
  }

  /**
   * Handle response from the whatsapp API and format response to user
   * @param messageDto The message details from whatsapp
   * @returns the formatted message
   */
  async webhook(messageDto: WhatsappMessageDto): Promise<string> {
    const {
      messageId,
      messageBody,
      senderName,
      phoneNumberId,
      phoneNumberFrom,
      displayPhoneNumber,
    } = messageDto;

    const company = await this.companiesService.findByPhoneNumber(
      displayPhoneNumber,
    );

    const whatsapp = new Whatsapp({
      phoneNumberId,
      displayPhoneNumber,
      bearerToken: company.compBearerToken,
    });

    await whatsapp.markMessageRead(messageId);

    /**
     * =====================================
     *  Should be it's own function
     * =====================================
     */

    const userLastStep = await this.getUserLastStep(phoneNumberId);

    if (!userLastStep) {
      this.saveUserStep({
        lastAccessTime: new Date().toUTCString(),
        menuId: 'topMost',
        phoneNumberId,
      });
      const topMenus = await this.menusService.getTopMostMenus(company.id);
      const messageResponse = await this.formatMenusResponse(topMenus);
      const response = await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse,
      });
      return response;
    } else {
      if (userLastStep.menuId === 'topMost') {
        if (!checkIsValidNumber(messageBody)) {
          const errMsg = `Hello *${senderName}* in order for us to help, please reply with the appropriate options above.`;
          const response = await whatsapp.sendMessageResponse({
            phoneNumberFrom,
            messageResponse: errMsg,
          });
          return response;
        }

        const topMenus = await this.menusService.getTopMostMenus(company.id);
        const sortedMenus = sortMenus(topMenus);

        const selectedMenu = sortedMenus.filter(
          (m) => m.menuNumber === parseInt(messageBody),
        )[0];

        if (selectedMenu.subMenus.length) {
          const messageResponse = await this.formatMenusResponse(topMenus);
          const response = await whatsapp.sendMessageResponse({
            phoneNumberFrom,
            messageResponse,
          });
          return response;
        } else {
          const messageResponse = selectedMenu.menuTitle;
          const response = await whatsapp.sendMessageResponse({
            phoneNumberFrom,
            messageResponse,
          });
          return response;
        }
      }
    }

    /**
     * =====================================
     *  Should be it's own function
     * =====================================
     */

    return 'userLastStep';
  }
}
