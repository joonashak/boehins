import { JwtModule, JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { hashSync } from "bcrypt";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { SessionService } from "./session/session.service";

const testUserInput = { username: "test-user", password: "Abcde123" };
const { password: _, ...testUser } = testUserInput;

describe("AuthService", () => {
  let authService: AuthService;
  let userService: UserService;
  let sessionService: SessionService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: "asd",
          signOptions: { expiresIn: "30d" },
        }),
      ],
      providers: [
        AuthService,
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
          provide: SessionService,
          useFactory: () => ({
            create: jest.fn(),
          }),
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    sessionService = module.get<SessionService>(SessionService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("Validate legit user correctly", async () => {
    const { username, password } = testUserInput;
    await expect(authService.validateUser(username, password)).resolves.toStrictEqual(
      testUser,
    );
    expect(userService.findOne).toBeCalledWith(username, { withPasswordHash: true });
    expect(userService.findOne).toBeCalledTimes(1);
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
    await expect(
      authService.validateUser(testUserInput.username, testUserInput.password.slice(1)),
    ).resolves.toBeNull();
  });

  it("Creates valid JWT tokens", async () => {
    jest.spyOn(sessionService, "create").mockResolvedValueOnce({
      id: "123",
      expiresAt: new Date(),
      user: { username: "asd", id: "456" },
    });

    const { accessToken } = await authService.getToken({ username: "asd", id: "456" });

    expect(() => jwtService.verify(accessToken)).not.toThrow();

    const payload = jwtService.decode(accessToken);
    expect(payload).toHaveProperty("sessionId", "123");
    expect(payload).toHaveProperty("exp");
    expect(payload).toHaveProperty("iat");
  });
});
