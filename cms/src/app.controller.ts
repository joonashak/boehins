import { Controller, UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { AppService } from "./app.service";
import { TokenAuthGuard } from "./auth/guards/tokenAuth.guard";

@Resolver()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(TokenAuthGuard)
  @Query(() => String)
  getHello(): string {
    return this.appService.getHello();
  }
}
