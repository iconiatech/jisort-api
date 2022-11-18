import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { MenuActionType, WhatsappBtn } from '../utils/globalTypes';
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
  formatProductCartResponse,
  formatDetailedProductResponse,
} from './utils/helpers';

// import { MenuTypes } from '../menus/types';
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

  async updateUserCartItem(
    cartItemDto: AddToCartDto,
    qty: number,
  ): Promise<UserCart> {
    cartItemDto.productQty = qty;

    return new this.userCartModel(cartItemDto).save();
  }

  async getUserCartItems({
    compId,
    phoneNumberFrom,
  }: {
    compId: string;
    phoneNumberFrom: string;
  }): Promise<UserCart[]> {
    return this.userCartModel
      .find({
        compId,
        phoneNumberFrom,
      })
      .exec();
  }

  async checkUserCartItem({
    compId,
    productId,
    phoneNumberFrom,
  }: {
    compId: string;
    productId: string;
    phoneNumberFrom: string;
  }): Promise<UserCart | null> {
    let item: UserCart | null = null;
    try {
      item = await this.userCartModel.findOne({
        compId,
        productId,
        phoneNumberFrom,
      });
    } catch (error) {
      item = null;
    }

    return item;
  }

  async updateUserStep(updateStepDto: CreateUserStepDto): Promise<UserStep> {
    const step = await this.getUserLastStep({
      compId: updateStepDto.compId,
      phoneNumberFrom: updateStepDto.phoneNumberFrom,
    });

    Object.assign(step, updateStepDto);

    return new this.userStepModel(step).save();
  }

  async deleteUserStep({
    compId,
    phoneNumberFrom,
  }: {
    compId: string;
    phoneNumberFrom: string;
  }) {
    await this.userStepModel.deleteOne({ compId, phoneNumberFrom }).exec();
    return;
  }

  async getUserLastStep({
    compId,
    phoneNumberFrom,
  }: {
    compId: string;
    phoneNumberFrom: string;
  }): Promise<UserStep> {
    let step: UserStep | null;

    try {
      step = await this.userStepModel.findOne({ phoneNumberFrom, compId });
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

    const backButton: WhatsappBtn = {
      type: 'reply',
      reply: {
        id: 'back',
        title: 'Back',
      },
    };

    const mainMenuBtn: WhatsappBtn = {
      type: 'reply',
      reply: {
        id: 'mainMenu',
        title: 'Back to Main Menu',
      },
    };

    const buttons = [selectedMenu.menuIsTopMost && backButton, mainMenuBtn];

    await whatsapp.sendButtonResponse({
      buttons,
      phoneNumberFrom,
      messageResponse,
    });

    return;
  }

  async sendTopMenus({
    compId,
    whatsapp,
    phoneNumberFrom,
  }: {
    compId: string;
    whatsapp: Whatsapp;
    phoneNumberFrom: string;
  }) {
    const messageResponse = await this.formatTopMenus(compId);

    await whatsapp.sendMessageResponse({
      phoneNumberFrom,
      messageResponse,
    });

    this.saveUserStep({
      compId,
      phoneNumberFrom,
      menuId: 'secondStep',
      lastAccessAction: '',
      lastAccessTime: new Date().toUTCString(),
      prevChoices: [],
    });

    return;
  }

  async sendSecondStep({
    compId,
    whatsapp,
    senderName,
    messageBody,
    phoneNumberFrom,
  }: {
    compId: string;
    whatsapp: Whatsapp;
    senderName: string;
    messageBody: string;
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

        const mainMenuBtn: WhatsappBtn = {
          type: 'reply',
          reply: {
            id: 'mainMenu',
            title: 'Back to Main Menu',
          },
        };

        await whatsapp.sendButtonResponse({
          phoneNumberFrom,
          messageResponse,
          buttons: [mainMenuBtn],
        });

        this.updateUserStep({
          compId,
          phoneNumberFrom,
          menuId: selectedMenu.id,
          lastAccessAction: 'subMenu',
          lastAccessTime: new Date().toUTCString(),
          prevChoices: [],
        });

        return;
      }

      await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse: 'Sorry, there are no more options',
      });

      return;
    }
    // Handle menu answer
    if (selectedMenu.menuActionType === MenuActionType.ANSWER) {
      await this.sendMenuAction({ selectedMenu, phoneNumberFrom, whatsapp });
      await this.deleteUserStep({ compId, phoneNumberFrom });
      await this.sendTopMenus({
        compId,
        whatsapp,
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
        phoneNumberFrom,
        menuId: selectedMenu.id,
        lastAccessAction: 'viewProduct',
        lastAccessTime: new Date().toUTCString(),
        prevChoices: [],
      });

      return;
    }
    // Handle ticket
    if (selectedMenu.menuActionType === MenuActionType.TICKET) {
      console.log('Handle tickets');
      return;
    }
  }

  async sendProductDetailsStep({
    compId,
    menuId,
    whatsapp,
    senderName,
    messageBody,
    phoneNumberFrom,
  }: {
    menuId: string;
    compId: string;
    whatsapp: Whatsapp;
    senderName: string;
    messageBody: string;
    phoneNumberFrom: string;
  }) {
    const selectedMenu = await this.menusService.findOne(menuId);

    if (messageBody === 'back' || messageBody === 'mainMenu') {
      // Send back the top menu
      await this.sendTopMenus({
        compId,
        whatsapp,
        phoneNumberFrom,
      });

      // Clear steps if this is a top menu
      if (selectedMenu.menuIsTopMost) {
        await this.deleteUserStep({
          compId,
          phoneNumberFrom,
        });
      }

      return;
    }

    // Check error message
    if (!checkIsValidNumber(messageBody)) {
      const errMsg = `Hello *${senderName}* in order for us to help, please reply with the appropriate options above.`;
      await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse: errMsg,
      });
      return errMsg;
    }

    const clientResp = parseInt(messageBody);

    const menuProducts = await this.productsService.getMenuProducts(
      selectedMenu.id,
    );

    const sortedProducts = sortProducts(menuProducts);

    if (clientResp > sortedProducts.length) {
      await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse: 'Please respond with the one of the options above',
      });

      return;
    }

    const selectedProduct = sortedProducts[clientResp - 1];

    const messageResponse = await formatDetailedProductResponse(
      selectedProduct,
    );

    const productsBtn: WhatsappBtn = {
      type: 'reply',
      reply: {
        id: 'back',
        title: 'All Products',
      },
    };

    const mainMenuBtn: WhatsappBtn = {
      type: 'reply',
      reply: {
        id: 'mainMenu',
        title: 'Main Menu',
      },
    };

    const buttons = [productsBtn, mainMenuBtn];

    await whatsapp.sendButtonResponse({
      buttons,
      phoneNumberFrom,
      messageResponse,
    });

    await this.updateUserStep({
      compId,
      phoneNumberFrom,
      menuId: selectedMenu.id,
      lastAccessTime: new Date().toUTCString(),
      lastAccessAction: 'cartResponse',
      prevChoices: [`${clientResp}`],
    });

    return;
  }

  async sendCartResponseStep({
    compId,
    menuId,
    whatsapp,
    prevChoice,
    messageBody,
    phoneNumberFrom,
  }: {
    menuId: string;
    compId: string;
    whatsapp: Whatsapp;
    senderName: string;
    prevChoice: number;
    messageBody: string;
    phoneNumberFrom: string;
  }) {
    const selectedMenu = await this.menusService.findOne(menuId);

    // Check if number to add to cart
    if (checkIsValidNumber(messageBody)) {
      const menuProducts = await this.productsService.getMenuProducts(
        selectedMenu.id,
      );

      const clientResp = parseInt(messageBody);
      const sortedProducts = sortProducts(menuProducts);
      const selectedProduct = sortedProducts[prevChoice - 1];

      if (clientResp > selectedProduct.prodStockLeft) {
        await whatsapp.sendMessageResponse({
          phoneNumberFrom,
          messageResponse: `Stock left is *${selectedProduct.prodStockLeft}*.`,
        });

        return;
      }

      const exists = await this.checkUserCartItem({
        compId,
        phoneNumberFrom,
        productId: selectedProduct.id,
      });

      if (exists) {
        const newQty = exists.productQty + clientResp;
        await this.updateUserCartItem(exists, newQty);
      } else {
        await this.addItemToCart({
          compId,
          phoneNumberFrom,
          productQty: clientResp,
          productId: selectedProduct.id,
          productName: selectedProduct.prodName,
          productPrice: selectedProduct.prodPrice,
          lastAccessTime: new Date().toUTCString(),
        });
      }

      const cartItems = await this.getUserCartItems({
        compId,
        phoneNumberFrom,
      });

      const messageResponse = await formatProductCartResponse(cartItems);

      const productsBtn: WhatsappBtn = {
        type: 'reply',
        reply: {
          id: 'back',
          title: 'All Products',
        },
      };

      const mainMenuBtn: WhatsappBtn = {
        type: 'reply',
        reply: {
          id: 'mainMenu',
          title: 'Main Menu',
        },
      };

      const payButton: WhatsappBtn = {
        type: 'reply',
        reply: {
          id: 'pay',
          title: 'Proceed to Pay',
        },
      };

      const buttons = [payButton, productsBtn, mainMenuBtn];

      await whatsapp.sendButtonResponse({
        buttons,
        phoneNumberFrom,
        messageResponse,
      });

      return;
    }

    // Send back to view all menu products
    if (messageBody === 'back') {
      await this.sendMenuProducts({
        whatsapp,
        selectedMenu,
        phoneNumberFrom,
      });

      await this.updateUserStep({
        compId,
        phoneNumberFrom,
        menuId: selectedMenu.id,
        lastAccessAction: 'viewProduct',
        lastAccessTime: new Date().toUTCString(),
        prevChoices: [],
      });

      return;
    }

    // Send top menu
    if (messageBody === 'mainMenu') {
      await this.deleteUserStep({
        compId,
        phoneNumberFrom,
      });

      await this.sendTopMenus({
        compId,
        whatsapp,
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

  async sendSubMenuResponseStep({
    compId,
    menuId,
    whatsapp,
    senderName,
    messageBody,
    phoneNumberFrom,
  }: {
    menuId: string;
    compId: string;
    whatsapp: Whatsapp;
    senderName: string;
    messageBody: string;
    phoneNumberFrom: string;
  }) {
    // Send top menu
    if (messageBody === 'mainMenu') {
      await this.deleteUserStep({
        compId,
        phoneNumberFrom,
      });

      await this.sendTopMenus({
        compId,
        whatsapp,
        phoneNumberFrom,
      });

      return;
    }

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

    const selectedMenu = await this.menusService.findOne(menuId);
    const subMenus = await this.menusService.findMany(selectedMenu.subMenus);

    if (resp > subMenus.length) {
      await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse: 'Please respond with the one of the options above',
      });
    }

    const currentMenu = sortMenus(subMenus)[resp - 1];

    // Handle menu answer
    if (currentMenu.menuActionType === MenuActionType.ANSWER) {
      await this.sendMenuAction({
        whatsapp,
        phoneNumberFrom,
        selectedMenu: currentMenu,
      });

      const messageResponse = await formatMenusResponse(subMenus);

      await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse,
      });

      return;
    }

    // Handle menu products
    if (currentMenu.menuActionType === MenuActionType.PRODUCTS) {
      await this.sendMenuProducts({
        whatsapp,
        phoneNumberFrom,
        selectedMenu: currentMenu,
      });

      await this.updateUserStep({
        compId,
        phoneNumberFrom,
        menuId: currentMenu.id,
        lastAccessAction: 'viewProduct',
        lastAccessTime: new Date().toUTCString(),
        prevChoices: [],
      });

      return;
    }

    // Handle sub menus
    if (currentMenu.menuActionType === MenuActionType.SUBMENUS) {
      // Selected menus has sub meus
      if (currentMenu.subMenus.length) {
        const currentSubMenus = await this.menusService.findMany(
          currentMenu.subMenus,
        );

        const messageResponse = await formatMenusResponse(currentSubMenus);

        const mainMenuBtn: WhatsappBtn = {
          type: 'reply',
          reply: {
            id: 'mainMenu',
            title: 'Back to Main Menu',
          },
        };

        await whatsapp.sendButtonResponse({
          phoneNumberFrom,
          messageResponse,
          buttons: [mainMenuBtn],
        });

        this.updateUserStep({
          compId,
          phoneNumberFrom,
          menuId: currentMenu.id,
          lastAccessAction: 'subMenu',
          lastAccessTime: new Date().toUTCString(),
          prevChoices: [],
        });

        return;
      }

      await whatsapp.sendMessageResponse({
        phoneNumberFrom,
        messageResponse: 'Sorry, there are no more options',
      });

      return;
    }

    return;
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
      phoneNumberFrom,
      compId: company.id,
    });

    if (!userLastStep) {
      await this.sendTopMenus({
        whatsapp,
        phoneNumberFrom,
        compId: company.id,
      });

      return;
    }

    if (userLastStep.menuId === 'secondStep') {
      return await this.sendSecondStep({
        whatsapp,
        senderName,
        messageBody,
        phoneNumberFrom,
        compId: company.id,
      });
    }

    if (userLastStep.lastAccessAction === 'viewProduct') {
      return await this.sendProductDetailsStep({
        whatsapp,
        senderName,
        messageBody,
        phoneNumberFrom,
        compId: company.id,
        menuId: userLastStep.menuId,
      });
    }

    if (userLastStep.lastAccessAction === 'cartResponse') {
      await this.sendCartResponseStep({
        whatsapp,
        senderName,
        messageBody,
        phoneNumberFrom,
        compId: company.id,
        menuId: userLastStep.menuId,
        prevChoice: parseInt(
          userLastStep.prevChoices[userLastStep.prevChoices.length - 1],
        ),
      });

      return;
    }

    if (userLastStep.lastAccessAction === 'subMenu') {
      return await this.sendSubMenuResponseStep({
        whatsapp,
        senderName,
        messageBody,
        phoneNumberFrom,
        compId: company.id,
        menuId: userLastStep.menuId,
      });
    }

    return 'userLastStep';
  }
}
