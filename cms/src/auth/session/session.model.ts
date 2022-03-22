import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@ObjectType()
@Schema({ collection: "sessions" })
export class Session {
  @Field()
  @Prop({ unique: true })
  tokenHash: string;

  @Field()
  @Prop({ type: Date })
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
export type SessionDocument = Session & Document;
