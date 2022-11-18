import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserCartDocument = UserCart & Document;

@Schema()
export class UserCart {
  @Prop({ required: true })
  compId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  productQty: number;

  @Prop({ required: true })
  productPrice: number;

  @Prop({ required: true })
  phoneNumberFrom: string;

  @Prop({ required: true })
  lastAccessTime: string;
}

export const UserCartSchema = SchemaFactory.createForClass(UserCart);
