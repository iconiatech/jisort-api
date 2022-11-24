import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';

import { AppController } from './app.controller';

import { UsersModule } from './users/users.module';
import { MenusModule } from './menus/menus.module';
import { WebhookModule } from './webhook/webhook.module';
import { ProductsModule } from './products/products.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [
    UsersModule,
    MenusModule,
    WebhookModule,
    ProductsModule,
    CompaniesModule,
    MongooseModule.forRoot('mongodb+srv://voke254:voke%40254nm@cluster0.wghqgt0.mongodb.net/test'),
    // mongodb+srv://voke254:voke%40254nm@cluster0.wghqgt0.mongodb.net/test
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
