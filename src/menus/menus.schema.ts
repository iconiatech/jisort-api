import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MenuDocument = Menu & Document;

@Schema()
export class Menu {
  @Prop({ required: true })
  compId: string;

  @Prop({ required: true })
  menuTitle: string;

  //Could be Send Ticket, MPesa Prompt etc
  @Prop({ required: true })
  menuActionType: string;

  //Could be string, number etc
  @Prop({ required: true })
  menuActionResponseType: string;

  //For high level one question and answer type
  @Prop()
  menuAnswer: string;

  @Prop()
  menuNumber: number;

  @Prop()
  menuCategories: string[];

  @Prop()
  menuParentId: string;

  @Prop()
  subMenus: string[];

  @Prop()
  isActive: boolean;

  @Prop({ required: true })
  inactiveMessage: string;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
