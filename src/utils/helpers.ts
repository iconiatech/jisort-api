import { Menu } from '../menus/menus.schema';

export const checkIsValidNumber = (value: string): boolean => {
  return !isNaN(parseInt(value)) && !isNaN(parseFloat(value));
};

export const sortMenus = (menus: Menu[]) => {
  return menus.sort((a, b) => a.menuNumber - b.menuNumber);
};
