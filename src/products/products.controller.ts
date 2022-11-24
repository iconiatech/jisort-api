import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';

import { ProductsService } from './products.service';
import { ProductsCategoryService } from './products.categories.service';

import { CreateProductDto, CreateCategoryDto, UpdateProductDto } from './dtos';

@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private categoriesService: ProductsCategoryService,
  ) {}

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.productsService.create(body);
  }

  @Put('/:id')
  updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productsService.update(id, body);
  }

  @Get('/company/:compId')
  getCompanyProducts(@Param('compId') compId: string) {
    return this.productsService.getCompanyProducts(compId);
  }

  @Get('/category/:catId')
  getCategoryProducts(@Param('catId') catId: string) {
    return this.productsService.getCategoryProducts([catId]);
  }

  @Get('/menu/:menuId')
  getMenuProducts(@Param('menuId') menuId: string) {
    return this.productsService.getMenuProducts(menuId);
  }

  //   Category Routes

  @Post('/categories')
  createCategory(@Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body);
  }

  @Get('/categories/company/:compId')
  getCompanyCategories(@Param('compId') compId: string) {
    return this.categoriesService.getCompanyCategories(compId);
  }
}
