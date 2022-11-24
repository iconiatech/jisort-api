import { Model, Types } from 'mongoose';
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
    createdMenu.id = new Types.ObjectId().toString();
    return createdMenu.save();
  }

  /**
   * Find a single menu id with the id if it exists.
   *
   * @param id the id of the menu
   * @returns the menu item with the provided id or raises a not found error
   */
  async findOne(id: string): Promise<Menu> {
    let menu: Menu;

    try {
      menu = await this.menuModel.findOne({ id });
    } catch (error) {
      throw new NotFoundException('Could not find the menu item');
    }

    if (!menu) {
      throw new NotFoundException('Could not find the menu item');
    }

    return menu;
  }

  async findMany(ids: string[]): Promise<Menu[]> {
    return this.menuModel.find().where('id').in(ids).exec();
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
    if (
      'subMenus' in attrs &&
      attrs.subMenus.length
    ) {
      const allMenus = [
        ...attrs.subMenus,
        ...menuItem.subMenus,
      ];
      attrs.subMenus = [...new Set(allMenus)];
      console.log(attrs);
    }

    if (
      'menuProductCategories' in attrs &&
      attrs.menuProductCategories.length
    ) {
      const allCategories = [
        ...attrs.menuProductCategories,
        ...menuItem.menuProductCategories,
      ];
      attrs.menuProductCategories = [...new Set(allCategories)];
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

  /**
   * Return the top most menu items for a particular company
   * @param compId the id of the company
   * @returns menu items for the company with the id
   */
  async getTopMostMenus(compId: string): Promise<Menu[]> {
    await this.companiesService.findOne(compId);

    return this.menuModel
      .find({ menuIsTopMost: true })
      .where('compId')
      .in([compId])
      .exec();
  }
}
