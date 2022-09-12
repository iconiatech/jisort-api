import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ProductCategoryDocument = ProductCategory & Document;

@Schema()
export class ProductCategory {
  @Prop({ required: true })
  catName: string;

  @Prop({ required: true })
  compId: string;

  @Prop()
  isActive: boolean;

  @Prop({ required: true })
  inactiveMessage: string;
}

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory);
