import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { MenuActionType } from '../utils/globalTypes';
import {
  Whatsapp,
  sortMenus,
  sortProducts,
  checkIsValidNumber,
} from '../utils';
import {
  checkIsActiveComp,
  formatMenusResponse,
  formatProductsResponse,
  formatDetailedProductResponse,
} from './utils/helpers';

import { MenuTypes } from '../menus/types';
import { Menu } from '../menus/menus.schema';

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

  async deleteUserStep({
    compId,
    phoneNumberId,
  }: {
    phoneNumberId: string;
    compId: string;
  }) {
    await this.userStepModel.deleteOne({ compId, phoneNumberId }).exec();
    return;
  }

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

  /**
   * =============================
   * Reusable functions start here
   * =============================
   */

  async formatTopMenus(compId: string): Promise<string> {
    const topMenus = await this.menusService.getTopMostMenus(compId);
    const messageResponse = await formatMenusResponse(topMenus);

    return messageResponse;
  }

  async sendMenuAction({
    whatsapp,
    selectedMenu,
    phoneNumberFrom,
  }: {
    whatsapp: Whatsapp;
    selectedMenu: Menu;
    phoneNumberFrom: string;
  }) {
    const messageResponse = selectedMenu.menuAnswer;

    await whatsapp.sendMessageResponse({
      phoneNumberFrom,
      messageResponse,
    });

    return;
  }

  async sendMenuProducts({
    whatsapp,
    selectedMenu,
    phoneNumberFrom,
  }: {
    whatsapp: Whatsapp;
    selectedMenu: Menu;
    phoneNumberFrom: string;
  }) {
    // No products to display
    if (!selectedMenu.menuProductCategories.length) {
      const response = 'Sorry there are no products to display currently.';
      await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse: response,
      });
      return;
    }

    const menuProducts = await this.productsService.getMenuProducts(
      selectedMenu.id,
    );

    const messageResponse = await formatProductsResponse(menuProducts);

    await whatsapp.sendMessageResponse({
      phoneNumberFrom,
      messageResponse,
    });

    return;
  }

  async sendTopMenus({
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

    await whatsapp.sendMessageResponse({
      phoneNumberFrom,
      messageResponse,
    });

    this.saveUserStep({
      compId,
      phoneNumberId,
      menuId: 'topMost',
      lastAccessAction: '',
      lastAccessTime: new Date().toUTCString(),
    });

    return;
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
      await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse: errMsg,
      });
      console.log(errMsg);
      return errMsg;
    }

    const topMenus = await this.menusService.getTopMostMenus(compId);
    const sortedMenus = sortMenus(topMenus);

    const selectedMenu = sortedMenus.filter(
      (m) => m.menuNumber === parseInt(messageBody),
    )[0];

    // Handle sub menus
    if (selectedMenu.menuActionType === MenuActionType.SUBMENUS) {
      // Selected menus has sub meus
      if (selectedMenu.subMenus.length) {
        const subMenus = await this.menusService.findMany(
          selectedMenu.subMenus,
        );
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
      }
    }
    // Handle menu answer
    if (selectedMenu.menuActionType === MenuActionType.ANSWER) {
      await this.sendMenuAction({ selectedMenu, phoneNumberFrom, whatsapp });
      await this.deleteUserStep({ compId, phoneNumberId });
      await this.sendTopMenus({
        compId,
        whatsapp,
        phoneNumberId,
        phoneNumberFrom,
      });
      return;
    }
    // Handle menu products
    if (selectedMenu.menuActionType === MenuActionType.PRODUCTS) {
      await this.sendMenuProducts({
        whatsapp,
        selectedMenu,
        phoneNumberFrom,
      });

      await this.updateUserStep({
        compId,
        phoneNumberId,
        menuId: selectedMenu.id,
        lastAccessAction: 'viewProduct',
        lastAccessTime: new Date().toUTCString(),
      });

      return;
    }
    // Handle ticket
    if (selectedMenu.menuActionType === MenuActionType.TICKET) {
      console.log('Handle tickets');
      return;
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

    const sortedProducts = sortProducts(menuProducts);

    const selectedProduct = sortedProducts[parseInt(messageBody) - 1];

    const messageResponse = await formatDetailedProductResponse(
      selectedProduct,
    );

    await whatsapp.sendMessageResponse({
      phoneNumberFrom,
      messageResponse,
    });

    await this.updateUserStep({
      compId,
      phoneNumberId,
      menuId: selectedMenu.id,
      lastAccessTime: new Date().toUTCString(),
      lastAccessAction: 'productDetailsResponse',
    });

    return;
  }

  async sendProductDetailsResponseStep({
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

    const resp = parseInt(messageBody);

    if (resp === 1) {
      console.log('Proceed to cart');
      return;
    }

    // Send back to view all menu products
    if (resp === 2) {
      await this.sendMenuProducts({
        whatsapp,
        selectedMenu,
        phoneNumberFrom,
      });

      await this.updateUserStep({
        compId,
        phoneNumberId,
        menuId: selectedMenu.id,
        lastAccessAction: 'viewProduct',
        lastAccessTime: new Date().toUTCString(),
      });

      return;
    }

    // Send top menu
    if (resp === 3) {
      await this.deleteUserStep({
        compId,
        phoneNumberId,
      });

      await this.sendTopMenus({
        compId,
        whatsapp,
        phoneNumberId,
        phoneNumberFrom,
      });

      return;
    }

    await whatsapp.sendMessageResponse({
      phoneNumberFrom,
      messageResponse: 'Please respond with the one of the options above',
    });

    return;
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

    const userLastStep = await this.getUserLastStep({
      phoneNumberId,
      compId: company.id,
    });

    if (!userLastStep) {
      await this.sendTopMenus({
        whatsapp,
        phoneNumberId,
        phoneNumberFrom,
        compId: company.id,
      });

      return;
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

        if (userLastStep.lastAccessAction === 'productDetailsResponse') {
          return await this.sendProductDetailsResponseStep({
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
