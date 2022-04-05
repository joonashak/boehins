import { ExecutionContext } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { createMock } from "@golevelup/ts-jest";
import ms from "ms";
import { SessionService } from "../session/session.service";
import { TokenAuthGuard } from "./tokenAuth.guard";

const createContextWithHeaders = (headers: any): ExecutionContext => {
  const args: any = [{}, {}, { req: { headers } }, {}];
  const context = createMock<ExecutionContext>({
    getArgs: () => args,
    getType: () => "graphql",
  });
  return context;
};

describe("TokenAuthGuard", () => {
  let sessionService: SessionService;
  let jwtService: JwtService;
  let guard: TokenAuthGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: "asd",
          signOptions: { expiresIn: "30d" },
        }),
      ],
      providers: [
        {
          provide: SessionService,
          useFactory: () => ({
            findOneById: jest.fn(),
          }),
        },
        {
          provide: getModelToken("Session"),
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    sessionService = module.get<SessionService>(SessionService);
    guard = new TokenAuthGuard(jwtService, sessionService);
  });

  it("Is defined", () => {
    expect(guard).toBeDefined();
  });

  it("Access granted with valid token and session", async () => {
    const accessToken = jwtService.sign({ sessionId: "jkl" });
    const context = createContextWithHeaders({ accesstoken: accessToken });
    jest.spyOn(sessionService, "findOneById").mockResolvedValueOnce({
      id: "jkl",
      expiresAt: new Date(Date.now() + ms("30d")),
      user: { username: "asd", id: "asd" },
    });

    await expect(guard.canActivate(context)).resolves.toEqual(true);
    expect(sessionService.findOneById).toBeCalledWith("jkl");
    expect(sessionService.findOneById).toBeCalledTimes(1);
  });
});
