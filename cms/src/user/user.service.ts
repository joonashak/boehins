import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
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
    const { password, ...rest } = input;
    const passwordHash = await hash(password, 12);
    const newUser = await this.userModel.create({ ...rest, passwordHash });
    return newUser;
  }
}
