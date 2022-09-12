import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

import { Product, ProductDocument } from './products.schema';
import { CreateProductDto } from './dtos/create-product.dto';
import { MenusService } from '../menus/menus.service';
import { CompaniesService } from '../companies/companies.service';
import { ProductsCategoryService } from './products.categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productsModel: Model<ProductDocument>,
    private menusService: MenusService,
    private companiesService: CompaniesService,
    private categoriesService: ProductsCategoryService,
  ) {}

  /**
   * Create new product
   *
   * @param productDto
   * @returns Promise<Product>
   */
  async create(productDto: CreateProductDto): Promise<Product> {
    await this.companiesService.findOne(productDto.compId);

    // productDto.prodCategories.map(async (catId) => {
    //   await this.categoriesService.findOne(catId);
    //   // try {
    //   // } catch (error) {
    //   //   throw new BadRequestException(`Could not find the category '${catId}'`);
    //   // }
    // });

    const createdProduct = new this.productsModel(productDto);
    return createdProduct.save();
  }

  /**
   * Find a single product id with the id if it exists.
   *
   * @param id the id of the product
   * @returns the product item with the
   * provided id or raises a not found error
   */
  async findOne(id: string): Promise<Product> {
    let product: Product;

    try {
      product = await this.productsModel.findById(id);
    } catch (error) {
      throw new NotFoundException('Could not find the product');
    }

    if (!product) {
      throw new NotFoundException('Could not find the product');
    }
    return product;
  }

  /**
   * Return the products for a particular company
   * @param compId the id of the company
   * @returns products for the company with the id
   */
  async getCompanyProducts(compId: string): Promise<Product[]> {
    await this.companiesService.findOne(compId);

    return this.productsModel.find().where('compId').in([compId]).exec();
  }

  /**
   * Return the products for a particular categories
   * @param catIds the category ids
   * @returns products for the categories with the id
   */
  async getCategoryProducts(catIds: string[]): Promise<Product[]> {
    return this.productsModel.find().where('prodCategories').in(catIds).exec();
  }

  /**
   * Return the products for a particular menu item
   * @param menuId the menu id
   * @returns products for the menu item with the id
   */
  async getMenuProducts(menuId: string): Promise<Product[]> {
    const menuItem = await this.menusService.findOne(menuId);
    const categories = menuItem.menuCategories;

    return this.getCategoryProducts(categories);
  }
}
