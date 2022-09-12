import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CompaniesService } from './companies.service';
import { Company, CompanySchema } from './companies.schema';
import { CompaniesController } from './companies.controller';

@Module({
  exports: [CompaniesService],
  providers: [CompaniesService],
  controllers: [CompaniesController],
  imports: [
    MongooseModule.forFeature([
      {
        name: Company.name,
        schema: CompanySchema,
      },
    ]),
  ],
})
export class CompaniesModule {}
