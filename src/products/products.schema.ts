import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  prodNumber: string;

  @Prop({ required: true })
  prodName: string;

  @Prop({ required: true })
  compId: string;

  @Prop({ required: true })
  prodStockLeft: number;

  @Prop()
  prodCategories: string[];

  @Prop({ required: true })
  isActive: boolean;

  @Prop({ required: true })
  inactiveMessage: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
