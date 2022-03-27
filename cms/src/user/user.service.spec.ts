import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { Model } from "mongoose";
import { compare } from "bcrypt";
import { UserService } from "./user.service";
import { User, UserDocument } from "./user.model";

const testUser = { username: "test-user", password: "Abcde123" };

describe("UserService", () => {
  let service: UserService;
  let model: Model<UserDocument>;

  const createTestUserWithPassword = async (
    password: string,
  ): Promise<User> => {
    return service.create({ username: testUser.username, password });
  };

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
    expect(await service.create(testUser)).toStrictEqual({
      username: testUser.username,
    });

    expect(jest.spyOn(model, "create")).toBeCalledTimes(1);

    // Password hash cannot be (safely) recreated for testing, so test arguments manually.
    const { calls }: any = jest.spyOn(model, "create").mock;
    const call = calls[0][0];
    const { username, passwordHash } = call;
    expect(await compare(testUser.password, passwordHash)).toBe(true);
    expect(username).toBe(testUser.username);
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

  it("Cannot create user with empty username", async () => {
    await expect(
      service.create({ username: "", password: "123" }),
    ).rejects.toThrow();
    expect(jest.spyOn(model, "create")).not.toBeCalled();
  });

  it("Cannot create user with empty password", async () => {
    await expect(
      service.create({ username: "asd", password: "" }),
    ).rejects.toThrow();
    expect(jest.spyOn(model, "create")).not.toBeCalled();
  });

  it("Enforce basic password strength", async () => {
    const msg = "The password is not strong enough.";
    await expect(createTestUserWithPassword("Abc1234")).rejects.toThrow(msg);
    await expect(createTestUserWithPassword("Abcedfgh")).rejects.toThrow(msg);
    await expect(createTestUserWithPassword("abcd1234")).rejects.toThrow(msg);
    await expect(createTestUserWithPassword("ABCD1234")).rejects.toThrow(msg);
    expect(jest.spyOn(model, "create")).not.toBeCalled();
  });
});
