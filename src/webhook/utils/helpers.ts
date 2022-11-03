import { sortMenus, sortProducts } from '../../utils';

import { UserCart } from '../user-cart.schema';
import { Menu } from '../../menus/menus.schema';
import { Product } from '../../products/products.schema';
import { Company } from '../../companies/companies.schema';

export const isCompOpen = async (comp: Company) => {
  let isActive = true;
  const openingTime = parseInt(comp.compOpeningTime);
  const closingTime = parseInt(comp.compClosingTime);

  const currentDate = new Date();

  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();

  const hh = hours < 10 ? `0${hours}` : `${hours}`;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;

  const currentTime = parseInt(`${hh}${mm}`);

  if (currentTime < openingTime || currentTime > closingTime) {
    isActive = false;
  }

  return isActive;
};

export const checkIsActiveComp = async (comp: Company): Promise<boolean> => {
  const isOpen = isCompOpen(comp);
  const isActive = comp.isActive;

  return isOpen && isActive;
};

export const formatMenusResponse = async (menus: Menu[]): Promise<string> => {
  let newStr = ``;

  const sortedMenus = sortMenus(menus.filter((m) => m.isActive));

  sortedMenus.forEach((menu, i) => {
    const item = `\n*${i + 1}*. ${menu.menuTitle}`;
    newStr += item;
  });

  const messageResponse = `
        *Main Menu*:\n(NB: Please enter the appropriate number in the *Main Menu* then click send to continue)
        ${newStr}
        `;

  return messageResponse;
};

export const formatProductsResponse = async (
  products: Product[],
): Promise<string> => {
  let newStr = ``;

  const sortedProducts = sortProducts(products.filter((p) => p.isActive));

  sortedProducts.forEach((prod, i) => {
    const item = `\n*${i + 1}*. ${prod.prodName}`;
    newStr += item;
  });

  const messageResponse = `
        *Main Menu*:\n(NB: Please enter the appropriate number in the *Main Menu* then click send to continue)
        ${newStr}
        `;

  return messageResponse;
};

export const formatDetailedProductResponse = async (
  product: Product,
): Promise<string> => {
  const firstLine = `Stock Left *${product.prodStockLeft}* -- Each @ *${product.prodPrice}*\n`;

  const opt1 = '*1.* Enter the *Qty* to add to cart\n';

  const prodOptions = `${opt1}`;

  const messageResponse = `
        *Product Info*:\n(NB: You have selected *${product.prodName}*)\n${firstLine}\n${prodOptions}`;

  return messageResponse;
};

export const formatProductCartResponse = async (
  items: UserCart[],
): Promise<string> => {
  const firstLine = `You have *${items.length}* items in cart totaling *Total*`;

  let newStr = ``;

  items.forEach((it, i) => {
    const item = `\n*${i + 1}*. ${it.productName} -- *${it.productQty}* x *${
      it.productPrice
    }*`;
    newStr += item;
  });

  const opt1 = '=====================================\n',
    opt2 = '*P.* Enter *P* to proceed to pay',
    opt3 = '*B.* Enter *B* to go back to view products',
    opt4 = '*Q.* Enter *Q* clear cart and go back to the main menu';

  const menuOptions = `${opt1}\n${opt2}\n${opt3}\n${opt4}`;

  const messageResponse = `
        *Cart Info*:\n${firstLine}\n${newStr}\n${menuOptions}`;

  return messageResponse;
};
