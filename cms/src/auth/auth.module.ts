import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JWT_LIFETIME, JWT_SECRET } from "../config";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_LIFETIME },
    }),
  ],
  providers: [UserService, LocalStrategy, AuthService],
})
export class AuthModule {}
