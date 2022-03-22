import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
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
  ): Promise<LoginResponse> {
    return { accessToken: "asdasd" };
  }
}
