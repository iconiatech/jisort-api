import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MenusService } from './menus.service';
import { Menu, MenuSchema } from './menus.schema';
import { MenusController } from './menus.controller';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  exports: [MenusService],
  providers: [MenusService],
  controllers: [MenusController],
  imports: [
    MongooseModule.forFeature([
      {
        name: Menu.name,
        schema: MenuSchema,
      },
    ]),
    CompaniesModule,
  ],
})
export class MenusModule {}
