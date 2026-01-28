import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Migration extends Document {
  @Prop({ required: true, unique: true })
  fileName: string;

  @Prop({ required: true })
  version: string;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  name: string;
}

export const MigrationSchema = SchemaFactory.createForClass(Migration);
