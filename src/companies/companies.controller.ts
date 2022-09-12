import { Controller, Get, Post, Body, Param } from '@nestjs/common';

import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dtos/create-company-dto';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  getAll() {
    return this.companiesService.findAll();
  }

  @Post()
  create(@Body() body: CreateCompanyDto) {
    return this.companiesService.create(body);
  }

  @Get('/:id')
  getSingle(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }
}
