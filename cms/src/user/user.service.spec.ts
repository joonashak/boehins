import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
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
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it("Create user", async () => {
    expect(await service.create({ username: "asd", password: "123" })).toStrictEqual({
      username: "asd",
    });
  });
});
