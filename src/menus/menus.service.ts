import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { Menu, MenuDocument } from './menus.schema';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class MenusService {
  constructor(
    @InjectModel(Menu.name) private menuModel: Model<MenuDocument>,
    private companiesService: CompaniesService,
  ) {}

  /**
   * Create new menu items
   *
   * @param createMenuDto
   * @returns Promise<Menu>
   */
  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    await this.companiesService.findOne(createMenuDto.compId);
    const createdMenu = new this.menuModel(createMenuDto);
    return createdMenu.save();
  }

  /**
   * Find a single menu id with the id if it exists.
   *
   * @param id the id of the menu
   * @returns the menu item with the provided id or raises a not found error
   */
  async findOne(id: string): Promise<Menu> {
    let menu;

    try {
      menu = await this.menuModel.findById(id);
    } catch (error) {
      throw new NotFoundException('Could not find the menu item');
    }

    if (!menu) {
      throw new NotFoundException('Could not find the menu item');
    }
    return menu;
  }

  async findMany(ids: string[]): Promise<Menu[]> {
    return this.menuModel.find().where('_id').in(ids).exec();
  }

  async getSingle(id: string) {
    const menuItem = await this.findOne(id);
    const subMenus = await this.findMany(menuItem.subMenus);

    return { menuItem, subMenus };
  }

  /**
   * Update the details of a menu item
   * @param id the menu item id
   * @param attrs menu attributes to be updated
   * @returns the updated menu item
   */
  async update(id: string, attrs: Partial<Menu>): Promise<Menu> {
    const menuItem = await this.findOne(id);

    // Update the parent menus subMenus array
    if ('menuParentId' in attrs && attrs.menuParentId.length) {
      console.log('Do somethig here');
      if (attrs.menuParentId === menuItem.menuParentId) {
        throw new BadRequestException(
          'The menu parent cannot be the same menu',
        );
      }
      // // Get the paremt menu
      const parentMenu = await this.findOne(attrs.menuParentId);
      parentMenu.subMenus.push(id);
      await new this.menuModel(parentMenu).save();
    }

    Object.assign(menuItem, attrs);

    return new this.menuModel(menuItem).save();
  }

  /**
   * Return the menu items for a particular company
   * @param compId the id of the company
   * @returns menu items for the company with the id
   */
  async getCompanyMenus(compId: string): Promise<Menu[]> {
    await this.companiesService.findOne(compId);

    return this.menuModel.find().where('compId').in([compId]).exec();
  }
}
