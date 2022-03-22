import { Field, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/user.model";

@ObjectType()
@Schema({ collection: "sessions" })
export class Session {
  @Field()
  @Prop({ unique: true })
  tokenHash: string;

  @Field()
  @Prop({ type: Date })
  expiresAt: Date;

  @Field((type) => User)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  user: User;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
export type SessionDocument = Session & Document;
