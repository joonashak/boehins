import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { User } from "../user/user.model";
import { UserService } from "../user/user.service";
import { LoginResponse } from "./dto/loginResponse.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.findOne(username, {
      withPasswordHash: true,
    });

    if (user && (await compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  async getToken(user: User): Promise<LoginResponse> {
    const payload = { username: user.username };
    const accessToken = this.jwtService.sign(payload);
    const { iat, exp }: any = this.jwtService.decode(accessToken);
    console.log(new Date(iat * 1000));
    console.log(new Date(exp * 1000));
    return {
      accessToken,
    };
  }
}
