import { sortMenus } from '../../utils';
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

  // const sortedMenus = sortMenus(menus.filter((m) => m.isActive));

  products.forEach((prod, i) => {
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
  // const newStr = ``;

  // const sortedMenus = sortMenus(menus.filter((m) => m.isActive));

  const messageResponse = `
        *Main Menu*:\n(NB: Please enter the appropriate number in the *Main Menu* then click send to continue)
        *1.* Enter the number *Quantity* you want to purchase 
        `;

  return messageResponse;
};
