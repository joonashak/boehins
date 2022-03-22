import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JWT_LIFETIME, JWT_SECRET } from "../config";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { SessionModule } from "./session/session.module";

@Module({
  imports: [
    UserModule,
    SessionModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_LIFETIME },
    }),
  ],
  providers: [UserService, AuthService, AuthResolver],
})
export class AuthModule {}
