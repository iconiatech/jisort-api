import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MenuDocument = Menu & Document;

@Schema()
export class Menu {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  compId: string;

  @Prop({ required: true })
  menuTitle: string;

  //Could be Send Ticket, MPesa Prompt etc
  @Prop({ required: true })
  menuActionType: string;

  @Prop({ required: true })
  menuIsTopMost: boolean;

  @Prop({ required: false })
  menuOrderNo: number;

  //Could be string, number etc
  @Prop({ required: true })
  menuActionResponseType: string;

  //For high level one question and answer type
  @Prop()
  menuAnswer: string;

  @Prop()
  menuNumber: number;

  @Prop()
  menuProductCategories: string[];

  @Prop()
  menuParentId: string;

  @Prop()
  subMenus: string[];

  @Prop()
  isActive: boolean;

  @Prop({ required: true })
  inactiveMessage: string;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
