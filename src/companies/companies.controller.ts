import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';

import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dtos';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  async getAll() {
    return await this.companiesService.findAll();
  }

  @Post()
  async create(@Body() body: CreateCompanyDto) {
    return await this.companiesService.create(body);
  }

  @Get('/:id')
  async getSingle(@Param('id') id: string) {
    return await this.companiesService.findOne(id);
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() body: UpdateCompanyDto) {
    return await this.companiesService.update(id, body);
  }
}
