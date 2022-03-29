import { JwtModule } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { hashSync } from "bcrypt";
import { JWT_LIFETIME, JWT_SECRET } from "../config";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { SessionService } from "./session/session.service";

const testUserInput = { username: "test-user", password: "Abcde123" };
const { password: _, ...testUser } = testUserInput;

describe("AuthService", () => {
  let authService: AuthService;
  let userService: UserService;

  beforeAll(async () => {
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
            findOne: jest.fn(() => ({
              username: testUser.username,
              passwordHash: hashSync(testUserInput.password, 12),
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

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it("Validate legit user correctly", async () => {
    const { username, password } = testUserInput;
    await expect(authService.validateUser(username, password)).resolves.toStrictEqual(
      testUser,
    );
    expect(userService.findOne).toBeCalled();
  });

  it("Invalidate unknown user", async () => {
    jest.spyOn(userService, "findOne").mockResolvedValueOnce(null);
    await expect(
      authService.validateUser("", testUserInput.password),
    ).resolves.toBeNull();
  });

  it("Invalidate wrong password", async () => {
    await expect(
      authService.validateUser(testUserInput.username, ""),
    ).resolves.toBeNull();
  });
});
