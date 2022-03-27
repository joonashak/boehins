import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ValidationError } from "apollo-server-express";
import { hash } from "bcrypt";
import { Model } from "mongoose";
import { CreateUserDto } from "./dto/createUser.dto";
import { User, UserDocument } from "./user.model";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    const users = this.userModel.find();
    return users;
  }

  async create(input: CreateUserDto): Promise<User> {
    const { username, password, ...rest } = input;
    this.validateNewUserCredentials(username, password);

    const passwordHash = await hash(password, 12);
    const newUser = await this.userModel.create({
      ...rest,
      username,
      passwordHash,
    });

    return newUser;
  }

  async findOne(
    username: string,
    options?: { withPasswordHash: boolean },
  ): Promise<User> {
    if (options?.withPasswordHash) {
      return this.getUserWithPasswordHash(username);
    }
    return this.getUser(username);
  }

  private async getUser(username: string): Promise<User> {
    return this.userModel.findOne({ username });
  }

  private async getUserWithPasswordHash(username: string): Promise<User> {
    return this.userModel.findOne({ username }).select("+passwordHash");
  }

  /**
   * Enforce some level of credential quality even at service-level.
   */
  private validateNewUserCredentials(username: string, password: string): void {
    if (!username) {
      throw new ValidationError("Username cannot be empty.");
    }

    if (!password) {
      throw new ValidationError("Password cannot be empty");
    }

    const qualityChecks = [
      password.length > 7,
      password.match(/[a-z]/),
      password.match(/[A-Z]/),
      password.match(/\d/),
    ];

    if (!qualityChecks.every((c) => c)) {
      throw new ValidationError("The password is not strong enough.");
    }
  }
}
