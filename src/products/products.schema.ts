import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  prodNumber: string;

  @Prop({ required: true })
  prodName: string;

  @Prop({ required: true })
  compId: string;

  @Prop({ required: true })
  prodPrice: number;

  @Prop({ required: true })
  prodStockLeft: number;

  @Prop({ required: true })
  prodMenuNumber: number;

  @Prop()
  prodCategories: string[];

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ required: true })
  inactiveMessage: string;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
