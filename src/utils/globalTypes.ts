export enum MenuActionType {
  TICKET = 'ticket',
  ANSWER = 'answer',
  SUBMENUS = 'subMenus',
  PRODUCTS = 'products',
}

export enum MenuResponseType {
  NUMBER = 'number',
  STRING = 'string',
  NONE = 'none',
}

export enum UserStepsType {
  SUBMENU = 'subMenu',
  ADD_TO_CART = 'addToCart',
  SECOND_STEP = 'secondStep',
  VIEW_PRODUCT = 'viewProduct',
  VIEW_PRODUCT_DETAILED = 'productDetailsResponse',
}

export interface WhatsappBtn {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}
