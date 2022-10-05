import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateCompanyDto, UpdateCompanyDto } from './dtos';
import { Company, CompanyDocument } from './companies.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const createdCompany = new this.companyModel(createCompanyDto);
    createdCompany.id = new Types.ObjectId().toString();
    return createdCompany.save();
  }

  async findAll(): Promise<Company[]> {
    return this.companyModel.find().exec();
  }

  async findOne(id: string): Promise<Company> {
    let company: Company;

    try {
      company = await this.companyModel.findOne({ id });
    } catch (error) {
      throw new NotFoundException('Could not find the company');
    }

    if (!company) {
      throw new NotFoundException('Could not find the company');
    }

    return company;
  }

  async findByPhoneNumber(compWhatsappNo: string): Promise<Company> {
    let company;

    try {
      company = await this.companyModel.findOne({ compWhatsappNo });
    } catch (error) {
      throw new NotFoundException('Could not find the company');
    }

    if (!company) {
      throw new NotFoundException('Could not find the company');
    }
    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findOne(id);

    Object.assign(company, updateCompanyDto);

    return new this.companyModel(company).save();
  }
}
