import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { Model } from "mongoose";
import { compare } from "bcrypt";
import { UserService } from "./user.service";
import { User, UserDocument } from "./user.model";

const testUserInput = { username: "test-user", password: "Abcde123" };
const { password: _, ...testUser } = testUserInput;

const testUsers = [testUser, { username: "test-user-2" }];

describe("UserService", () => {
  let service: UserService;
  let model: Model<UserDocument>;

  const createTestUserWithPassword = async (password: string): Promise<User> => {
    return service.create({ username: testUserInput.username, password });
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken("User"),
          useValue: {
            create: jest.fn().mockImplementation(({ username }) => ({ username })),
            findOne: jest.fn().mockImplementation(({ username }) => ({
              then: (resolve) => resolve({ username }),
              select: () => ({ username, passwordHash: "zxcv" }),
            })),
            find: jest.fn().mockImplementation(() => testUsers),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<UserDocument>>(getModelToken("User"));
  });

  it("Create user", async () => {
    await expect(service.create(testUserInput)).resolves.toStrictEqual(testUser);

    expect(jest.spyOn(model, "create")).toBeCalledTimes(1);

    // Password hash cannot be (safely) recreated for testing, so test arguments manually.
    const { calls }: any = jest.spyOn(model, "create").mock;
    const call = calls[0][0];
    const { username, passwordHash } = call;
    await expect(compare(testUserInput.password, passwordHash)).resolves.toBe(true);
    expect(username).toBe(testUserInput.username);
  });

  it("Find one user", async () => {
    const { username } = testUser;
    await expect(service.findOne(username)).resolves.toStrictEqual(testUser);
    expect(jest.spyOn(model, "findOne")).toBeCalledWith({ username });
  });

  it("Find one user with password hash", async () => {
    const { username } = testUser;

    await expect(
      service.findOne(username, { withPasswordHash: true }),
    ).resolves.toStrictEqual({
      username,
      passwordHash: "zxcv",
    });

    expect(jest.spyOn(model, "findOne")).toBeCalledWith({ username });
  });

  it("Find all users", async () => {
    await expect(service.findAll()).resolves.toStrictEqual(testUsers);
    expect(jest.spyOn(model, "find")).toBeCalled();
  });

  it("Cannot create user with empty username", async () => {
    await expect(service.create({ ...testUserInput, username: "" })).rejects.toThrow(
      "Username cannot be empty.",
    );
    expect(jest.spyOn(model, "create")).not.toBeCalled();
  });

  it("Cannot create user with empty password", async () => {
    await expect(service.create({ ...testUserInput, password: "" })).rejects.toThrow(
      "Password cannot be empty.",
    );
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
