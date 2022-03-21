import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { LoginResponse } from "./dto/loginResponse.dto";

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  // TODO: Create LoginGuard to handle acual auth.
  @Mutation((returns) => LoginResponse)
  async login(
    @Args("username") username: string,
    @Args("password") password: string,
  ): Promise<LoginResponse> {
    return { accessToken: "asdasd" };
  }
}
