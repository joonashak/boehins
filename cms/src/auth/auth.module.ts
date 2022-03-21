import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JWT_LIFETIME, JWT_SECRET } from "../config";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_LIFETIME },
    }),
  ],
  providers: [UserService, AuthService, AuthResolver],
})
export class AuthModule {}
