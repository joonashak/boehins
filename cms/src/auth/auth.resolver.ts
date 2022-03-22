import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { User } from "../user/user.model";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/user.decorator";
import { LoginResponse } from "./dto/loginResponse.dto";
import { LoginGuard } from "./guards/login.guard";

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @UseGuards(LoginGuard)
  @Mutation((returns) => LoginResponse)
  async login(
    @Args("username") username: string,
    @Args("password") password: string,
    @CurrentUser() user: User,
  ): Promise<LoginResponse> {
    return this.authService.getToken(user);
  }
}
