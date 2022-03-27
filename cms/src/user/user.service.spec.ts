import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { Model } from "mongoose";
import { compare } from "bcrypt";
import { UserService } from "./user.service";
import { UserDocument } from "./user.model";

describe("UserService", () => {
  let service: UserService;
  let model: Model<UserDocument>;

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
            findOne: jest.fn().mockImplementation(({ username }) => ({
              then: (resolve) => resolve({ username }),
              select: () => ({ username, passwordHash: "zxcv" }),
            })),
            find: jest
              .fn()
              .mockImplementation(() => [
                { username: "test1" },
                { username: "test2" },
              ]),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<UserDocument>>(getModelToken("User"));
  });

  it("Create user", async () => {
    expect(
      await service.create({ username: "asd", password: "123" }),
    ).toStrictEqual({
      username: "asd",
    });

    expect(jest.spyOn(model, "create")).toBeCalledTimes(1);

    // Password hash cannot be (safely) recreated for testing, so test arguments manually.
    const { calls }: any = jest.spyOn(model, "create").mock;
    const call = calls[0][0];
    const { username, passwordHash } = call;
    expect(await compare("123", passwordHash)).toBe(true);
    expect(username).toBe("asd");
  });

  it("Find one user", async () => {
    expect(await service.findOne("asd")).toStrictEqual({ username: "asd" });
    expect(jest.spyOn(model, "findOne")).toBeCalledWith({ username: "asd" });
  });

  it("Find one user with password hash", async () => {
    expect(
      await service.findOne("asd", { withPasswordHash: true }),
    ).toStrictEqual({ username: "asd", passwordHash: "zxcv" });

    expect(jest.spyOn(model, "findOne")).toBeCalledWith({ username: "asd" });
  });

  it("Find all users", async () => {
    expect(await service.findAll()).toStrictEqual([
      { username: "test1" },
      { username: "test2" },
    ]);

    expect(jest.spyOn(model, "find")).toBeCalled();
  });

  // FIXME: These tests won't pass -> fix UserService!
  it("Cannot create user with empty username", async () => {
    expect(await service.create({ username: "", password: "123" })).toThrow();
    expect(jest.spyOn(model, "create")).not.toBeCalled;
  });

  it("Cannot create user with empty password", async () => {
    expect(await service.create({ username: "asd", password: "" })).toThrow();
    expect(jest.spyOn(model, "create")).not.toBeCalled;
  });
});
