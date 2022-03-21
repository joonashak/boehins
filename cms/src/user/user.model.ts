import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuid } from "uuid";

@ObjectType()
@Schema()
export class User {
  @Field()
  @Prop({ default: uuid, unique: true })
  id: string;

  @Field()
  @Prop()
  username: string;

  @Field()
  @Prop({ select: false })
  passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
