import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { async } from "rxjs";
import { UserService } from "./user.service";

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken("User"),
          useValue: {
            create: jest
              .fn()
              .mockImplementation(({ username }) => ({ username })),
            // TODO: This mess should be replaced with a library.
            findOne: jest.fn().mockImplementation(({ username }) => ({
              then: (resolve) => resolve({ username }),
              select: () => ({ username, passwordHash: "zxcv" }),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it("Create user", async () => {
    expect(
      await service.create({ username: "asd", password: "123" }),
    ).toStrictEqual({
      username: "asd",
    });
  });

  it("Find one user", async () => {
    expect(await service.findOne("asd")).toStrictEqual({ username: "asd" });
  });

  it("Find one user with password hash", async () => {
    expect(
      await service.findOne("asd", { withPasswordHash: true }),
    ).toStrictEqual({ username: "asd", passwordHash: "zxcv" });
  });
});
