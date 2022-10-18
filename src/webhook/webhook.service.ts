import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Whatsapp, checkIsValidNumber, sortMenus } from '../utils';
import {
  checkIsActiveComp,
  formatMenusResponse,
  formatProductsResponse,
  formatDetailedProductResponse,
} from './utils/helpers';

import { MenuTypes } from '../menus/types';

import { UserCart, UserCartDocument } from './user-cart.schema';
import { UserStep, UserStepDocument } from './user-steps.schema';
import { WhatsappMessageDto, CreateUserStepDto, AddToCartDto } from './dtos';

import { MenusService } from '../menus/menus.service';
import { ProductsService } from '../products/products.service';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(UserCart.name) private userCartModel: Model<UserCartDocument>,
    @InjectModel(UserStep.name) private userStepModel: Model<UserStepDocument>,
    private menusService: MenusService,
    private productsService: ProductsService,
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

  async addItemToCart(cartItemDto: AddToCartDto): Promise<UserCart> {
    const addedItem = new this.userCartModel(cartItemDto);
    return addedItem.save();
  }

  async updateUserStep(updateStepDto: CreateUserStepDto): Promise<UserStep> {
    const step = await this.getUserLastStep({
      compId: updateStepDto.compId,
      phoneNumberId: updateStepDto.phoneNumberId,
    });

    Object.assign(step, updateStepDto);

    return new this.userStepModel(step).save();
  }

  /**
   * Method to get the last step by a user
   * @param phoneNumberId the unique phone number id
   * @returns the last step if it exists, null if not
   */
  async getUserLastStep({
    compId,
    phoneNumberId,
  }: {
    phoneNumberId: string;
    compId: string;
  }): Promise<UserStep> {
    let step: UserStep | null;

    try {
      step = await this.userStepModel.findOne({ phoneNumberId, compId });
    } catch (error) {
      step = null;
    }

    return step;
  }

  async formatTopMenus(compId: string): Promise<string> {
    const topMenus = await this.menusService.getTopMostMenus(compId);
    const messageResponse = await formatMenusResponse(topMenus);

    return messageResponse;
  }

  async sendFirstStep({
    compId,
    whatsapp,
    phoneNumberId,
    phoneNumberFrom,
  }: {
    compId: string;
    whatsapp: Whatsapp;
    phoneNumberId: string;
    phoneNumberFrom: string;
  }) {
    const messageResponse = await this.formatTopMenus(compId);

    // const response = await whatsapp.sendMessageResponse({
    //   phoneNumberFrom,
    //   messageResponse,
    // });

    this.saveUserStep({
      compId,
      phoneNumberId,
      menuId: 'topMost',
      lastAccessAction: '',
      lastAccessTime: new Date().toUTCString(),
    });

    console.log('First step for user');

    return messageResponse;
  }

  async sendSecondStep({
    compId,
    whatsapp,
    senderName,
    messageBody,
    phoneNumberId,
    phoneNumberFrom,
  }: {
    compId: string;
    whatsapp: Whatsapp;
    senderName: string;
    messageBody: string;
    phoneNumberId: string;
    phoneNumberFrom: string;
  }) {
    // Check error message
    if (!checkIsValidNumber(messageBody)) {
      const errMsg = `Hello *${senderName}* in order for us to help, please reply with the appropriate options above.`;
      // const response = await whatsapp.sendMessageResponse({
      //   phoneNumberFrom,
      //   messageResponse: errMsg,
      // });
      console.log('Error message');
      return errMsg;
      // return response;
    }

    const topMenus = await this.menusService.getTopMostMenus(compId);
    const sortedMenus = sortMenus(topMenus);

    const selectedMenu = sortedMenus.filter(
      (m) => m.menuNumber === parseInt(messageBody),
    )[0];

    // Selected menus has sub meus
    if (selectedMenu.subMenus.length) {
      const subMenus = await this.menusService.findMany(selectedMenu.subMenus);
      const messageResponse = await formatMenusResponse(subMenus);
      // const response = await whatsapp.sendMessageResponse({
      //   phoneNumberFrom,
      //   messageResponse,
      // });
      this.updateUserStep({
        compId,
        phoneNumberId,
        lastAccessAction: '',
        menuId: selectedMenu.id,
        lastAccessTime: new Date().toUTCString(),
      });
      console.log(messageResponse);
      console.log('Selected menus has sub menus');
      return messageResponse;
      // return response;
    }
    //selected menus has no sub menus
    else {
      const messageResponse = selectedMenu.menuTitle;
      // const response = await whatsapp.sendMessageResponse({
      //   phoneNumberFrom,
      //   messageResponse,
      // });
      this.updateUserStep({
        compId,
        phoneNumberId,
        lastAccessAction: '',
        menuId: selectedMenu.id,
        lastAccessTime: new Date().toUTCString(),
      });
      console.log(selectedMenu.menuTitle);
      console.log('Selected menus action');
      return messageResponse;
      // return response;
    }
  }

  async sendThirdStep({
    compId,
    menuId,
    whatsapp,
    senderName,
    messageBody,
    phoneNumberId,
    phoneNumberFrom,
  }: {
    menuId: string;
    compId: string;
    whatsapp: Whatsapp;
    senderName: string;
    messageBody: string;
    phoneNumberId: string;
    phoneNumberFrom: string;
  }) {
    const selectedMenu = await this.menusService.findOne(menuId);

    if (selectedMenu.subMenus.length) {
      const subMenus = await this.menusService.findMany(selectedMenu.subMenus);
      const messageResponse = await formatMenusResponse(subMenus);
      // const response = await whatsapp.sendMessageResponse({
      //   phoneNumberFrom,
      //   messageResponse,
      // });
      this.updateUserStep({
        compId,
        phoneNumberId,
        lastAccessAction: '',
        menuId: selectedMenu.id,
        lastAccessTime: new Date().toUTCString(),
      });
      console.log(messageResponse);
      console.log('Selected menus has sub menus');
      return messageResponse;
      // return response;
    }

    if (selectedMenu.menuActionType === MenuTypes.PRODUCTS) {
      const menuProducts = await this.productsService.getMenuProducts(
        selectedMenu.id,
      );
      const messageResponse = await formatProductsResponse(menuProducts);
      const response = await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse,
      });
      this.updateUserStep({
        compId,
        phoneNumberId,
        menuId: selectedMenu.id,
        lastAccessAction: 'viewProduct',
        lastAccessTime: new Date().toUTCString(),
      });
      console.log(messageResponse);
      return '';
    }
  }

  async sendProductDetailsStep({
    compId,
    menuId,
    whatsapp,
    senderName,
    messageBody,
    phoneNumberId,
    phoneNumberFrom,
  }: {
    menuId: string;
    compId: string;
    whatsapp: Whatsapp;
    senderName: string;
    messageBody: string;
    phoneNumberId: string;
    phoneNumberFrom: string;
  }) {
    const selectedMenu = await this.menusService.findOne(menuId);

    // Check error message
    if (!checkIsValidNumber(messageBody)) {
      const errMsg = `Hello *${senderName}* in order for us to help, please reply with the appropriate options above.`;
      await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse: errMsg,
      });
      return errMsg;
    }

    const menuProducts = await this.productsService.getMenuProducts(
      selectedMenu.id,
    );

    const selectedProduct = menuProducts[parseInt(messageBody) - 1];
    const messageResponse = await formatDetailedProductResponse(
      selectedProduct,
    );
    await whatsapp.sendMessageResponse({
      phoneNumberFrom,
      messageResponse,
    });
    this.updateUserStep({
      compId,
      phoneNumberId,
      menuId: selectedMenu.id,
      lastAccessAction: 'addToCart',
      lastAccessTime: new Date().toUTCString(),
    });

    console.log(selectedProduct);
    return '';
  }

  async sendAddToCartStep({
    compId,
    menuId,
    whatsapp,
    senderName,
    messageBody,
    phoneNumberId,
    phoneNumberFrom,
  }: {
    menuId: string;
    compId: string;
    whatsapp: Whatsapp;
    senderName: string;
    messageBody: string;
    phoneNumberId: string;
    phoneNumberFrom: string;
  }) {
    const selectedMenu = await this.menusService.findOne(menuId);

    // Check error message
    if (!checkIsValidNumber(messageBody)) {
      const errMsg = `Hello *${senderName}* in order for us to help, please reply with the appropriate options above.`;
      await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse: errMsg,
      });
      return errMsg;
    }

    const menuProducts = await this.productsService.getMenuProducts(
      selectedMenu.id,
    );

    const selectedProduct = menuProducts[parseInt(messageBody) - 1];
    const messageResponse = await formatDetailedProductResponse(
      selectedProduct,
    );

    await whatsapp.sendButtonResponse({
      phoneNumberFrom,
      messageResponse,
    });

    await this.addItemToCart({
      compId,
      phoneNumberId,
      productId: selectedProduct.id,
      productQty: parseInt(messageBody),
      lastAccessTime: new Date().toUTCString(),
    });

    await this.updateUserStep({
      compId,
      phoneNumberId,
      menuId: selectedMenu.id,
      lastAccessAction: 'addToCart',
      lastAccessTime: new Date().toUTCString(),
    });

    console.log(selectedProduct);
    return '';
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

    const isCompActive = await checkIsActiveComp(company);

    if (!isCompActive) {
      const response = await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse: company.inactiveMessage,
      });

      return response;
    }

    /**
     * =====================================
     *  Should be it's own function
     * =====================================
     */

    const userLastStep = await this.getUserLastStep({
      phoneNumberId,
      compId: company.id,
    });

    console.log(userLastStep);

    if (!userLastStep) {
      return await this.sendFirstStep({
        whatsapp,
        phoneNumberId,
        phoneNumberFrom,
        compId: company.id,
      });
    } else {
      if (userLastStep.menuId === 'topMost') {
        return await this.sendSecondStep({
          whatsapp,
          senderName,
          messageBody,
          phoneNumberId,
          phoneNumberFrom,
          compId: company.id,
        });
      } else {
        if (userLastStep.lastAccessAction === 'viewProduct') {
          return await this.sendProductDetailsStep({
            whatsapp,
            senderName,
            messageBody,
            phoneNumberId,
            phoneNumberFrom,
            compId: company.id,
            menuId: userLastStep.menuId,
          });
        }

        if (userLastStep.lastAccessAction === 'addToCart') {
          return await this.sendAddToCartStep({
            whatsapp,
            senderName,
            messageBody,
            phoneNumberId,
            phoneNumberFrom,
            compId: company.id,
            menuId: userLastStep.menuId,
          });
        }

        return await this.sendThirdStep({
          whatsapp,
          senderName,
          messageBody,
          phoneNumberId,
          phoneNumberFrom,
          compId: company.id,
          menuId: userLastStep.menuId,
        });
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
