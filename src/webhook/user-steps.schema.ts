import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserStepDocument = UserStep & Document;

@Schema()
export class UserStep {
  @Prop({ required: true })
  phoneNumberId: string;

  @Prop({ required: true })
  menuId: string;

  @Prop({ required: true })
  lastAccessTime: string;
}

export const UserStepSchema = SchemaFactory.createForClass(UserStep);
