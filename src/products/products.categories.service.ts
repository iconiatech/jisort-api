import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  NotFoundException,
  //   BadRequestException,
} from '@nestjs/common';

import {
  ProductCategory,
  ProductCategoryDocument,
} from './products.categories.schema';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class ProductsCategoryService {
  constructor(
    @InjectModel(ProductCategory.name)
    private prodCatModel: Model<ProductCategoryDocument>,
    private companiesService: CompaniesService,
  ) {}

  /**
   * Create new product category
   *
   * @param categoryDto
   * @returns Promise<ProductCategory>
   */
  async create(categoryDto: CreateCategoryDto): Promise<ProductCategory> {
    await this.companiesService.findOne(categoryDto.compId);
    const createdCategory = new this.prodCatModel(categoryDto);
    createdCategory.id = new Types.ObjectId().toString();
    return createdCategory.save();
  }

  /**
   * Find a single product category id with the id if it exists.
   *
   * @param id the id of the product category
   * @returns the product category item with the
   * provided id or raises a not found error
   */
  async findOne(id: string): Promise<ProductCategory> {
    let category: ProductCategory;

    try {
      category = await this.prodCatModel.findOne({ id });
    } catch (error) {
      throw new NotFoundException('Could not find the category');
    }

    if (!category) {
      throw new NotFoundException('Could not find the category');
    }
    return category;
  }

  /**
   * Return the categories for a particular company
   * @param compId the id of the company
   * @returns categories for the company with the id
   */
  async getCompanyCategories(compId: string): Promise<ProductCategory[]> {
    await this.companiesService.findOne(compId);

    return this.prodCatModel.find().where('compId').in([compId]).exec();
  }
}
