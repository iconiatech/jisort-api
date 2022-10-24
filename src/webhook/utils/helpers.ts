import { sortMenus, sortProducts } from '../../utils';

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
  const opt1 = '*1.* Enter *1* to add to cart',
    opt2 = '*2.* Enter *2* to go back',
    opt3 = '*3.* Back to main menu';

  const prodOptions = `${opt1}\n${opt2}\n${opt3}`;

  const messageResponse = `
        *Product Info*:\n(NB: You have selected *${product.prodName}*)\n\n${prodOptions}`;

  return messageResponse;
};

export const formatProductCartResponse = async (
  product: Product,
): Promise<string> => {
  const firstLine = `Stock Left *${product.prodName}* -- Each @ *${product.prodPrice}*`;

  const opt1 = '*1.* Enter *1* to add to cart',
    opt2 = '*2.* Enter *2* to go back',
    opt3 = '*3.* Back to main menu';

  const prodOptions = `${opt1}\n${opt2}\n${opt3}`;

  const messageResponse = `
        *Product Info*:\n(NB: You have selected *${product.prodName}*)\n\n${firstLine}`;

  return messageResponse;
};
