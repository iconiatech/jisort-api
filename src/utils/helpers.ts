import { Menu } from '../menus/menus.schema';
import { Product } from '../products/products.schema';

export const checkIsValidNumber = (value: string): boolean => {
  return !isNaN(parseInt(value)) && !isNaN(parseFloat(value));
};

export const sortMenus = (menus: Menu[]) => {
  return menus.sort((a, b) => a.menuNumber - b.menuNumber);
};

export const sortProducts = (products: Product[]) => {
  return products.sort((a, b) => a.prodMenuNumber - b.prodMenuNumber);
};
