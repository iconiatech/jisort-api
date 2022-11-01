import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserStepDocument = UserStep & Document;

@Schema()
export class UserStep {
  @Prop({ required: true })
  menuId: string;

  @Prop({ required: true })
  phoneNumberId: string;

  @Prop()
  lastAccessAction: string;

  @Prop({ required: true })
  lastAccessTime: string;

  @Prop()
  prevChoices: string[];
}

export const UserStepSchema = SchemaFactory.createForClass(UserStep);
