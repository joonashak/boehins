import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { User } from "../user/user.model";
import { UserService } from "../user/user.service";
import { LoginResponse } from "./dto/loginResponse.dto";
import { SessionService } from "./session/session.service";

export type JwtPayload = { sessionId: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
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

  /**
   * Create new session and get a corresponding JWT token.
   * @param user User to link to session.
   * @returns Object with JWT token to be saved client-side.
   */
  async getToken(user: User): Promise<LoginResponse> {
    const session = await this.sessionService.create(user);
    const payload: JwtPayload = { sessionId: session.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }
}
