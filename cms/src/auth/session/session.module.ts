import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { JWT_LIFETIME, JWT_SECRET } from "../../config";
import { Session, SessionSchema } from "./session.model";
import { SessionService } from "./session.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_LIFETIME },
    }),
  ],
  providers: [SessionService],
  exports: [MongooseModule, SessionService],
})
export class SessionModule {}
