import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';

import { AppController } from './app.controller';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MenusModule } from './menus/menus.module';
import { ProductsModule } from './products/products.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MenusModule,
    ProductsModule,
    CompaniesModule,
    MongooseModule.forRoot('mongodb://localhost:27000/jisort'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
