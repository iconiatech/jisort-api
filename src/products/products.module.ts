import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MenusModule } from '../menus/menus.module';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './products.schema';
import { ProductsController } from './products.controller';
import { CompaniesModule } from '../companies/companies.module';
import { ProductsCategoryService } from './products.categories.service';
import {
  ProductCategory,
  ProductCategorySchema,
} from './products.categories.schema';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsCategoryService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: ProductCategory.name,
        schema: ProductCategorySchema,
      },
    ]),
    MenusModule,
    CompaniesModule,
  ],
})
export class ProductsModule {}
