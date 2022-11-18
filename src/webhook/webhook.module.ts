import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserCart, UserCartSchema } from './user-cart.schema';
import { UserStep, UserStepSchema } from './user-steps.schema';

import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';

import { MenusModule } from '../menus/menus.module';
import { ProductsModule } from '../products/products.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  providers: [WebhookService],
  controllers: [WebhookController],
  imports: [
    MongooseModule.forFeature([
      {
        name: UserStep.name,
        schema: UserStepSchema,
      },
      {
        name: UserCart.name,
        schema: UserCartSchema,
      },
    ]),
    MenusModule,
    ProductsModule,
    CompaniesModule,
  ],
})
export class WebhookModule {}
