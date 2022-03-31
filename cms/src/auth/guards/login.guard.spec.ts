import { ExecutionContext } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { createMock } from "@golevelup/ts-jest";
import { JWT_LIFETIME, JWT_SECRET } from "../../config";
import { UserService } from "../../user/user.service";
import { AuthService } from "../auth.service";
import { SessionService } from "../session/session.service";
import { LoginGuard } from "./login.guard";
import { GraphQLExecutionContext } from "@nestjs/graphql";
import { hash } from "bcrypt";
import { AuthenticationError } from "apollo-server-express";

describe("LoginGuard", () => {
  let guard: LoginGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: JWT_LIFETIME },
        }),
      ],
      providers: [
        AuthService,
        SessionService,
        {
          provide: UserService,
          useFactory: () => ({
            findOne: jest.fn(async () => ({
              username: "admin",
              passwordHash: await hash("Abcd1234", 12),
            })),
          }),
        },
        {
          provide: getModelToken("Session"),
          useValue: {
            create: jest.fn().mockImplementation(() => {}),
          },
        },
      ],
    }).compile();

    const service = module.get<AuthService>(AuthService);
    guard = new LoginGuard(service);
  });

  it("Is defined", () => {
    expect(guard).toBeDefined();
  });

  it("Can login with valid credentials", async () => {
    const ggg = createMock<GraphQLExecutionContext>();
    const args: any = [{}, { username: "admin", password: "Abcd1234" }, ggg, {}];
    const context = createMock<ExecutionContext>({
      getArgs: () => args,
      getType: () => "graphql",
    });

    await expect(guard.canActivate(context)).resolves.toEqual(true);
  });

  it("Cannot login with wrong password", async () => {
    const ggg = createMock<GraphQLExecutionContext>();
    const args: any = [{}, { username: "admin", password: "Abcd12345" }, ggg, {}];
    const context = createMock<ExecutionContext>({
      getArgs: () => args,
      getType: () => "graphql",
    });

    await expect(guard.canActivate(context)).rejects.toThrowError(AuthenticationError);
  });
});
