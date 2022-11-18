import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CompanyDocument = Company & Document;

@Schema()
export class Company {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  compName: string;

  @Prop({ required: true })
  compPhone: string;

  @Prop()
  compWhatsappNo: string;

  @Prop()
  compTillNo: string;

  @Prop({ required: true })
  compDescription: string;

  @Prop({ required: true })
  compLocation: string;

  @Prop({ required: true })
  compType: string;

  @Prop()
  compBearerToken: string;

  @Prop()
  isActive: boolean;

  @Prop({ required: true })
  inactiveMessage: string;

  @Prop()
  compOpeningTime: string;

  @Prop()
  compClosingTime: string;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
