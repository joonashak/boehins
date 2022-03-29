import { JwtModule } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { JWT_LIFETIME, JWT_SECRET } from "../../config";
import { UserService } from "../../user/user.service";
import { AuthService } from "../auth.service";
import { SessionService } from "../session/session.service";
import { LoginGuard } from "./login.guard";

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
            findOne: jest.fn(() => ({})),
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
});
