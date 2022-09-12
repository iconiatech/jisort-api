import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateCompanyDto } from './dtos/create-company-dto';
import { Company, CompanyDocument } from './companies.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const createdCompany = new this.companyModel(createCompanyDto);
    return createdCompany.save();
  }

  async findAll(): Promise<Company[]> {
    return this.companyModel.find().exec();
  }

  async findOne(id: string): Promise<Company> {
    let company;

    try {
      company = await this.companyModel.findById(id);
    } catch (error) {
      throw new NotFoundException('Could not find the company');
    }

    if (!company) {
      throw new NotFoundException('Could not find the company');
    }
    return company;
  }
}
